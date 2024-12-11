import {PrismaClient} from '@prisma/client';
import { withAuthentication } from '../../../utils/withAuthentication';

const prisma = new PrismaClient();

/**
 * POST -> Register the commentReport
 * GET -> Search commentReports with pagniation
 * @param {object} req
 * @param {object} res
 * @returns {void}
 */
async function handler(req, res) {
    if (req.method === "PUT") {
        try {

            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ error: "You are not authorized to hide a comment. Reason: not an admin." });
            }
            
            const { id } = req.body;

            const where = { id: parseInt(id) };
            const hidden = true;
            
            const updatedBlog = await prisma.blog.update({
                where: where,
                data: { hidden: hidden }
            });

            return res.status(200).json({ message: "Success", blog: updatedBlog });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}

export default withAuthentication(handler, { methods: ['PUT'] });
