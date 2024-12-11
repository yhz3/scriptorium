import { PrismaClient } from "@prisma/client";
import updateErrorExamine from '../../../utils/updateErrorExamine';

const prisma = new PrismaClient();

/**
 * GET -> Return the author object given the authorId
 */
export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'GET') {
        try {
            const author = await prisma.user.findUnique({
                where: { id: parseInt(id) },
            });
            if (author) {
                res.status(200).json(author);
            } else {
                res.status(404).json({ error: "Author not found" });
            }
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        res.status(405).json({ error: "Method not allowed" });
    }
}
