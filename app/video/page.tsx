"use client";

import { useState, useRef, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://marketpilot-backend.onrender.com";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f && f.type.startsWith("video/")) {
      setFile(f);
      setError("");
    } else {
      setError("Please select a valid video file.");
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/api/video/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.status === "success") setResult(data);
      else setError(data.error || `Failed: ${JSON.stringify(data)}`);
    } catch (e: any) {
      setError(`Upload failed: ${e.message}`);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">🎬 Video to Content</h2>
      <p className="text-gray-400 text-sm mb-6">Upload a video → AI transcribes it → generates blog + social posts → schedules automatically</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">📤 Upload Video</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${dragging ? "border-blue-400 bg-blue-900/20" : "border-gray-700 hover:border-blue-500"}`}
          >
            {file ? (
              <div>
                <p className="text-green-400 font-medium">✅ {file.name}</p>
                <p className="text-gray-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                <p className="text-gray-600 text-xs mt-2">Click to change file</p>
              </div>
            ) : (
              <div>
                <p className="text-4xl mb-3">🎥</p>
                <p className="text-gray-400">Drag & drop or click to select</p>
                <p className="text-gray-600 text-sm mt-1">MP4, MOV, AVI — max 100MB</p>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full mt-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium"
          >
            {loading ? "⏳ Processing... (1-2 min)" : "🚀 Upload & Generate Content"}
          </button>

          {error && <p className="text-red-400 text-sm mt-3 bg-red-900/20 p-3 rounded-lg">{error}</p>}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Generated Content</h3>

          {!result && !loading && (
            <p className="text-gray-500 text-sm">Upload a video to see generated content here.</p>
          )}

          {loading && (
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-800 rounded animate-pulse w-2/3" />
              <p className="text-gray-500 text-xs mt-4">Uploading → Transcribing → Generating...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4 text-sm overflow-y-auto max-h-[600px]">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">📝 Transcript Preview</p>
                <p className="text-gray-300">{result.transcript_preview}</p>
              </div>

              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-gray-400 text-xs mb-1">✅ Scheduled Platforms</p>
                <div className="flex gap-2 flex-wrap mt-1">
                  {result.scheduled?.map((p: string) => (
                    <span key={p} className="px-2 py-1 bg-green-900 text-green-300 rounded text-xs">{p}</span>
                  ))}
                </div>
              </div>

              {result.post_results && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-2">🚀 Post Results</p>
                  <div className="space-y-1">
                    {Object.entries(result.post_results).map(([platform, r]: [string, any]) => (
                      <div key={platform} className="flex items-center gap-2 text-xs">
                        <span className={r?.success ? "text-green-400" : "text-red-400"}>
                          {r?.success ? "✅" : "❌"}
                        </span>
                        <span className="text-gray-300 capitalize">{platform}</span>
                        {r?.post_url && <a href={r.post_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">View →</a>}
                        {!r?.success && <span className="text-red-400">{r?.error?.slice(0,60)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.generated?.facebook && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">📘 Facebook</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{result.generated.facebook}</p>
                </div>
              )}

              {result.generated?.instagram && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">📸 Instagram</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{result.generated.instagram}</p>
                </div>
              )}

              {result.generated?.linkedin && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">💼 LinkedIn</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{result.generated.linkedin}</p>
                </div>
              )}

              {result.generated?.blog && (
                <div className="bg-gray-800 rounded-lg p-3">
                  <p className="text-gray-400 text-xs mb-1">📝 Blog Article</p>
                  <p className="text-gray-300 whitespace-pre-wrap">{result.generated.blog}</p>
                </div>
              )}

              <a href={result.video_url} target="_blank" rel="noreferrer" className="block text-blue-400 text-xs hover:underline">
                🎬 View uploaded video on Cloudinary →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
