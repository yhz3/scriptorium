import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../../utils/updateErrorExamine'

const prisma = new PrismaClient()
/**
 * GET -> Get a commentVote
 * PUT -> Update a commentVote
 * DELETE -> Delete a commentVote
 * @param {string} req 
 * @param {string} res 
 */
export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method === "GET") {
        try {
            const blogVote = await prisma.blogVote.findUnique({
                where: {id: parseInt(id)}
            });

            if (!blogVote) {
                return res.status(404).json({ error: "blogVote not found." });
            }
            return res.status(200).json({ message: "Success", blogVote: blogVote }); 
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === "PUT") {
        try {
            const { upVote } = req.body;
            if (!upVote) {
                return res.status(400).json({ error: "upVote must present. true for an upvote, false for a downvote." });
            }
            let data = { upVote: upVote };
            const newVote = await prisma.blogVote.update({
                where: {id: parseInt(id)},
                data: data
            });
            if (!newVote) {
                return res.status(404).json({ error: "blogVote not found." });
            }
            return res.status(200).json({ message: "Success", newVote: newVote });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        } 
    } else if (req.method === "DELETE") {
        try {
            const deletedblogVote = await prisma.blogVote.delete({
                where: {id: parseInt(id)}
            });
            if (!deletedblogVote) {
                return res.status(404).json({ error: "commentVote not found given id." });
            }
            return res.status(200).json({ message: "Success", deletedblogVote: deletedblogVote });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}