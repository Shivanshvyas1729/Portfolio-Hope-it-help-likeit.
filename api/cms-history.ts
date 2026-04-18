import { coreGetHistory } from "../src/lib/cms-core.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required query string: filePath", 
      code: 400 
    });
  }

  const result = await coreGetHistory(filePath as string);
  return res.status(result.success ? 200 : (result.code || 500)).json(result);
}
