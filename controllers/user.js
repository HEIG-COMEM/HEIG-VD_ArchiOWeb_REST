import User from "../models/user.js";
import { asyncHandler } from "../utils/wrapper.js";
import bcrypt from "bcrypt";

export const getUsers = asyncHandler(async (req, res, next) => {
	const pageSize = parseInt(req.query.pageSize) || 10;
	const page = parseInt(req.query.page) || 1;

	const users = await User.find()
		.limit(pageSize)
		.skip(pageSize * (page - 1));

	const count = await User.countDocuments();

	res.set("Pagination-Page", page);
	res.set("Pagination-PageSize", pageSize);
	res.set("Pagination-Total", count);

	res.json(users);
});

export const getUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	res.json(user);
});

// TODO : Middleware to ensure the only auth user or admin
export const updateUser = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	user.name = req.body.name;

	const plainPassword = req.body.password;
	const costFactor = 10;

	const hashedPassword = await bcrypt.hash(plainPassword, costFactor);

	user.password = hashedPassword;
	user.email = req.body.email;

	user.profilePictureUrl =
		req.body.profilePictureUrl ||
		User.schema.path("profilePictureUrl").defaultValue;

	await user.save();

	res.json(user);
});

export const updateUserData = asyncHandler(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	user.name = req.body.name || user.name;

	if (req.body.password) {
		const plainPassword = req.body.password;
		const costFactor = 10;
		const hashedPassword = await bcrypt.hash(plainPassword, costFactor);
		user.password = hashedPassword;
	}

	user.email = req.body.email || user.email;
	user.profilePictureUrl =
		req.body.profilePictureUrl || user.profilePictureUrl;

	await user.save();

	res.json(user);
});

export const deleteUser = asyncHandler(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);
	res.status(204).end();
});
