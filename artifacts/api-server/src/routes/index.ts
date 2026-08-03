import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import swipesRouter from "./swipes";
import likesRouter from "./likes";
import demoRouter from "./demo";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(swipesRouter);
router.use(likesRouter);
router.use(demoRouter);

export default router;
