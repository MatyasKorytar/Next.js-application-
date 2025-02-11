import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  } 
  

  const { contentId, text, token, userId } = req.body;
  console.log("Request Body:", req.body);
  console.log(`${contentId}${text} ${token}`)
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  console.log("create")
  try{
    await prisma.comment.create({
      data: {
        contentId,
        userId: parseInt(userId),
        text,
      }
    });
    console.log("create2")
    res.status(200).json("{comment}");
  }
  catch (error) {
    console.log("Error adding comment:", error);
  }
  res.status(200).json({ message: "createComment" });

}