import { XMLParser } from "fast-xml-parser";
import { logger } from "./logger";

const YOUTUBE_HANDLE = "triwidmui";
const FEED_TTL_MS = 5 * 60 * 1000;

export interface RawVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  url: string;
}

let cachedVideos: RawVideo[] | null = null;
let cachedAt = 0;
let cachedChannelId: string | null = null;

async function resolveChannelId(): Promise<string | null> {
  if (cachedChannelId) return cachedChannelId;

  try {
    const res = await fetch(`https://www.youtube.com/@${YOUTUBE_HANDLE}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TriwidArchiveBot/1.0)" },
    });
    if (!res.ok) {
      logger.warn({ status: res.status }, "Failed to load YouTube channel page");
      return null;
    }
    const html = await res.text();
    const match = html.match(/"channelId":"(UC[\w-]{22})"/);
    if (match) {
      cachedChannelId = match[1];
      return cachedChannelId;
    }
    logger.warn("Could not find channelId in YouTube channel page");
    return null;
  } catch (err) {
    logger.error({ err }, "Error resolving YouTube channel id");
    return null;
  }
}

async function fetchFeed(): Promise<RawVideo[]> {
  const channelId = await resolveChannelId();
  if (!channelId) return [];

  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    );
    if (!res.ok) {
      logger.warn({ status: res.status }, "Failed to load YouTube RSS feed");
      return [];
    }
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);
    const entries = parsed?.feed?.entry;
    const list = Array.isArray(entries) ? entries : entries ? [entries] : [];

    return list.map((entry): RawVideo => {
      const videoId: string = entry["yt:videoId"] ?? "";
      const thumbnail =
        entry["media:group"]?.["media:thumbnail"]?.["@_url"] ??
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
      return {
        id: videoId,
        title: entry.title ?? "Untitled",
        thumbnailUrl: thumbnail,
        publishedAt: entry.published ?? new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${videoId}`,
      };
    });
  } catch (err) {
    logger.error({ err }, "Error fetching YouTube RSS feed");
    return [];
  }
}

export async function getVideos(): Promise<RawVideo[]> {
  const now = Date.now();
  if (cachedVideos && now - cachedAt < FEED_TTL_MS) {
    return cachedVideos;
  }

  const videos = await fetchFeed();
  if (videos.length > 0) {
    cachedVideos = videos;
    cachedAt = now;
    return videos;
  }

  // Serve stale cache on failure rather than an empty list.
  return cachedVideos ?? [];
}
