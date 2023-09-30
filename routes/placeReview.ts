import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwtVerify from "../middleware/jwtVerify";
const prisma = new PrismaClient();

const router = Router();

router.post("/", jwtVerify, async (req, res) => {
  try {
    await prisma.review.create({
      data: {
        ...req.body,
        userId: req.user,
      },
    });
    return res.status(200).json({ msg: "Review Added Successfully" });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    console.log(msg);
    return res.status(500).json({ msg });
  }
});

router.get("/place-names", async (req, res) => {
  try {
    const places = await prisma.review.findMany({
      distinct: ["place"],
      select: {
        place: true,
      },
    });
    const place_names = places.map((val) => ({ value: val.place }));
    return res.status(200).json({ place_names });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    console.log(msg);
    return res.status(500).json({ msg });
  }
});

router.get("/", async (req, res) => {
  try {
    const places = await prisma.review.findMany({
      include: {
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });
    return res.status(200).json({ places });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    console.log(msg);
    return res.status(500).json({ msg });
  }
});

export default router;