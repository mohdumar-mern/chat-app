import User from "../models/userModels.js";
import asyncHandler from "express-async-handler";


// ========================================
// @desc    Get all users except the logged-in user
// @route   POST /api/v1/users
// ========================================
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } });
  res.json(users);
})