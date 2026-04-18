import { Octokit } from "@octokit/rest";
import yaml, { Document } from "yaml";
import fs from "fs";
import path from "path";

// ─── Constants & Configuration ──────────────────────────────────────────────
export const OWNER = "Shivanshvyas1729";
export const REPO = "My_personal_portfolio";
export const RATE_LIMIT_SECONDS = 30;

// Path Security & Normalization
const BASE_DATA_DIR = path.normalize(path.resolve(process.cwd(), "src/data"));

const logCms = (msg: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    console.log(`\x1b[36m[CMS ${timestamp}]\x1b[0m ${msg}`, data || '');
  }
};

/**
 * Validates and normalizes paths for local filesystem operations.
 * Ensures the target file is strictly within the allowed data directory.
 */
function validateLocalPath(filePath: string): string {
  const normalizedRequested = path.normalize(filePath);
  const absoluteTarget = path.isAbsolute(normalizedRequested) 
    ? normalizedRequested 
    : path.resolve(process.cwd(), normalizedRequested);

  if (!absoluteTarget.toLowerCase().startsWith(BASE_DATA_DIR.toLowerCase())) {
    logCms(`🚨 SECURITY: Blocked out-of-bounds path: ${absoluteTarget}`);
    throw new Error(`Access denied: ${filePath} is outside of BASE_DATA_DIR`);
  }
  
  return absoluteTarget;
}

// In-memory Singleton Lock (Local Dev Only)
let isSaving = false;

export interface CmsApiResult {
  success: boolean;
  mode: "local" | "github";
  message?: string;
  error?: string;
  code?: number;
  data?: any;
}

const IS_DEV = process.env.NODE_ENV === "development";
const CMS_MODE = process.env.CMS_MODE || "local";

/**
 * Determine if we should use Local Filesystem or GitHub API.
 */
const dataDirExists = fs.existsSync(BASE_DATA_DIR);
const useLocalMode = (CMS_MODE === "local" && dataDirExists) || (IS_DEV && dataDirExists && CMS_MODE !== "github");

export function getOctokit() {
  const token = process.env.GITHUB_TOKEN;
  if (!token && !useLocalMode) {
     throw new Error("GITHUB_TOKEN is missing. Cannot use GitHub mode.");
  }
  return new Octokit({ auth: token });
}

// ─── Safe Nested YAML Update ───────────────────────────────────────────────
function safelyUpdateNode(doc: Document, pathKeys: string[], data: any) {
  if (data === null || data === undefined) {
    doc.deleteIn(pathKeys);
    return;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const existingNode = doc.getIn(pathKeys);
    if (existingNode === undefined || existingNode === null) {
      doc.setIn(pathKeys, doc.createNode(data));
      return;
    }
    Object.keys(data).forEach((key) => {
      safelyUpdateNode(doc, [...pathKeys, key], data[key]);
    });
  } else {
    doc.setIn(pathKeys, data);
  }
}

// ─── Mode Implementations ───────────────────────────────────────────────────

