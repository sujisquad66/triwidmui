import { XMLParser } from "fast-xml-parser";
import { logger } from "./logger";

export interface RawStory {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  link: string;
  publishedAt: string;
  source: string;
}

interface StoryResult {
  stories: RawStory[];
  available: boolean;
}

const STORY_TTL_MS = 10 * 60 * 1000;
const PLACEHOLDER_COVER =
  "https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800&q=60";

const BLOGGER_FEEDS: Record<"id" | "en", string> = {
  id: "https://triwidmui-horor-indo.blogspot.com/feeds/posts/default?alt=json&max-results=30",
  en: "https://triwidmui-en-horror.blogspot.com/feeds/posts/default?alt=json&max-results=30",
};

const PIXIV_USER_ID = "117291873";

const cache = new Map<string, { data: StoryResult; cachedAt: number }>();

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstImage(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}

async function fetchBloggerStories(lang: "id" | "en"): Promise<StoryResult> {
  try {
    const res = await fetch(BLOGGER_FEEDS[lang]);
    if (!res.ok) {
      logger.warn({ status: res.status, lang }, "Failed to load Blogger feed");
      return { stories: [], available: false };
    }
    const json = (await res.json()) as any;
    const entries: any[] = json?.feed?.entry ?? [];

    const stories: RawStory[] = entries.map((entry) => {
      const rawContent: string =
        entry.content?.["$t"] ?? entry.summary?.["$t"] ?? "";
      const title: string = entry.title?.["$t"] ?? "Untitled";
      const link =
        (entry.link ?? []).find((l: any) => l.rel === "alternate")?.href ??
        "#";
      const id: string = entry.id?.["$t"] ?? link;
      const publishedAt: string = entry.published?.["$t"] ?? new Date().toISOString();
      const cover = extractFirstImage(rawContent) ?? PLACEHOLDER_COVER;
      const text = stripHtml(rawContent);
      const excerpt = text.length > 220 ? `${text.slice(0, 220)}…` : text;

      return {
        id,
        title,
        excerpt: excerpt || "A story waits in the dark archive.",
        coverImage: cover,
        link,
        publishedAt,
        source: "blogger",
      };
    });

    stories.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return { stories, available: true };
  } catch (err) {
    logger.error({ err, lang }, "Error fetching Blogger stories");
    return { stories: [], available: false };
  }
}

async function fetchPixivStories(): Promise<StoryResult> {
  try {
    const res = await fetch(
      `https://www.pixiv.net/ajax/user/${PIXIV_USER_ID}/profile/novels?lang=en`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; TriwidArchiveBot/1.0)",
          Accept: "application/json",
        },
      },
    );
    if (!res.ok) {
      logger.warn({ status: res.status }, "Failed to load Pixiv novel list");
      return { stories: [], available: false };
    }
    const json = (await res.json()) as any;
    if (json.error) {
      logger.warn({ message: json.message }, "Pixiv API returned an error");
      return { stories: [], available: false };
    }

    const novelsMap: Record<string, unknown> = json.body?.novels ?? {};
    const novelIds = Object.keys(novelsMap);

    if (novelIds.length === 0) {
      return { stories: [], available: true };
    }

    const stories: RawStory[] = novelIds.map((id) => ({
      id,
      title: `Novel #${id}`,
      excerpt: "A tale from the pixiv archive — open it to read the full entry.",
      coverImage: PLACEHOLDER_COVER,
      link: `https://www.pixiv.net/en/novel/show.php?id=${id}`,
      publishedAt: new Date().toISOString(),
      source: "pixiv",
    }));

    return { stories, available: true };
  } catch (err) {
    logger.error({ err }, "Error fetching Pixiv stories");
    return { stories: [], available: false };
  }
}

export async function getStories(lang: "id" | "en" | "ja"): Promise<StoryResult> {
  const now = Date.now();
  const cached = cache.get(lang);
  if (cached && now - cached.cachedAt < STORY_TTL_MS) {
    return cached.data;
  }

  const result =
    lang === "ja" ? await fetchPixivStories() : await fetchBloggerStories(lang);

  if (result.available) {
    cache.set(lang, { data: result, cachedAt: now });
    return result;
  }

  return cached?.data ?? { stories: [], available: false };
}
