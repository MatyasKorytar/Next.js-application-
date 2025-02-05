import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { get } from "http";
import { stat } from "fs";

const prisma = new PrismaClient();

export function GET(req: NextRequest) {


    getUserIdFromRequest(req)
    return NextResponse.json( {status: 200})

}

export async function POST(req: NextRequest, res: NextResponse) {
  // if (req.method !== "POST") {
  //   return res.status(405).json({ message: "Method not allowed" });
  // } 

  getUserIdFromRequest(req)
  
  
  // console.log(res)
  // const session = await getSession({ req });
  // console.log("session", session)
  // if (!session) {
  //   return res.status(401).json({ message: "Unauthorized" });
  // }

  // try {
  //   const { contentId, text } = req.body;
  //   if (!contentId || !text) {
  //     return res.status(400).json({ message: "Missing data" });
  //   }

  //   const comment = await prisma.comment.create({
  //     data: {
  //       contentId,
  //       userId: Number(session.user.id), // Přidáme ID přihlášeného uživatele
  //       text,
  //     },
  //     include: {
  //       user: true, // Vrátíme i email uživatele
  //     },
  //   });

  //   res.status(201).json(comment);
  // } catch (error) {
  //   console.error("Error adding comment:", error);
  // }
  return NextResponse.json({status: 200})
}


function getUserIdFromRequest(req: NextRequest) {
  
  const autHeader = req.headers; // Access the authorization header directly as a plain object.
  console.log("autHeader", autHeader)
}