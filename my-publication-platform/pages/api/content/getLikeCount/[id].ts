import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;  // Získání `contentId` z URL parametru
  console.log("Received contentId:", id);

  if (!id) {
    return res.status(400).json({ message: "Missing contentId" });
  }

  try {
    // Předpokládáme, že "Like" je tabulka s liky spojenými s "content"
    const likeCount = await prisma.like.count({
      where: { contentId: Number(id) },  // Převod id na číslo
    });

    return res.status(200).json({ likeCount });
  } catch (error) {
    console.error("Error fetching like count:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
