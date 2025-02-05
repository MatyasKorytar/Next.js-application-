import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { contentId, token, userId } = req.body;
  console.log("Request Body:", req.body);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const existingLike = await prisma.like.findFirst({
      where: { contentId: Number(contentId), userId: Number(userId) },
    });

    if (existingLike) {
      await prisma.like.delete({ where: { id: existingLike.id } });
      console.log("Like removed");
      return res.status(200).json({ message: "Like removed" });
    } else {
      await prisma.like.create({
        data: { contentId: Number(contentId), userId: Number(userId) },
      });
      console.log("Like added");
      return res.status(200).json({ message: "Like added" });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return res.status(500).json({ message: "Server error" });
  }
}
