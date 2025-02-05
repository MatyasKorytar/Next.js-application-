import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";

const prisma = new PrismaClient();

import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  console.log('ID received in delete request:', id); 

  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const content = await prisma.content.deleteMany({
      where: {
        id: parseInt(id as string),
      },
    });

    console.log('Content deleted:', content); 

    if (content.count === 0) {
      console.log('Content not found or could not be deleted');
      return res.status(404).json({ message: 'Content not found or could not be deleted', log: `Attempted to delete content with ID: ${id}` });
    }

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: "Failed to delete content" });
  }
}
