import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import QRCode from "react-qr-code";
import StudentForm from "@/components/StudentForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudentsWithMarks = async () => {
    const { data, error } = await supabase
      .from('student_marks')
      .select(`
        *,
        students:student_id (
          id,
          name,
          address,
          photo_id
        )
      `);
  
    if (error) {
      console.error('Error fetching joined data:', error.message);
      return;
    }
  
    console.log(data); // Each row includes `student_marks` fields + `students` object
    setStudents(data || []);
  };
  

  useEffect(() => {
    fetchStudentsWithMarks();
  }, []);
  return (
    <div>
      <header className="p-4 bg-gray-100 fixed top-0 w-full z-40">
        <h1 className="text-xl font-bold">Class Info</h1>
        <div>Branch: A</div>
        <div>Subject: Math</div>
        <button
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => {
            setSelectedStudent(null);
            setShowForm(true);
          }}
        >
          Add Student
        </button>
      </header>

      <main className="pt-40 p-6">
        <h2 className="text-xl font-semibold mb-4">Student Marks</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left p-2">Photo</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">QR Code</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
                          
              <tr
                key={s.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/view?id=${s.id}`}
                onClick2={() => {
                  setSelectedStudent(s);
                  setShowForm(true);
                }}
              >
                <td className="p-2">
                  <img
                    src={s.photo_id}
                    alt="student"
                    className="w-12 h-12 rounded-full"
                  />
                </td>
                <td className="p-2">{s.students.name}</td>
                <td className="p-2">
                  <QRCode
                    value={`https://your-vercel-app.vercel.app/view?id=${s.id}`}
                    size={64}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>

      {showForm && (
        <StudentForm
          student={selectedStudent}
          onClose={() => setShowForm(false)}
          onSave={fetchStudentsWithMarks}
        />
      )}
    </div>
  );
}
