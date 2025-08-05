"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import Editor from "@/components/editor"; // your markdown/RTE editor
import { ImageIcon } from "lucide-react"; // or any icon you want
import { useRouter } from "next/navigation";
import { uploadToImageKit } from "@/lib/upload-to-imagekit"; // your image upload util

export type Blog = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string | null;
};

type Props = {
  initialData?: Blog;
};

export default function BlogEditor({ initialData }: Props) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.image || null);
  const [imageUploading, setImageUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const uploadedUrl = await uploadToImageKit(file, "blog-images");
      setImageUrl(uploadedUrl);
      toast.success("Image uploaded successfully");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    if (!imageUrl) {
      toast.error("Please upload a cover image.");
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content,
      image: imageUrl,
    };

    try {
      const res = await fetch(
        initialData ? `/api/blogs/${initialData.id}` : "/api/blogs",
        {
          method: initialData ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Something went wrong.");
      }

      toast.success(initialData ? "Blog updated!" : "Blog created!");
      router.push("/admin/blogs");
    } catch (err) {
      console.error("Blog API error:", err);
      toast.error("Failed to save blog.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 border rounded-xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">
        {initialData ? "✏️ Edit Blog" : "📝 Create New Blog"}
      </h2>

      <div className="space-y-4">
        <div className="space-y-1">
          <Label>Title</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., How to Improve Milk Yield in Cows"
          />
        </div>

        <div className="space-y-1">
          <Label>Excerpt</Label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary of the blog..."
            rows={3}
          />
        </div>

        <div className="space-y-1">
          <Label>Content</Label>
          <Editor value={content} onChange={setContent} />
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
              alt="Blog Cover"
              className="mt-2 rounded-md w-full object-cover h-48"
            />
          )}
        </div>

        <Button
          className="w-full text-lg"
          onClick={handleSubmit}
          disabled={submitting || imageUploading}
        >
          {submitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
            ? "Update Blog"
            : "Create Blog"}
        </Button>
      </div>
    </div>
  );
}
