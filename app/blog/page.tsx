"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  cover_image_url: string;
}

export default function Blog() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setPost(null);
    setPublished(null);
    try {
      const data = await api.post("/blog/generate", { topic });
      setPost(data);
    } catch (e) {
      alert("Error generating blog post");
    }
    setLoading(false);
  };

  const publish = async () => {
    if (!post) return;
    setPublishing(true);
    try {
      const data = await api.post(`/blog/publish/${post.id}`, {});
      if (data.status === "failed" || data.error) throw new Error(data.error || "Publish failed");
      setPublished(data.url || String(post.id));
    } catch (e: any) {
      alert("Error publishing: " + (e.message || e));
    }
    setPublishing(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Blog / Insights</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-3">✍️ Generate Article</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic (e.g. 'citizen journalism in Nigeria')"
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm"
            onKeyDown={(e) => e.key === "Enter" && generate()}
          />
          <button
            onClick={generate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-sm font-medium"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>

      {post && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{post.excerpt}</p>
              <div className="flex gap-2 mt-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-700 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            </div>
            {post.cover_image_url && (
              <img src={post.cover_image_url} alt="" className="w-24 h-16 object-cover rounded-lg ml-4" />
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto mb-4">
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{post.content}</pre>
          </div>

          {published ? (
            <div className="flex items-center gap-2 text-green-400">
              <span>✅ Published!</span>
              <a href={published} target="_blank" className="text-blue-400 hover:underline text-sm">
                View on ReportAfrica
              </a>
            </div>
          ) : (
            <button
              onClick={publish}
              disabled={publishing}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-medium"
            >
              {publishing ? "Publishing..." : "Publish to ReportAfrica"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
