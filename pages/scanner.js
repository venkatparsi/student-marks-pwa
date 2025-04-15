import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import jsPDF from 'jspdf';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ScannerPage() {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment');
  const router = useRouter();
  const { studentId: queryStudentId, testId: queryTestId } = router.query;

  const [images, setImages] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [testId, setTestId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const videoConstraints = {
    facingMode,
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };


  useEffect(() => {
    if (queryStudentId) setStudentId(queryStudentId );
    if (queryTestId) setTestId(queryTestId );
  }, [queryStudentId, queryTestId]);

  const captureImage = () => {
    const imageSrc = (webcamRef.current )?.getScreenshot();
    if (imageSrc) {
      setImages([...images, imageSrc]);
    }
  };

  const generateAndDownloadPDF = () => {
    const pdf = new jsPDF();
  
    images.forEach((imgData, index) => {
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 10, 10, 190, 270); // Adjust position/size as needed
    });
  
    pdf.save('answersheet.pdf');
  };

  const generateAndUploadPDF = async () => {
    if (!studentId || !testId || images.length === 0) {
      alert('Missing Student ID, Test ID, or no images captured.');
      return;
    }

    setUploading(true);
    const pdf = new jsPDF();

    images.forEach((img, i) => {
      if (i > 0) pdf.addPage();
      pdf.addImage(img, 'JPEG', 10, 10, 190, 270);
    });

    const pdfBlob = pdf.output('blob');
    const filePath = `student-${studentId}/test-${testId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from('answer-sheets')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadError) {
      setMessage('❌ Upload failed: ' + uploadError.message);
      setUploading(false);
      return;
    }

    const publicUrl = supabase.storage
      .from('answer-sheets')
      .getPublicUrl(filePath).data.publicUrl;

    // Optional: Update the student_marks table with the uploaded file URL
    const { error: updateError } = await supabase
      .from('student_marks')
      .update({ answer_sheet_id: publicUrl })
      .eq('student_id', studentId)
      .eq('test_id', testId);

    if (updateError) {
      setMessage('❌ Upload done but DB update failed: ' + updateError.message);
    } else {
      setMessage('✅ PDF uploaded and record updated!');
      setImages([]);
    }

    setUploading(false);
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">📄 Scan Answer Sheet</h1>

      <div className="flex flex-col gap-2">
        <input
          className="border p-2 rounded"
          placeholder="Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Test ID"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
        />
      </div>


      <div className="p-4">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded w-full max-w-md mx-auto border"
      />
      <button
        onClick={toggleFacingMode}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded shadow"
      >
        Switch to {facingMode === 'user' ? 'Back' : 'Front'} Camera
      </button>
    </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={captureImage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          📸 Capture
        </button>
        <button
          onClick={generateAndUploadPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : '⬆️ Upload PDF'}
        </button>

        <button
  onClick={() => generateAndDownloadPDF()}
  className="mt-4 px-4 py-2 bg-green-600 text-white rounded shadow"
>
  Download PDF
</button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-4">
          {images.map((img, idx) => (
            <img key={idx} src={img} className="w-full border rounded" alt={`Page ${idx + 1}`} />
          ))}
        </div>
      )}

      {message && (
        <div className="text-center text-sm mt-4 font-medium text-green-700">
          {message}
        </div>
      )}
    </div>
  );
}
