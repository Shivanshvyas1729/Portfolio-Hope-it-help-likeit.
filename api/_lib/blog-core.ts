/**
 * blog-core.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared business logic for blog CMS operations.
 * Used by BOTH Vercel (/api/) and Netlify (netlify/functions/) adapters.
 * Never import platform-specific types here.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";

// ─── GitHub Config ────────────────────────────────────────────────────────────
export const OWNER     = "Shivanshvyas1729";
export const REPO      = "My_personal_portfolio";
export const FILE_PATH = "src/data/blog.yaml";
export const RATE_LIMIT_SECONDS = 30;

// ─── Shared response shape ────────────────────────────────────────────────────
export interface ApiResult {
  status:  number;
  body:    Record<string, unknown>;
  headers?: Record<string, string>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getOctokit() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

async function fetchYaml(octokit: Octokit): Promise<{ sha: string; content: string }> {
  const response = await octokit.repos.getContent({
    owner: OWNER, repo: REPO, path: FILE_PATH, ref: "main",
  });
  const fileData = response.data as any;
  if (fileData.type !== "file") throw new Error("Target path is not a file");
  return {
    sha:     fileData.sha,
    content: Buffer.from(fileData.content, "base64").toString("utf-8"),
  };
}

function parseYaml(rawContent: string): any {
  let parsed = yaml.load(rawContent);
  if (!parsed || typeof parsed !== "object") parsed = { blog: [] };
  if (!Array.isArray((parsed as any).blog))  (parsed as any).blog = [];
  return parsed;
}

async function commitYaml(
  octokit: Octokit,
  sha: string,
  data: any,
  message: string,
): Promise<void> {
  const updated = yaml.dump(data, { indent: 2, lineWidth: -1 });
  const encoded = Buffer.from(updated, "utf-8").toString("base64");
  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER, repo: REPO, path: FILE_PATH,
    message, content: encoded, sha, branch: "main",
  });
}

// ─── 1. Auth check ────────────────────────────────────────────────────────────
export function checkAuth(password: string | undefined): ApiResult | null {
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { status: 401, body: { error: "Invalid Password" } };
  }
  return null; // pass
}

// ─── 2. Save blog post ────────────────────────────────────────────────────────
export async function coreSaveBlog(
  password: string | undefined,
  blogData: any,
): Promise<ApiResult> {
  // Auth
  const authErr = checkAuth(password);
  if (authErr) return authErr;

  // Ping-only check (AdminAuth verifies password without blog data)
  if (!blogData?.title || !blogData?.content || !blogData?.category) {
    return { status: 400, body: { error: "Bad Request: Missing required blog fields" } };
  }

  const octokit = getOctokit();

  // Rate limit
  try {
    const commits = await octokit.repos.listCommits({
      owner: OWNER, repo: REPO, path: FILE_PATH, per_page: 1,
    });
    if (commits.data.length > 0) {
      const lastDate = commits.data[0].commit.committer?.date;
      if (lastDate) {
        const elapsed = (Date.now() - new Date(lastDate).getTime()) / 1000;
        if (elapsed < RATE_LIMIT_SECONDS) {
          const retryAfter = Math.ceil(RATE_LIMIT_SECONDS - elapsed);
          return {
            status:  429,
            headers: { "Retry-After": String(retryAfter) },
            body:    { error: `Rate limited. Please wait ${retryAfter}s before submitting again.`, retryAfter },
          };
        }
      }
    }
  } catch (e: any) {
    console.warn("Rate-limit check failed (non-fatal):", e.message);
  }

  // Fetch + parse YAML
  let sha: string, rawContent: string;
  try {
    ({ sha, content: rawContent } = await fetchYaml(octokit));
  } catch (e: any) {
    return { status: 500, body: { error: `Failed to access GitHub repo. Status: ${e.status}. ${e.message}` } };
  }

  let parsed: any;
  try {
    parsed = parseYaml(rawContent);
  } catch {
    return { status: 500, body: { error: "Failed to parse existing YAML data." } };
  }

  // Duplicate check
  const isDuplicate = parsed.blog.some(
    (p: any) =>
      p.title.toLowerCase() === blogData.title.trim().toLowerCase() &&
      p.date === new Date().toISOString().split("T")[0],
  );
  if (isDuplicate) {
    return { status: 409, body: { error: "Duplicate blog entry detected for today." } };
  }

  // Build new post
  let highestId = 0;
  for (const p of parsed.blog) {
    if (p.id && typeof p.id === "number" && p.id > highestId) highestId = p.id;
  }

  const words = blogData.content.trim().split(/\s+/).length;
  const slug  = blogData.title.trim().toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g,  "-")
    .replace(/^-+|-+$/g,  "");

  const newPost = {
    id:          highestId + 1,
    title:       blogData.title.trim(),
    slug,
    readingTime: Math.max(1, Math.ceil(words / 200)),
    content:     blogData.content.trim(),
    category:    blogData.category.trim(),
    type:        Array.isArray(blogData.type) ? blogData.type : [],
    link:        blogData.link?.trim() ?? "",
    date:        new Date().toISOString().split("T")[0],
    featured:    !!blogData.featured,
    draft:       !!blogData.draft,
    ...(Array.isArray(blogData.resources) && blogData.resources.length > 0
      ? { resources: blogData.resources }
      : {}),
  };

  parsed.blog.push(newPost);

  // Commit
  try {
    await commitYaml(octokit, sha, parsed, `chore(blog): add "${newPost.title}" via CMS [skip ci]`);
  } catch (e: any) {
    return { status: 500, body: { error: "Failed to commit to repository. SHA collision — try again." } };
  }

  return {
    status: 200,
    body:   { message: "Blog post committed successfully! Deployment skipped (batched).", post: { id: newPost.id, slug: newPost.slug, title: newPost.title } },
  };
}

// ─── 3. Delete blog post ──────────────────────────────────────────────────────
export async function coreDeleteBlog(
  password: string | undefined,
  postId:   number | undefined,
  postSlug: string | undefined,
): Promise<ApiResult> {
  // Auth
  const authErr = checkAuth(password);
  if (authErr) return authErr;

  if (postId === undefined && !postSlug) {
    return { status: 400, body: { error: "Bad Request: postId or postSlug required" } };
  }

  const octokit = getOctokit();

  // Fetch + parse YAML
  let sha: string, rawContent: string;
  try {
    ({ sha, content: rawContent } = await fetchYaml(octokit));
  } catch (e: any) {
    return { status: 500, body: { error: `Failed to access GitHub repo. ${e.message}` } };
  }

  let parsed: any;
  try {
    parsed = parseYaml(rawContent);
  } catch {
    return { status: 500, body: { error: "Failed to parse existing YAML data." } };
  }

  const originalLength = parsed.blog.length;
  parsed.blog = parsed.blog.filter((post: any) => {
    if (postId   !== undefined && post.id   === postId)   return false;
    if (postSlug && post.slug === postSlug)                return false;
    return true;
  });

  if (parsed.blog.length === originalLength) {
    return { status: 404, body: { error: "Post not found in blog.yaml" } };
  }

  // Commit
  const label = postSlug ? `"${postSlug}"` : `#${postId}`;
  try {
    await commitYaml(octokit, sha, parsed, `chore(blog): delete post ${label} via CMS [skip ci]`);
  } catch (e: any) {
    return { status: 500, body: { error: "Failed to commit deletion. SHA collision — try again." } };
  }

  return {
    status: 200,
    body:   { message: `Post ${label} deleted successfully. Deployment skipped (batched).`, deleted: { id: postId, slug: postSlug } },
  };
}
