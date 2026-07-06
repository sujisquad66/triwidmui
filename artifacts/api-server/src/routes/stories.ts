import { Router, type IRouter } from "express";
import { ListStoriesQueryParams, ListStoriesResponse } from "@workspace/api-zod";
import { getStories } from "../lib/stories";

const router: IRouter = Router();

router.get("/stories", async (req, res): Promise<void> => {
  const parsed = ListStoriesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { lang } = parsed.data;
  const { stories, available } = await getStories(lang);

  req.log.info({ lang, count: stories.length, available }, "Listed stories");

  res.json(
    ListStoriesResponse.parse({
      stories,
      lang,
      available,
    }),
  );
});

export default router;
