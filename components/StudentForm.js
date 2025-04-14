import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function StudentForm({ onClose, onSave, student }) {
  const [name, setName] = useState(student?.student_name || "");
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let photoUrl = student?.student_photo || "";

    if (photo) {
      setUploading(true);
      const fileName = `${Date.now()}-${photo.name}`;
      const { data, error } = await supabase.storage
        .from("student-photos")
        .upload(fileName, photo);

      if (error) {
        console.error("Upload error", error);
        return;
      }

      const { publicURL } = supabase.storage
        .from("student-photos")
        .getPublicUrl(fileName);

      photoUrl = publicURL;
      setUploading(false);
    }

    // Save to database
    const { error } = await supabase.from("student_marks").insert([
      {
        student_name: name,
        student_photo: photoUrl,
      },
    ]);

    if (error) {
      alert("Error saving student");
      console.error(error);
    } else {
      onSave(); // Trigger refresh
      onClose(); // Close modal/form
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg space-y-4 w-full max-w-md"
      >
        <h2 className="text-lg font-semibold">Add Student Info</h2>

        <input
          type="text"
          placeholder="Student Name"
          className="w-full border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <div className="flex justify-end space-x-2">
          <button type="button" onClick={onClose} className="text-gray-600">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
