import bcrypt from "bcrypt";
import cookie from "cookie";
import { Router } from "express";
import jwt from "jsonwebtoken";
import jwtVerify from "../middleware/jwtVerify";

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const router = Router();

// User Login
router.post("/login", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
    });

    if (!user)
      return res
        .status(403)
        .json({ msg: "User with the email doesn't exist." });

    // Check Password
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(401).json({ msg: "Invalid email/password" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1hr",
    });

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      })
    );

    const { password, ...rest } = user;

    res.status(200).json({ msg: "Login Successful.", user: rest, token });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    return res.status(500).json({ msg });
  }
});

// User Register
router.post("/register", async (req, res) => {
  try {
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: req.body.email }, { username: req.body.username }],
      },
    });

    if (existUser)
      return res
        .status(409)
        .json({ msg: "User with the email or username already exist!" });

    const hasehdPass = await bcrypt.hash(req.body.password, 10);

    const { password, ...createdUser } = await prisma.user.create({
      data: {
        ...req.body,
        password: hasehdPass,
      },
    });

    const token = jwt.sign(
      { id: createdUser.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1hr",
      }
    );

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 3600,
        path: "/",
      })
    );

    res
      .status(201)
      .json({ user: createdUser, token, msg: "User registered successfully" });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    return res.status(500).json({ msg });
  }
});

// Verify if user is still logged in
router.get("/verify", jwtVerify, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user as string,
      },
    });

    if (!user)
      return res
        .status(403)
        .json({ msg: "User with the email doesn't exist." });

    const { password, ...rest } = user;

    res.status(200).json({
      msg: "User is still logged in",
      user: rest,
      token: req.cookies.auth,
    });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    return res.status(500).json({ msg });
  }
});

// User logout
router.get("/logout", jwtVerify, async (req, res) => {
  res.removeHeader("Set-Cookie");
  res.clearCookie("auth");
  res
    .status(200)
    .json({ msg: "User logged out successfully", user: null, token: "" });
});

export default router;
