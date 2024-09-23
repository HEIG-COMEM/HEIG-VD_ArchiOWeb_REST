import express from "express";
import User from "../models/user.js";
import { asyncHandler } from "../utils/wrapper.js";

const router = express.Router();

router.get("/all", asyncHandler(async (req, res, next) => {
    const users = await User.find();
    res.json(users);
}));

router.get("/:id", asyncHandler(async (req, res, next) => {
    const user
        = await User.findById(req.params.id);
    res.json(user);
}));

export default router;