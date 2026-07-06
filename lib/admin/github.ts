/**
 * Thin wrapper around the GitHub Contents API — this is what makes
 * "save" in the admin panel actually mean something on a static,
 * read-only-at-runtime Vercel deployment: instead of writing to disk,
 * we commit the file straight to your repo. Vercel's Git integration
 * then auto-redeploys, and the live site catches up ~30–60s later.
 */

const API_BASE = "https://api.github.com";

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "yourname/debasishlenka-in"
  const branch = process.env.GITHUB_BRANCH || "main";
  if (!token || !repo) {
    throw new Error(
      "GITHUB_TOKEN and GITHUB_REPO environment variables must be set for the admin panel to work. See NOTES-from-claude.md for setup steps."
    );
  }
  return { token, repo, branch };
}

async function githubFetch(path: string, init?: RequestInit) {
  const { token } = getConfig();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

export type GithubFile = {
  path: string;
  sha: string;
  content: string; // decoded UTF-8 content
};

export async function listBlogFiles(): Promise<{ name: string; path: string }[]> {
  const { repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/content/blog?ref=${branch}`);
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub list failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as Array<{ type: string; name: string; path: string }>;
  return data
    .filter((f) => f.type === "file" && f.name.endsWith(".mdx"))
    .map((f) => ({ name: f.name, path: f.path }));
}

export async function getBlogFile(path: string): Promise<GithubFile | null> {
  const { repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}?ref=${branch}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub read failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { path: string; sha: string; content: string };
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { path: data.path, sha: data.sha, content };
}

export async function putBlogFile(
  path: string,
  content: string,
  message: string,
  sha?: string
) {
  const { repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    throw new Error(`GitHub write failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}

export async function deleteBlogFile(path: string, message: string, sha: string) {
  const { repo, branch } = getConfig();
  const res = await githubFetch(`/repos/${repo}/contents/${path}`, {
    method: "DELETE",
    body: JSON.stringify({ message, sha, branch }),
  });
  if (!res.ok) {
    throw new Error(`GitHub delete failed (${res.status}): ${await res.text()}`);
  }
  return res.json();
}
