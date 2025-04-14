import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function ViewPage() {
  const { query } = useRouter();
  const [data, setData] = useState(null);

  useEffect(() => {
    if (query.id) {
      supabase.from('student_marks').select('*').eq('id', query.id).single().then(({ data }) => {
        setData(data);
      });
    }
  }, [query.id]);

  if (!data) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.student_name}'s Marks</h1>
      <img src={data.student_photo} alt="student" className="w-20 h-20 rounded-full" />
      <ul className="list-disc ml-6">
        <li>Subject: {data.subject_name}</li>
        <li>Test: {data.test_name} on {data.test_date}</li>
        <li>Total: {data.total_marks}, Obtained: {data.marks_obtained}</li>
        <li>Practical: {data.practical_marks}, Theory: {data.theory_marks}</li>
        <li>Answer Sheet: {data.answer_sheet_id}</li>
        <li>Photo ID: {data.photo_id}</li>
      </ul>
    </div>
  );
}
