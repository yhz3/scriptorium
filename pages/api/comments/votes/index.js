import {PrismaClient} from '@prisma/client';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient();
/**
 * POST -> Register the vote
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const authorId = req.user.id;

            const { upVote, commentId } = req.body;
            if (upVote === undefined || upVote === null) {
                return res.status(400).json({ error: "upVote must present. Return true for a upvote, false for a downvote." });
            }
            if (!commentId) {
                return res.status(400).json({ error: "commentId must be provided." });
            }

            const commentIdInt = parseInt(commentId, 10);

            // Ensure that the comment exists given commentId
            const comment = await prisma.comment.findUnique({
                where: { id: commentIdInt }
            });

            if (!comment) {
                return res.status(404).json({ error: "Comment not found." });
            }

            const existingVote = await prisma.commentVote.findUnique({
                where: {
                    comment_by_unique: {
                        commentId: commentIdInt,
                        by: authorId
                    },
                },
            });

            if (existingVote !== null) {
                if (existingVote.upVote === upVote) {
                    // remove the vote if the same vote is clicked again
                    await prisma.commentVote.delete({
                        where: { upvoteId: existingVote.upvoteId },
                    });
                } else {
                    // switch the vote if the opposite vote is clicked
                    await prisma.commentVote.update({
                        where: { upvoteId: existingVote.upvoteId },
                        data: { upVote },
                    });
                }
            } else {
                // create a new vote
                await prisma.commentVote.create({
                    data: {
                        upVote,
                        commentId: commentIdInt,
                        by: authorId,
                    },
                });
            }
        
            // recalculate the rating
            const votes = await prisma.commentVote.findMany({
                where: { commentId: commentIdInt },
            });

            const upvotes = votes.filter((v) => v.upVote).length;
            const downvotes = votes.length - upvotes;

            // Compute rating
            const rating = upvotes - downvotes;

            await prisma.comment.update({
                where: { id: commentIdInt },
                data: { rating },
            });
            
            return res.status(201).json({ message: "Success", rating });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
