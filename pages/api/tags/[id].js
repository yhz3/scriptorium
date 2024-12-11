import { PrismaClient } from '@prisma/client';
import updateErrorExamine from '../../../utils/updateErrorExamine';

const prisma = new PrismaClient();

/**
 * GET -> Get a tag
 * PUT -> Update a tag
 * DELETE -> Remove a tag
 * @param {string} req
 * @param {string} res
 */
async function handler(req, res) {
    const {id} = req.query;
    
    if (req.method === "GET") {
        try {
            const tag = await prisma.tag.findUnique({
                where: {id: parseInt(id)},
            });

            if (tag) {
                res.status(200).json({ message: "Success",
                    tag: tag
                });
            } else {
                res.status(404).json({ error: "Tag not found." });
            }
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === "DELETE") {
        try {

            const role = req.user.role;

            if (role !== "ADMIN") {
                return res.status(403).json({ error: "Unauthorized: must be an admin to delete a tag!" });
            }

            const deletedTag = await prisma.tag.delete({
                where: { id: parseInt(id) },
            });

            res.status(200).json({ message: "Success", removedTag: deletedTag });
        } catch (error) {
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['DELETE'] });