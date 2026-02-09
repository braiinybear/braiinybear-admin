// app/admin/videos/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AdminVideoCard } from "@/components/video/AdminVideoCard";
import { VideoUploadForm } from "@/components/video/VideoUploadForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Video, Upload, Grid3x3, List, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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

  // Filter videos based on search query
  const filteredVideos = videos.filter((video) =>
    video.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Video Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload, manage, and organize your video content
          </p>
        </div>

        {/* Stats */}
        <Card className="md:w-auto">
          <CardContent className="flex items-center gap-2 p-4">
            <Video className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{videos.length}</p>
              <p className="text-xs text-muted-foreground">Total Videos</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Grid3x3 className="w-4 h-4" />
            All Videos
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload New
          </TabsTrigger>
        </TabsList>

        {/* All Videos Tab */}
        <TabsContent value="all" className="space-y-4 mt-6">
          {/* Search and View Toggle */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos by title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Videos Grid/List */}
          {loading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-sm text-muted-foreground">Loading videos...</p>
              </CardContent>
            </Card>
          ) : filteredVideos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Video className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchQuery ? "No videos found" : "No videos yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {searchQuery
                    ? "Try adjusting your search query"
                    : "Upload your first video to get started"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {filteredVideos.map((video) => (
                <AdminVideoCard
                  key={video.id}
                  video={video}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          {/* Results count */}
          {!loading && filteredVideos.length > 0 && (
            <p className="text-sm text-muted-foreground text-center">
              Showing {filteredVideos.length} of {videos.length} videos
            </p>
          )}
        </TabsContent>

        {/* Upload Tab */}
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload New Video
              </CardTitle>
              <CardDescription>
                Add a new video to your collection. Supported format: MP4
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoUploadForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
