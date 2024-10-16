import Publication from "../models/publication.js";
import { asyncHandler } from "../utils/wrapper.js";

export const getPublications = asyncHandler(async (req, res, next) => {
    const publications = await Publication.find();
    res.json(publications);
});

export const getPublication = asyncHandler(async (req, res, next) => {
    const publication = await Publication.findById(req.params.id);
    res.json(publication);
});

export const createPublication = asyncHandler(async (req, res, next) => {
    const currentUserId = req.currentUserId;
    const publication = new Publication();

    publication.frontCamera = {
        path: req.files["frontCamera"][0].path
    };

    publication.backCamera = {
        path: req.files["backCamera"][0].path
    };

    publication.user = currentUserId;

    await publication.save();

    res.status(201).json(publication);
});