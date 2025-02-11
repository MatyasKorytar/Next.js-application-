import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { id } = req.query;

  console.log("Received DELETE request for contentId:", id);

  if (!id) {
    return res.status(400).json({ message: "Content ID is required" });
  }

  try {

    const contentId = parseInt(id as string);
    console.log("Parsed contentId:", contentId);
  

    const deletedContent = await prisma.content.delete({
      where: { id: contentId },
    });
  
    console.log("Deleted content:", deletedContent);
  
    res.status(200).json({ message: "Content deleted successfully", deletedContent });
  } catch (error: unknown) {
    console.error("Error deleting content:", error);
  

    if (error instanceof Error) {
      res.status(500).json({ message: "Error deleting content", error: error.message });
    } else {
      res.status(500).json({ message: "Error deleting content", error: "Unknown error" });
    }
  }
}