async function fetchFromGitHub(octokit: Octokit, filePath: string) {
  const response = await octokit.repos.getContent({
    owner: OWNER,
    repo: REPO,
    path: filePath,
    ref: "main",
  });
  const fileData = response.data as any;
  if (fileData.type !== "file") throw new Error("Target is not a file");
  return {
    sha: fileData.sha,
    content: Buffer.from(fileData.content, "base64").toString("utf-8"),
  };
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

export async function coreUpdateYamlSection(
  role: string | null,
  filePath: string,
  sectionKey: string,
  newData: any,
  providedSha: string | undefined,
  isSafeMode: boolean,
): Promise<CmsApiResult> {
  // 1. Singleton Lock (Local Mode Only)
  if (useLocalMode && isSaving) {
    return { success: false, error: "Saving in progress...", code: 423, mode: "local" };
  }
  
  if (useLocalMode) isSaving = true;

  try {
    // 2. RBAC Check at Backend Level
    const restrictedSections = ["emailjs", "personal", "resume"];
    if (role === "editor" && restrictedSections.includes(sectionKey)) {
      return { success: false, error: `Forbidden: Editors cannot modify ${sectionKey}`, code: 403, mode: useLocalMode ? "local" : "github" };
    }

    let rawContent: string;
    let sha: string = "";
    let absolutePath: string = "";

    // 3. Fetch Data Source
    if (useLocalMode) {
      try {
        absolutePath = validateLocalPath(filePath);
        logCms(`Backend: Local Mode active. Writing to: ${absolutePath} (Role: ${role})`);
        rawContent = fs.readFileSync(absolutePath, "utf-8");
      } catch (e: any) {
        return { success: false, error: `Path Error: ${e.message}`, code: 403, mode: "local" };
      }
    } else {
      const octokit = getOctokit();
      logCms(`Backend: GitHub Mode active. File: ${filePath} (Role: ${role})`);
      const fetched = await fetchFromGitHub(octokit, filePath);
      sha = fetched.sha;
      rawContent = fetched.content;
      
      // Conflict Detection (GitHub only)
      if (providedSha && providedSha !== sha) {
        return { success: false, error: "Conflict: SHA mismatch", code: 409, mode: "github", data: { latestSha: sha, latestContent: rawContent } };
      }
    }

    // 4. Update YAML Document
    const doc = yaml.parseDocument(rawContent);
    if (doc.errors?.length) throw new Error("YAML Parsing Error");

    safelyUpdateNode(doc, [sectionKey], newData);
    const updatedContent = doc.toString({ lineWidth: -1 });

    // 5. Safe Mode / Logging
    if (isSafeMode) {
      logCms(`Safe mode active: update to ${sectionKey} simulated.`);
      return { success: true, mode: useLocalMode ? "local" : "github", message: "Success. (Safe Mode simulation)" };
    }

    // 6. Persistence
    if (useLocalMode) {
      logCms(`Applying atomic local write to: ${filePath} (Section: ${sectionKey})`);
      const bakPath = `${absolutePath}.bak`;
      const tmpPath = `${absolutePath}.tmp`;
      
      // Atomic Loop
      try {
        fs.copyFileSync(absolutePath, bakPath);
        fs.writeFileSync(tmpPath, updatedContent);
        fs.renameSync(tmpPath, absolutePath);
        fs.unlinkSync(bakPath);
      } catch (e: any) {
        logCms(`Write failed, restoring from backup.`, 'error');
        if (fs.existsSync(bakPath)) fs.renameSync(bakPath, absolutePath);
        throw e;
      }
    } else {
      logCms(`Committing to GitHub: ${filePath} (Section: ${sectionKey})`);
      const octokit = getOctokit();
      const result = await octokit.repos.createOrUpdateFileContents({
        owner: OWNER,
        repo: REPO,
        path: filePath,
        message: `feat: update ${sectionKey} content [skip ci]`,
        content: Buffer.from(updatedContent, "utf-8").toString("base64"),
        sha,
        branch: "main",
      });
      sha = (result.data as any).content.sha;
    }

    return { 
      success: true, 
      mode: useLocalMode ? "local" : "github", 
      message: `${sectionKey} updated successfully.`,
      data: { newSha: sha } 
    };

  } catch (e: any) {
    logCms(`CMS Error: ${e.message}`, 'error');
    return { success: false, error: e.message, code: 500, mode: useLocalMode ? "local" : "github" };
  } finally {
    if (useLocalMode) isSaving = false;
  }
}

export async function coreGetLatestData(filePath: string): Promise<CmsApiResult> {
  try {
    let rawContent: string;
    
    if (useLocalMode) {
      const absolutePath = validateLocalPath(filePath);
      rawContent = fs.readFileSync(absolutePath, "utf-8");
    } else {
      // PRO TIP: Use Raw GitHub URL with timestamp to bust proxy cache for "Instant" updates
      const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPO}/main/${filePath}?t=${Date.now()}`;
      logCms(`Fetching absolute latest from GitHub Raw: ${filePath}`);
      const res = await fetch(RAW_URL);
      if (!res.ok) throw new Error(`GitHub Raw fetch failed: ${res.statusText}`);
      rawContent = await res.text();
    }

    const data = yaml.parse(rawContent);
    return { 
      success: true, 
      mode: useLocalMode ? "local" : "github", 
      data 
    };
  } catch (e: any) {
    return { success: false, error: e.message, code: 500, mode: useLocalMode ? "local" : "github" };
  }
}

export async function coreGetHistory(filePath: string): Promise<CmsApiResult> {
  if (useLocalMode) {
    return { success: true, mode: "local", message: "Local mode: history unavailable via Git API.", data: { commits: [] } };
  }
  
  try {
    const octokit = getOctokit();
    const commits = await octokit.repos.listCommits({
      owner: OWNER,
      repo: REPO,
      path: filePath,
      per_page: 5,
    });
    
    return {
      success: true,
      mode: "github",
      data: {
        commits: commits.data.map(c => ({
          sha: c.sha,
          message: c.commit.message,
          date: c.commit.committer?.date,
          author: c.commit.author?.name
        }))
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message, code: 500, mode: "github" };
  }
}
