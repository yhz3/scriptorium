import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient();
/**
 * POST -> Reply to an existing comment
 * GET -> Query and pagniate comments
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    const { id } = req.query;

    if (req.method === "POST") {
        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Content is required and must be a string' });
        }

        try {
            // Check if the parent comment exists
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
            });    

            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }

            console.log(parentComment);

            // Create the reply
            const reply = await prisma.comment.create({
                data: {
                    content,
                    blog: { connect: { id: parentComment.blogId } },
                    author: { connect: { id: req.user.id } },
                    parent: { connect: { id: parentComment.id } },
                    rating: 0,
                },
            });

            console.log(reply);

            return res.status(201).json({ message: 'Reply created successfully', reply });
        } catch (error) {
            console.error('Error creating reply:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === "GET") {
        const { page, pageSize } = req.query;
        const pageNum = parseInt(page, 10) || 1;
        const pageSizeNum = parseInt(pageSize, 10) || 10;

        try {
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Invalid page number' });
            }

            if (isNaN(pageSizeNum) || pageSizeNum < 1) {
                return res.status(400).json({ error: 'Invalid page size' });
            }

            const skip = (pageNum - 1) * pageSizeNum;
            const take = pageSizeNum;


            // check if the parent comment exists
            const parentComment = await prisma.comment.findUnique({
                where: { id: parseInt(id) },
            });

            if (!parentComment) {
                return res.status(404).json({ error: 'Parent comment not found' });
            }

            const where = { parentId: parentComment.id };

            // get replies sorted by rating (votes), with pagination
            const replies = await prisma.comment.findMany({
                where: {
                    parentId: parentComment.id,
                },
                include: {
                    author: {
                        select: { id: true, username: true },
                    },
                    replies: false,
                    votes: true,
                },
                skip,
                take,
            });

            // calculate ratings for each reply
            const repliesWithRatings = replies.map((reply) => {
                const upvotes = reply.votes.reduce((acc, upvote) => {
                    return acc + (upvote.upVote ? 1 : -1);
                }, 0);
                return { ...reply, rating: upvotes };
            });

            // sort replies by rating (descending)
            repliesWithRatings.sort((a, b) => b.rating - a.rating);

            // get total count of replies
            const totalReplies = await prisma.comment.count({ where });

            return res.status(200).json({
                comments: repliesWithRatings,
                total: totalReplies,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(totalReplies / pageSizeNum),
            });
        } catch (error) {
            console.error('Error fetching replies:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
