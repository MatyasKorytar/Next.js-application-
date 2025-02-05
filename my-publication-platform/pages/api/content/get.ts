import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';


export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    console.log("Request Method:", req.method);
    if (req.method === 'GET') {
        const session = await getSession({ req });
        console.log("Session in API:", session);
        console.log("Authorization Header:", req.headers.authorization);
        return res.status(200).json({ message: 'GET request to /api/content' });
    }


}
