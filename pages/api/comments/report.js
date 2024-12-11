// pages/api/comments/report.js

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
    if (req.method === "POST") {
        const { commentId, description, screenshots } = req.body;

        if (!commentId || !description) {
            return res.status(400).json({ error: "commentId and description must be provided." });
        }

        try {
            const comment = await prisma.comment.findUnique({
                where: { id: commentId },
            });

            console.log(req.body);

            if (!comment) {
                return res.status(404).json({ error: "Comment not found." });
            }

            const commentReport = await prisma.commentReport.create({
                data: {
                    commentId,
                    description,
                    screenshots,
                    byUserId: req.user.id,
                },
            });

            return res.status(201).json({ commentReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === "GET") {
        // List all reports with pagniation
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: "Forbidden. Admins only." });
            }

            const reports = await prisma.commentReport.groupBy({
                by: ['commentId'],
                _count: {
                    commentId: true,
                },
                where: {
                    resolved: false,
                },
                orderBy: {
                    _count: {
                        commentId: 'desc',
                    },
                },
            });

            return res.status(200).json({ reports });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}

export default withAuthentication(handler, { methods: ['POST', 'GET'] });
