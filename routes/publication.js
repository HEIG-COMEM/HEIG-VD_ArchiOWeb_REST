import express from "express";

import { handlePublicationUpload } from "../controllers/upload.js";
import {
    getPublications,
    getPublication,
    createPublication
} from "../controllers/publication.js";

const router = express.Router();

router.get("/", getPublications);
router.get("/:id", getPublication);
router.post("/", handlePublicationUpload, createPublication);

export default router;