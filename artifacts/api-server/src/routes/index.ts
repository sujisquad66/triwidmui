import { Router, type IRouter } from "express";
import healthRouter from "./health";
import videosRouter from "./videos";
import storiesRouter from "./stories";

const router: IRouter = Router();

router.use(healthRouter);
router.use(videosRouter);
router.use(storiesRouter);

export default router;
