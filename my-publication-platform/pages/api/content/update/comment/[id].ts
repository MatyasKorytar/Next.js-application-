import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;
  const { text } = req.body;

  const commentId = parseInt(id as string);

  if (isNaN(commentId) || !text) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { text },
    });

    res.status(200).json({ message: "Comment updated successfully", updatedComment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ message: "Error updating comment" });
  }
}
