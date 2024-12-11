import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../../utils/updateErrorExamine';
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

            const { upVote, blogId } = req.body;
            if (upVote === undefined || upVote === null) {
                return res.status(400).json({ error: "upVote must present. Return true for a upvote, false for a downvote." });
            }
            if (!blogId) {
                return res.status(400).json({ error: "blogId must be provided." });
            }

            let data = {
                upVote: upVote,
                blogId: parseInt(blogId),
                by: authorId
            };

            // Ensure that the blog exists given blogId
            const blog = await prisma.blog.findUnique({
                where: { id: parseInt(blogId) }
            });

            if (!blog) {
                return res.status(404).json({ error: "Blog not found." });
            }

            // Register the vote
            const vote = await prisma.blogVote.create({
                data: data
            });

            // Retrieve all votes for the blog
            const votes = await prisma.blogVote.findMany({
                where: { blogId: parseInt(blogId) }
            });

            // Calculate upvotes and downvotes
            let upvotes = 0;
            let downvotes = 0;
            votes.forEach(vote => {
                if (vote.upVote) {
                    upvotes++;
                } else {
                    downvotes++;
                }
            });

            // Compute rating
            const rating = upvotes - downvotes;

            // Update the blog's rating
            await prisma.blog.update({
                where: { id: parseInt(blogId) },
                data: { rating: rating }
            });

            return res.status(201).json({ message: "Success", newVote: vote });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error});
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });