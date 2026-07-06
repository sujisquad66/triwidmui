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

const PIXIV_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  Accept: "application/json",
  Referer: `https://www.pixiv.net/en/users/${PIXIV_USER_ID}/novels`,
};

const PIXIV_NOVEL_CONCURRENCY = 5;
const PIXIV_MAX_NOVELS = 24;

function pixivContentToExcerpt(content: string): string {
  const text = stripHtml(content.replace(/\n/g, " <br/> "));
  return text.length > 220 ? `${text.slice(0, 220)}…` : text;
}

async function fetchPixivNovelDetail(id: string): Promise<RawStory | null> {
  try {
    const res = await fetch(`https://www.pixiv.net/ajax/novel/${id}?lang=en`, {
      headers: {
        ...PIXIV_HEADERS,
        Referer: `https://www.pixiv.net/en/novel/show.php?id=${id}`,
      },
    });
    if (!res.ok) {
      logger.warn({ status: res.status, id }, "Failed to load Pixiv novel detail");
      return null;
    }
    const json = (await res.json()) as any;
    if (json.error) {
      logger.warn({ message: json.message, id }, "Pixiv novel detail returned an error");
      return null;
    }

    const body = json.body ?? {};
    const content: string = body.content ?? body.description ?? "";

    return {
      id: String(body.id ?? id),
      title: body.title ?? `Novel #${id}`,
      excerpt: pixivContentToExcerpt(content) || "A tale from the pixiv archive — open it to read the full entry.",
      coverImage: body.coverUrl ?? PLACEHOLDER_COVER,
      link: `https://www.pixiv.net/en/novel/show.php?id=${id}`,
      publishedAt: body.createDate ?? body.uploadDate ?? new Date().toISOString(),
      source: "pixiv",
    };
  } catch (err) {
    logger.error({ err, id }, "Error fetching Pixiv novel detail");
    return null;
  }
}

async function fetchPixivStories(): Promise<StoryResult> {
  try {
    const res = await fetch(
      `https://www.pixiv.net/ajax/user/${PIXIV_USER_ID}/profile/all?lang=en`,
      { headers: PIXIV_HEADERS },
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
    const novelIds = Object.keys(novelsMap).slice(0, PIXIV_MAX_NOVELS);

    if (novelIds.length === 0) {
      return { stories: [], available: true };
    }

    const stories: RawStory[] = [];
    for (let i = 0; i < novelIds.length; i += PIXIV_NOVEL_CONCURRENCY) {
      const batch = novelIds.slice(i, i + PIXIV_NOVEL_CONCURRENCY);
      const results = await Promise.all(batch.map(fetchPixivNovelDetail));
      for (const story of results) {
        if (story) stories.push(story);
      }
    }

    stories.sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );

    return { stories, available: stories.length > 0 };
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
