import {PrismaClient} from '@prisma/client';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient();
/**
 * POST -> Create a new comment on a post
 * GET -> Get Comments on a Post Sorted by Ratings
 * @param {object} req 
 * @param {object} res 
 */
async function handler(req, res) {
    const { id } = req.query;

    if (req.method === 'POST') {

        const { content } = req.body;

        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Content is required and must be a string' });
        }

        try {
            // Check if the post exists
            const blog = await prisma.blog.findUnique({
                where: { id: parseInt(id) },
            });

            if (!blog) {
                return res.status(404).json({ error: 'Post not found' });
            }

            // create the comment
            const comment = await prisma.comment.create({
                data: {
                    content,
                    blog: { connect: { id: blog.id } },
                    author: { connect: { id: req.user.id } },
                    rating: 0,
                },
            });

            return res.status(201).json({ message: 'Comment created successfully.', comment });
        } catch (error) {
            console.error('Error creating comment:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === "GET") {
        const blogId = id;
        const { page, pageSize } = req.query;
        const pageNum = parseInt(page, 10) || 1; // default to page 1
        const pageSizeNum = parseInt(pageSize, 10) || 10; // default to 10 items per page

        try {
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Invalid page number' });
            }

            if (isNaN(pageSizeNum) || pageSizeNum < 1) {
                return res.status(400).json({ error: 'Invalid page size' });
            }

            const skip = (pageNum - 1) * pageSizeNum;
            const take = pageSizeNum;

            // check if the post exists
            const blog = await prisma.blog.findUnique({
                where: { id: parseInt(blogId) },
            });

            if (!blog) {
                return res.status(404).json({ error: 'Post not found' });
            }

            const where = {
                blogId: blog.id,
                parentId: null,
            };

            // get comments sorted by ratings (votes), with pagination
            const comments = await prisma.comment.findMany({
                where: {
                    blogId: blog.id,
                    parentId: null,
                },
                include: {
                    author: {
                        select: { id: true, username: true },
                    },
                    replies: false,
                    votes: {
                        where: {
                            by: req.user ? req.user.id : undefined,
                        },
                        select: {
                            upVote: true,
                        },
                    },
                },
                skip,
                take,
            });

            const commentsWithUserVote = comments.map((comment) => {
                const userVote = comment.votes[0]?.upVote ?? null;
                return {
                    ...comment,
                    userVote,
                    votes: undefined,
                };
            });

            // calculate ratings for each comment
            const commentsWithRatings = comments.map((comment) => {
                const upvotes = comment.votes.reduce((acc, upvote) => {
                    return acc + (upvote.upVote ? 1 : -1);
                }, 0);
                return { ...comment, rating: upvotes };
            });

            // sort comments by rating (descending)
            commentsWithRatings.sort((a, b) => b.rating - a.rating);

            // get total count
            const totalComments = await prisma.comment.count({ where });

            return res.status(200).json({
                comments: commentsWithRatings,
                total: totalComments,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(totalComments / pageSizeNum),
            });
        } catch (error) {
            console.error('Error fetching comments:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
