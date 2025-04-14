import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function UploadImage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const uploadImage = async () => {
    if (!file) return;

    setUploading(true);

    // Create a unique file name based on the current timestamp
    const fileName = `${Date.now()}-${file.name}`;

    try {
      // Upload image to the bucket
      const { data, error } = await supabase.storage
        .from("student-photos")  // Use your bucket name
        .upload(fileName, file);

      if (error) throw error;

      // Get the public URL of the uploaded image
      const { publicURL, error: urlError } = supabase.storage
        .from("student-photos")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      setImageUrl(publicURL); // Set the public URL
      setUploading(false);

      console.log("File uploaded successfully: ", publicURL);
    } catch (error) {
      console.error("Error uploading file: ", error);
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadImage} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Image"}
      </button>
      {imageUrl && (
        <div>
          <h3>Image Uploaded!</h3>
          <img src={imageUrl} alt="Uploaded" width={200} />
        </div>
      )}
    </div>
  );
}

export default UploadImage;
