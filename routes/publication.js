import express from "express";

import { authorize } from "../middlewares/authorize.js";
import { handlePublicationUpload } from "../controllers/upload.js";
import {
    getPublications,
    getPublication,
    createPublication,
    deletePublication,
} from "../controllers/publication.js";

const router = express.Router();

router.get("/", getPublications);
router.get("/:id", getPublication);
router.post("/", handlePublicationUpload, createPublication);
router.delete("/:id", authorize('admin'), deletePublication); // Only admins can delete publications. Since once the publication is created the only reason to delete is for moderation purposes.

export default router;