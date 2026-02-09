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
import Image from "next/image";

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
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image || null
  );
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {initialData ? "✏️ Edit Blog" : "📝 Create New Blog"}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {initialData
            ? "Update your blog post details and content"
            : "Create a new blog post to share your knowledge"}
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-medium">
            Blog Title
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., How to Improve Milk Yield in Cows"
            className="h-10"
          />
          {title && (
            <p className="text-xs text-muted-foreground">
              {title.length} characters
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="excerpt" className="text-sm font-medium">
            Excerpt
          </Label>
          <Textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary of the blog..."
            rows={3}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {excerpt.length} characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="content" className="text-sm font-medium">
            Blog Content
          </Label>
          <Editor value={content} onChange={setContent} />
          {content && (
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-upload" className="text-sm font-medium">
            Cover Image
          </Label>
          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group">
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
              className="flex flex-col items-center gap-3 text-muted-foreground cursor-pointer group-hover:text-primary transition-colors"
            >
              <div className="p-2 bg-muted rounded-lg group-hover:bg-primary/10">
                <ImageIcon size={32} className="group-hover:text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {imageUploading
                    ? "Uploading…"
                    : imageUrl
                    ? "Click to replace image"
                    : "Click to upload cover image"}
                </p>
                <p className="text-xs mt-1">PNG, JPG, WebP up to 10MB</p>
              </div>
            </label>
          </div>

          {imageUrl && (
            <div className="relative w-full h-48 mt-3 rounded-lg overflow-hidden border shadow-sm">
              <Image
                src={imageUrl}
                alt="Blog cover image"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          )}
        </div>

        <Button
          className="w-full h-10 text-base font-medium"
          onClick={handleSubmit}
          disabled={submitting || imageUploading}
          size="lg"
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
