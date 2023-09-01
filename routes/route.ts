import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwtVerify from "../middleware/jwtVerify";
const prisma = new PrismaClient();

const router = Router();

// Create new Route Post
router.post("/", jwtVerify, async (req, res) => {
  try {
    const { id, title, flow, published, userId } = req.body;
    console.log(title)
    if (userId !== req.user)
      return res.status(403).json({ msg: "You are not authorized" });
    if (!id || !title || !flow || !userId)
      throw new Error("Missing required parameters");

    const routeExist = await prisma.route.findUnique({
      where: { id },
    });

    let msg;
    if (!routeExist) {
      await prisma.route.create({
        data: {
          ...req.body,
        },
      });
    } else {
      await prisma.route.update({
        where: { id },
        data: { ...req.body },
      });
    }

    msg = "Route saved successfully.";
    if (published) msg = "Route published successfully";
    return res.status(201).json({ msg });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    return res.status(500).json({ msg });
  }
});

export default router;
