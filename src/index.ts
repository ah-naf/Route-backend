import { PrismaClient } from "@prisma/client";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
const prisma = new PrismaClient();

import AuthRoute from "../routes/auth";
import ReviewRoute from "../routes/review";
import RoutePostRoute from "../routes/route";
import SearchRoute from "../routes/search";

const app = express();

app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", AuthRoute);
app.use("/api/route", RoutePostRoute);
app.use("/api/review", ReviewRoute);
app.use("/api/search", SearchRoute);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`));
