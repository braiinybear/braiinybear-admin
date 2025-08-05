"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import Editor from "@/components/editor";
import { ImageIcon } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { uploadToImageKit } from "@/lib/upload-to-imagekit";
import { useRouter } from "next/navigation";

export default function CreateCourse() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [fee, setFee] = useState("");
  const [duration, setDuration] = useState("");
  const [approvedBy, setApprovedBy] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [status, setStatus] = useState("Ongoing");
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const uploadedUrl = await uploadToImageKit(file, "course-images");
      setImageUrl(uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

async function createCourse(courseData: any) {
  const response = await fetch("/api/courses/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(courseData),
  });

  // Read once:
  const data = await response.json();

  if (!response.ok) {
    // Use error message from API or fallback:
    throw new Error(data.error || "Failed to create course");
  }

  return data;
}



    const handleSubmit = async () => {
    if (!title.trim() || !imageUrl) {
      toast.error("Title and cover image are required.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      totalFee: fee.trim(),
      duration: duration.trim(),
      approvedBy: approvedBy.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription,
      status,
      image: imageUrl,
    };

    try {
      await createCourse(payload);
      toast.success("Course created!");
      // Reset form
      setTitle("");
      setFee("");
      setDuration("");
      setApprovedBy("");
      setShortDescription("");
      setFullDescription("");
      setStatus("Ongoing");
      setImageUrl(null);

      // Redirect user to courses page
      router.push("/admin/courses");
    } catch (error) {
      console.error("Course API error:", error);
      toast.error("Operation failed. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">🧾 Create New Course</h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="title">Course Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Artificial Insemination Training"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="fee">Total Fee</Label>
            <Input
              id="fee"
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="e.g., 40,000 + Hostel"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 3 Months"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="approvedBy">Approved By</Label>
          <Input
            id="approvedBy"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="e.g., Dept. of Animal Husbandry"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="shortDescription">Short Description</Label>
          <Textarea
            id="shortDescription"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Brief course summary"
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <Label>Full Description</Label>
          <Editor value={fullDescription} onChange={setFullDescription} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option>Ongoing</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>Cover Image</Label>
          <div className="border-2 border-dashed rounded-xl p-5 text-center hover:border-gray-400 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              id="image-upload"
              className="hidden"
              onChange={handleImageUpload}
              disabled={imageUploading}
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center gap-2 text-gray-600 cursor-pointer"
            >
              <ImageIcon size={28} />
              <span>
                {imageUploading
                  ? "Uploading…"
                  : imageUrl
                  ? "Click to replace image"
                  : "Click to upload cover image"}
              </span>
            </label>
          </div>
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Course Cover"
              className="mt-2 rounded-md w-full object-cover h-48"
            />
          )}
        </div>

        <Button
          className="w-full text-lg"
          onClick={handleSubmit}
          disabled={submitting || imageUploading}
        >
          {submitting ? "Creating..." : "Create Course"}
        </Button>
      </div>
    </div>
  );
}
