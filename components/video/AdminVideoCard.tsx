"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import clsx from "clsx";
import Image from "next/image";

type Props = {
  video: {
    id: string;
    title?: string;
    url: string;
    thumbnail: string;
  };
  onDelete?: (id: string) => void;
};

export function AdminVideoCard({ video, onDelete }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("Video deleted");
      onDelete?.(video.id);
    } else {
      toast.error("Failed to delete video");
    }
    setDeleting(false);
    setShowConfirm(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    videoRef.current?.play().catch(() => {});
  };

  const handleMouseLeave = () => {
    setHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className="group relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 p-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video preview area */}
      <div className="relative w-full aspect-[9/16] overflow-hidden rounded-lg bg-black shadow-sm transition hover:scale-[1.01] hover:shadow-md">
        <Image
          src={video.thumbnail}
          alt="Thumbnail"
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            hovered ? "opacity-0" : "opacity-100"
          )}
          fill
        />
        <video
          ref={videoRef}
          src={video.url}
          muted
          playsInline
          preload="metadata"
          className={clsx(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            hovered ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={clsx(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            hovered ? "opacity-0" : "opacity-100"
          )}
        >
          <PlayCircle
            className="text-white/90 bg-black/40 rounded-full p-1"
            size={48}
          />
        </div>

        {/* New Delete button */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-red-100 text-red-600 border border-red-200 shadow-sm"
          onClick={() => setShowConfirm(true)}
        >
          <Trash size={16} />
        </Button>
      </div>

      {/* Title */}
      <p className="mt-2 text-sm font-medium text-gray-800 truncate">
        {video.title ?? "Untitled"}
      </p>

      {/* Custom Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-in fade-in zoom-in">
            <h3 className="text-lg font-semibold mb-2">Delete Video</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this video? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
