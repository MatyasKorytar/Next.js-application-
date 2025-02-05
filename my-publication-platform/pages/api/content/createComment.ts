import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

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

    

 
    const comment = await prisma.comment.create({
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

//   console.log("session", session)
//   if (!session) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   console.log("Request Method:", req.method);
//   console.log("Session in API:", session);
//   const accessToken = session.accessToken;

//   try {
//     const { contentId, text } = req.body;
 

//     const comment = await prisma.comment.create({
//       data: {
//         contentId,
//         userId: Number(session.user.id), // Přidáme ID přihlášeného uživatele
//         text,
//       },
//       include: {
//         user: true, // Vrátíme i email uživatele
//       },
//     });


//   return res.status(200).json({ message: `createComment with token ${ accessToken}` });
//   } catch (error) {
//     console.error("Error adding comment:", error);
//   }
// }

}