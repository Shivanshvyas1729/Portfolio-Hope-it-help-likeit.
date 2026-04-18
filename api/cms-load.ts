import { coreGetLatestData } from "../src/lib/cms-core";

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { filePath } = req.query;

  if (!filePath) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required query param: filePath"
    });
  }

  const result = await coreGetLatestData(filePath);

  return res.status(result.success ? 200 : (result.code || 500)).json(result);
}
