import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwtVerify from "../middleware/jwtVerify";
const prisma = new PrismaClient();

const router = Router();

router.get("/", async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      include: {
        user: {
          select: {
            username: true,
          },
        },
        bookmarks: true,
      },
    });

    return res.status(200).json({ routes });
  } catch (error) {
    let msg = "An unknown error occured.";
    if (error instanceof Error) msg = error.message;
    console.log(msg);
    return res.status(500).json({ msg });
  }
});



export default router;
