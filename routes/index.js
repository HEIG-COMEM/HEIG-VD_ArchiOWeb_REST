import express from "express";
import authRouter from "./auth.js";
import userRouter from "./user.js";
import publicationRouter from "./publication.js";
import friendRouter from "./friend.js";

import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.get("/", (req, res, next) => {
	res.send("Ignition!");
});

// Special route for /status
router.get("/status", (req, res) => {
	res.status(200).send("ok");
});

router.use("/auth", authRouter);
router.use("/users", authenticate, userRouter);
router.use("/publications", authenticate, publicationRouter);
router.use("/friends", authenticate, friendRouter);

export default router;
