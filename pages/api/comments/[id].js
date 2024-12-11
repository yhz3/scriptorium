import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../utils/withAuthentication';

const prisma = new PrismaClient();
/**
 * GET -> Get a comment
 * PUT -> Update a comment
 * DELETE -> Remove a comment
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
            });

            if (comment) {
                const { hidden, by } = comment;
                if (hidden) {
                    if (by !== req.user.id) {
                        return res.status(403).json({ error: "Comment is hidden" });
                    } else {
                        res.status(200).json({message: "Success", comment: comment});
                    }
                } else {
                    res.status(200).json({message: "Success", comment: comment});
                }
            } else {
                res.status(404).json({ error: "Comment not found" });
            }
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === "PUT") {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found given id." });
            } 
            
            if (comment.authorId !== req.user.id) {
                return res.status(403).json({ error: "You are not authorized to edit this comment." });
            }

            const {content, attachment} = req.body;
            if (!content && !attachment) {
                return res.status(400).json({ error: "Content or attachment must be provided." });
            }

            let data = {};
            if (content) {
                data.content = content;
            }
            if (attachment) {
                data.attachment = attachment;
            }
            const updatedComment = await prisma.comment.update({
                where: { id: parseInt(id) },
                data: data
            });
            if (!updatedComment) {
                return res.status(404).json({ error: "Comment not found given id." });
            }
            return res.status(200).json({ message: "Success", comment: updatedComment });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === "DELETE") {
        try {
            const comment = await prisma.comment.findUnique({
                where: { id: parseInt(id) }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found given id." });
            } 
            
            if (comment.authorId !== req.user.id) {
                return res.status(403).json({ error: "You are not authorized to delete this comment." });
            }

            const deletedComment = await prisma.comment.delete({
                where: { id: parseInt(id) }
            });

            if (!deletedComment) {
                return res.status(404).json({ error: "Comment not found given id." });
            }
            return res.status(200).json({ message: "Success", comment: deletedComment });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        return res.status(405).json({ error: "Method not supported. "});
    }
}

export default withAuthentication(handler, { methods: ['PUT', 'DELETE'] });
