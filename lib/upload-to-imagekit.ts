export async function uploadToImageKit(file: File, folder = "uploads") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("fileName", file.name);
  formData.append("folder", folder);

  const res = await fetch("/api/imagekit", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.text();
    console.error("Upload failed:", error);
    throw new Error("Image upload failed");
  }

  const data = await res.json();
  return data.url as string;
}
