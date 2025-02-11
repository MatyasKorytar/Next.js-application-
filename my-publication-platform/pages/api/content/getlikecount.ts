import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { contentId } = req.query;
  if (!contentId || Array.isArray(contentId)) {
    return res.status(400).json({ message: "Content ID is required" });
  }

  try {
    const likeCount = await prisma.like.count({
      where: {
        contentId: parseInt(contentId),
      },
    });

    res.status(200).json({ likeCount });
  } catch (error) {
    console.error("Error fetching like count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
