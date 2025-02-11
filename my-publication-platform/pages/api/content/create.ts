import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { title, body, token, userId } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const session = await getSession({ req });
    if (session && session.accessToken) {
      const content = await prisma.content.create({
        data: {
          title,
          body,
          userId: parseInt(userId),
        },
      });
      return res.status(201).json({
        message: "Content created successfully",
        data: content,
      });
    } else {
      const content = await prisma.content.create({
        data: {
          title,
          body,
          user: {
            connect: { id: Number(userId) },
          },
        },
      });
      return res.status(201).json({
        message: "Content created successfully without authentication",
        data: content,
      });
    }
  } catch (error) {
    console.error("Error creating content:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
