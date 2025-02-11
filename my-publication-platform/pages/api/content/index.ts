import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const contents = await prisma.content.findMany({
      include: {
        user: true, 
        comments: {
          include: {
            user: true, 
          },
          orderBy: { createdAt: "desc" }, 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
}
