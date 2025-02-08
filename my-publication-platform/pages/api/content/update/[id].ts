// pages/api/content/update/content/[id].ts
import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { title, body } = req.body;  // Předpokládám, že obsah má "title" a "body"

  const contentId = parseInt(id as string);

  if (isNaN(contentId) || !title || !body) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: { title, body },
    });

    res.status(200).json({ message: "Content updated successfully", updatedContent });
  } catch (error) {
    console.error("Error updating content:", error);
    res.status(500).json({ message: "Error updating content" });
  }
}
