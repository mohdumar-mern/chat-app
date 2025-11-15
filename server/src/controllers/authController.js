import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import User from "../models/userModels.js";
import HandleError from "../utils/handleError.js";
import { generateToken } from "../utils/generateToken.js";

// ========================================
// @desc    Register a new user
// @route   POST /api/v1/register
// ========================================
export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  if (!name || !email || !password) {
    return next(new HandleError("Please provide all required fields", 400));
  }

  const userExists = await User.findOne({ 
    $or: [{ email }, { phone }],
   });
  if (userExists) {
    return next(new HandleError("User already exists", 400));
  }
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });
});

// ========================================
// @desc    Login user
// @route   POST /api/v1/login
// ========================================
export const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, phone } = req.body;
  console.log(req.body)

  // Validate input
  if ((!email && !phone) || !password) {
    return next(new HandleError("Please provide email or phone number and password", 400));
  }

  // Find user by email OR phone
  const user = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+password");

  if (!user) {
    return next(new HandleError("Invalid credentials", 401));
  }

  // Compare password
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    return next(new HandleError("Invalid credentials", 401));
  }

  // Create token or response (depending on your setup)
    const token = generateToken(user._id);
    const cookieExpireDays = Number(process.env.EXPIRED_COOKIES) || 7;

    
  res.cookie("token", token, {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});


// ========================================
// @desc    Logout user
// @route   POST /api/v1/logout
// ========================================
// export const logoutUser = asyncHandler(async (req, res, next) => {
//   res.cookie("token", null, {
//     expires: new Date(Date.now()),
//     httpOnly: true,
//     secure: process.env.NODE_ENV === "production",
//     sameSite: "strict",
//   });

//   res.status(200).json({
//     success: true,
//     message: "Logged out successfully",
//   });
// });


