import express from "express";
import Publication from "../models/publication.js";
import User from "../models/user.js";
import { asyncHandler } from "../utils/wrapper.js";
import { upload } from "../middlewares/upload.js";

const router = express.Router();

router.get("/", asyncHandler(async (req, res, next) => {
    const publications = await Publication.find();
    res.json(publications);
}));

router.get("/:id", asyncHandler(async (req, res, next) => {
    const publication
        = await Publication.findById(req.params.id);
    res.json(publication);
}));

router.post("/", upload.fields([{ name: "frontCamera", maxCount: 1 }, { name: "backCamera", maxCount: 1 }]), asyncHandler(async (req, res, next) => {
    const currentUserId = req.currentUserId;
    const publication = new Publication();

    publication.frontCamera = {
        height: req.body.frontCameraHeight,
        width: req.body.frontCameraWidth,
        path: req.files["frontCamera"][0].path
    };

    publication.backCamera = {
        height: req.body.backCameraHeight,
        width: req.body.backCameraWidth,
        path: req.files["backCamera"][0].path
    };

    publication.user = currentUserId;

    await publication.save();

    res.status(201).json(publication);
}));

export default router;