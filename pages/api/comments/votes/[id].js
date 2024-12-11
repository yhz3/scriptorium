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
            const commentVote = await prisma.commentVote.findUnique({
                where: {id: parseInt(id)}
            });

            if (!commentVote) {
                return res.status(404).json({ error: "commentVote not found." });
            }
            return res.status(200).json({ message: "Success", commentVote: commentVote }); 
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
            const newVote = await prisma.commentVote.update({
                where: {id: parseInt(id)},
                data: data
            });
            if (!newVote) {
                return res.status(404).json({ error: "commentVote not found." });
            }
            return res.status(200).json({ message: "Success", newVote: newVote });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === "DELETE") {
        try {
            const deletedCommentVote = await prisma.commentVote.delete({
                where: {id: parseInt(id)}
            });
            if (!deletedCommentVote) {
                return res.status(404).json({ error: "commentVote not found given id." });
            }
            return res.status(200).json({ message: "Success", deletedCommentVote: deletedCommentVote });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}
