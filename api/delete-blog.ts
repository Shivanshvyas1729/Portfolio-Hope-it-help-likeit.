/**
 * api/delete-blog.ts — Vercel serverless adapter
 * Delegates all logic to api/_lib/blog-core.ts
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { coreDeleteBlog } = await import("./_lib/blog-core.js");

    if (req.method !== "POST" && req.method !== "DELETE") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
    
    const body   = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const result = await coreDeleteBlog(body.password, body.postId, body.postSlug);

    if (result.headers) {
      Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v as string));
    }
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    console.error("Unhandled error in Vercel delete-blog:", err);
    return res.status(500).json({ 
      error: "Internal Server Error inside delete-blog",
      details: err.message,
      stack: err.stack 
    });
  }
}
