import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import QRCode from 'react-qr-code';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    supabase.from('student_marks').select('*').then(({ data }) => {
      setStudents(data);
    });
  }, []);

  return (
    <div className="flex h-screen">
      <aside className="w-1/4 bg-gray-100 p-4 space-y-4 fixed top-0 left-0 h-full">
        <h1 className="text-xl font-bold">Class Info</h1>
        <div>Branch: A</div>
        <div>Serial: 123</div>
        <div>Subject: Math</div>
        <div>Teacher: Mr. Venkat</div>
        <img src="https://via.placeholder.com/100" className="rounded-full w-20 h-20 mt-4" alt="teacher" />
      </aside>
      <main className="ml-1/4 p-6 w-full overflow-auto">
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
              <tr key={s.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href=`/view?id=${s.id}`}>
                <td className="p-2"><img src={s.student_photo} alt="student" className="w-12 h-12 rounded-full" /></td>
                <td className="p-2">{s.student_name}</td>
                <td className="p-2"><QRCode value={`https://student-marks-pwa.vercel.app/view?id=${s.id}`} size={64} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
