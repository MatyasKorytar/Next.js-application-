import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { id } = req.query;
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
  }

  try {
    const content = await prisma.content.updateMany({
      where: {
        id: parseInt(id as string),
        user: { email: session.user?.email as string },
      },
      data: { title, body },
    });

    if (!content.count) {
      return res.status(404).json({ message: "Content not found or not owned by user" });
    }

    res.status(200).json({ message: "Content updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update content" });
  }
}
