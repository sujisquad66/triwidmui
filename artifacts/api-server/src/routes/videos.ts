import { Router, type IRouter } from "express";
import {
  ListVideosQueryParams,
  ListVideosResponse,
  listVideosQueryPageDefault,
  listVideosQueryPageSizeDefault,
} from "@workspace/api-zod";
import { getVideos } from "../lib/youtube";

const router: IRouter = Router();

router.get("/videos", async (req, res): Promise<void> => {
  const parsed = ListVideosQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const page = parsed.data.page ?? listVideosQueryPageDefault;
  const pageSize = parsed.data.pageSize ?? listVideosQueryPageSizeDefault;

  const allVideos = await getVideos();
  const totalItems = allVideos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = (page - 1) * pageSize;
  const videos = allVideos.slice(start, start + pageSize);

  req.log.info({ page, pageSize, totalItems }, "Listed videos");

  res.json(
    ListVideosResponse.parse({
      videos,
      page,
      pageSize,
      totalItems,
      totalPages,
    }),
  );
});

export default router;
