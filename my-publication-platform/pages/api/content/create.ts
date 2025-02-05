import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
   
    const session = await getSession({ req });
    console.log("Session in API:", session);
    console.log("Authorization Header:", req.headers.authorization);

    
    if (req.method === 'POST') {
     
      const { title, body } = req.body;

     
      if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required' });
      }

    
      if (session && session.accessToken) {
        console.log("Authorized User:", session.user);

        
        const content = await prisma.content.create({
          data: {
            title,
            body,
            userId: Number(session.user.id), 
          },
        });

        return res.status(201).json({
          message: 'Content created successfully',
          data: content, 
        });
      } else {
        console.log("No session or access token, proceeding without authorization");

        
        const content = await prisma.content.create({
          data: {
            title,
            body,
            user: {
              connect: { id: 1 }
            }
          },
        });

        return res.status(201).json({
          message: 'Content created successfully without authorization',
          data: content,
        });
      }
    }
    return res.status(405).json({ message: 'Method Not Allowed' });

  } catch (error) {
    console.error("Error in API:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
