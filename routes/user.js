import express from "express";

import {
	getUsers,
	getUser,
	updateUser,
	updateUserData,
	deleteUser,
} from "../controllers/user.js";

const router = express.Router();

router.get("/", getUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.patch("/:id", updateUserData);
router.delete("/:id", deleteUser);

export default router;
