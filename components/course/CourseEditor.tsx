"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import Editor from "../editor";
import { ImageIcon } from "lucide-react";
import { Button } from "../ui/button";
import { uploadToImageKit } from "@/lib/upload-to-imagekit";
import Image from "next/image";

export type Course = {
  id: string;
  title: string;
  totalFee: string;
  duration: string;
  approvedBy: string;
  shortDescription: string;
  fullDescription: string; // markdown string now
  image?: string | null;
  status: string;
};

type Props = {
  initialData?: Course;
};

export default function CourseEditor({ initialData }: Props) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [fee, setFee] = useState(initialData?.totalFee || "");
  const [duration, setDuration] = useState(initialData?.duration || "");
  const [approvedBy, setApprovedBy] = useState(initialData?.approvedBy || "");
  const [shortDescription, setShortDescription] = useState(
    initialData?.shortDescription || ""
  );
  const [fullDescription, setFullDescription] = useState(
    initialData?.fullDescription || ""
  );
  const [status, setStatus] = useState(initialData?.status || "Ongoing");

  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image || null
  );
  const [imageUploading, setImageUploading] = useState(false);

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

  const handleSubmit = async () => {
    if (!title.trim() || !imageUrl?.trim()) {
      toast.error("Title and cover image are required.");
      return;
    }

    const payload: Omit<Course, "id"> = {
      title: title.trim(),
      totalFee: fee.trim(),
      duration: duration.trim(),
      approvedBy: approvedBy.trim(),
      shortDescription: shortDescription.trim(),
      fullDescription,
      status,
      image: imageUrl!,
    };

    const response = await fetch(
      initialData ? `/api/courses/${initialData.id}` : "/api/courses",
      {
        method: initialData ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      toast.success(initialData ? "Course updated!" : "Course created!");
    } else {
      const errorText = await response.text();
      console.error("Course API error:", errorText);
      toast.error("Operation failed. Check console for details.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? "📝 Edit Course" : "🧾 Create New Course"}
      </h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Course Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Artificial Insemination Training"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Total Fee</Label>
            <Input
              value={fee}
              onChange={(e) => setFee(e.target.value)}
              placeholder="e.g., 40,000 + Hostel"
            />
          </div>
          <div className="space-y-1">
            <Label>Duration</Label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 3 Months"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Approved By</Label>
          <Input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="e.g., Dept. of Animal Husbandry"
          />
        </div>

        <div className="space-y-1">
          <Label>Short Description</Label>
          <Textarea
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
          <Label>Status</Label>
          <select
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
            <div className="relative w-full h-48 mt-2 rounded-md overflow-hidden">
              <Image
                src={imageUrl}
                alt="Course Cover"
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>

        <Button className="w-full text-lg" onClick={handleSubmit}>
          {initialData ? "Update Course" : "Create Course"}
        </Button>
      </div>
    </div>
  );
}
