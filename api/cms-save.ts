import { coreUpdateYamlSection } from "../src/lib/cms-core.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { filePath, sectionKey, newData, providedSha, isSafeMode, role } = req.body;

  if (!filePath || !sectionKey || !newData) {
    return res.status(400).json({ 
      success: false, 
      error: "Missing required fields: filePath, sectionKey, newData",
      code: 400 
    });
  }

  const result = await coreUpdateYamlSection(
    role as any,
    filePath,
    sectionKey,
    newData,
    providedSha,
    !!isSafeMode
  );

  return res.status(result.success ? 200 : (result.code || 500)).json(result);
}
