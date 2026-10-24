import { Router, type IRouter } from "express";
import healthRouter from "./health";
import interpretRouter from "./interpret";

const router: IRouter = Router();

router.use(healthRouter);
router.use(interpretRouter);

export default router;
