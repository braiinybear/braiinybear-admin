// app/admin/videos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminVideoCard } from "@/components/video/AdminVideoCard";
import { VideoUploadForm } from "@/components/video/VideoUploadForm";

type VideoItemType = {
  id: string;
  url: string;
  thumbnail: string;
  title?: string;
  createdAt: string;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItemType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const res = await fetch("/api/videos");
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error("❌ Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVideos();
  }, []);

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">📹 Video Management</h1>

      <VideoUploadForm />

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading videos...</p>
      ) : videos.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No videos found or failed to connect to the database.
        </p>
      ) : (
        <div className="flex flex-wrap gap-4">
          {videos.map((video) => (
            <AdminVideoCard
              key={video.id}
              video={video}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
