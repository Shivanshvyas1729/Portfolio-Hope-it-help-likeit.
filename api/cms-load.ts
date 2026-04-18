import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { coreGetLatestData } = await import("./_lib/cms-core.js");

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { filePath } = req.query;

    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required query param: filePath"
      });
    }

    const result = await coreGetLatestData(filePath);

    return res.status(result.success ? 200 : (result.code || 500)).json(result);
  } catch (err: any) {
    console.error("CRITICAL ERROR in cms-load:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Critical server error inside cms-load", 
      details: err.message,
      stack: err.stack 
    });
  }
}
