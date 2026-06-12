"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CloudUpload, ImageIcon, VideoIcon, CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";

export function VideoUploadForm() {
  const [title, setTitle] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  async function generateThumbnail(videoFile: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoFile);
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.playsInline = true;
      video.currentTime = 2;

      video.onloadeddata = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Failed to get canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (!blob) return reject("Failed to generate thumbnail blob");
          resolve(new File([blob], "thumbnail.jpg", { type: "image/jpeg" }));
        }, "image/jpeg");
      };

      video.onerror = reject;
    });
  }

  async function uploadToImageKit(
    file: File,
    fileName: string,
    onProgress: (percent: number) => void
  ): Promise<string> {
    const authRes = await fetch("/api/imagekit");
    if (!authRes.ok) throw new Error("Failed to get ImageKit auth params");
    const authData = await authRes.json();
    const { signature, token, expire } = authData;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("publicKey", process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "");
    formData.append("signature", signature);
    formData.append("token", token);
    formData.append("expire", expire.toString());
    formData.append("folder", "/videos");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          try {
            const resData = JSON.parse(xhr.responseText);
            resolve(resData.url);
          } catch {
            reject(new Error("Failed to parse ImageKit response"));
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            reject(new Error(errData.message || "ImageKit upload failed"));
          } catch {
            reject(new Error(`ImageKit upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error("Network error during upload"));
      };

      xhr.send(formData);
    });
  }

  async function uploadVideo() {
    if (!videoFile || !title) return toast.error("Please fill all required fields");

    setUploading(true);
    setUploadSuccess(false);
    setUploadProgress(0);

    let thumbnail = thumbFile;
    if (!thumbnail) {
      try {
        thumbnail = await generateThumbnail(videoFile);
      } catch {
        toast.warning("Failed to generate thumbnail. Uploading without it.");
      }
    }

    try {
      toast.info("Uploading video directly to ImageKit...");
      const videoUrl = await uploadToImageKit(
        videoFile,
        `${title}-video.mp4`,
        (percent) => {
          setUploadProgress(Math.round(percent * 0.9));
        }
      );

      let thumbnailUrl = "";
      if (thumbnail) {
        toast.info("Uploading thumbnail...");
        thumbnailUrl = await uploadToImageKit(
          thumbnail,
          `${title}-thumb.jpg`,
          () => {}
        );
      } else {
        thumbnailUrl = `${videoUrl}/ik-thumbnail.jpg`;
      }

      setUploadProgress(95);

      toast.info("Saving database entry...");
      const dbRes = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          url: videoUrl,
          thumbnail: thumbnailUrl,
        }),
      });

      if (dbRes.ok) {
        setUploadProgress(100);
        toast.success("Video uploaded!");
        setUploadSuccess(true);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        const errData = await dbRes.json();
        toast.error(errData.error || "Failed to save video database entry");
      }
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto">

      <div className="space-y-2">
        <Label>Title</Label>
        <Input
          placeholder="Enter video title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Video File (.mp4)</Label>
        <div
          onClick={() => videoInputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition",
            videoFile ? "border-green-500 bg-green-50" : "hover:border-gray-400"
          )}
        >
          {videoFile ? (
            <div className="text-green-700 flex items-center justify-center gap-2">
              <VideoIcon size={20} />
              <span className="font-medium text-sm">{videoFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <VideoIcon size={32} />
              <span>Click to upload or drag & drop a video</span>
            </div>
          )}
          <Input
            ref={videoInputRef}
            type="file"
            accept="video/mp4"
            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Custom Thumbnail (optional)</Label>
        <div
          onClick={() => thumbInputRef.current?.click()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition",
            thumbFile ? "border-blue-500 bg-blue-50" : "hover:border-gray-400"
          )}
        >
          {thumbFile ? (
            <div className="text-blue-700 flex items-center justify-center gap-2">
              <ImageIcon size={20} />
              <span className="font-medium text-sm">{thumbFile.name}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <ImageIcon size={28} />
              <span>Click to upload or drag & drop a thumbnail</span>
            </div>
          )}
          <Input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle2 size={18} /> Video uploaded successfully!
        </div>
      )}

      <Button
        onClick={uploadVideo}
        disabled={uploading}
        className="w-full text-base flex items-center gap-2"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Uploading...
          </>
        ) : (
          <>
            <CloudUpload size={18} /> Upload Video
          </>
        )}
      </Button>
    </div>
  );
}
