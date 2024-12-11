// pages/api/blogs/report.js

import {PrismaClient} from '@prisma/client';
import { withAuthentication } from '../../../utils/withAuthentication';

const prisma = new PrismaClient();

/**
 * POST -> Create a new report
 * GET -> List all reports with pagniation
 * @param {object} req
 * @param {object} res
 * @returns {void}
 */
async function handler(req, res) { 
    if (req.method === 'POST') {
        const { blogId, description, screenshots } = req.body;

        if (!blogId || !description) {
            return res.status(400).json({ error: 'blogId and description must be provided.' });
        }

        try {
            const blog = await prisma.blog.findUnique({
                where: { id: blogId },
            });

            if (!blog) {
                return res.status(404).json({ error: 'Blog not found' });
            }

            // add blogReport to database
            const blogReport = await prisma.blogReport.create({
                data: {
                    blogId,
                    description,
                    screenshots,
                    byUserId: req.user.id
                },
            });

            res.status(201).json({ message: "Success", blogReport: blogReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else if (req.method === "GET") {
        // List all reports for a blog
        const { blogId } = req.query;

        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Forbidden. Admins only' });
            }

            const reports = await prisma.blogReport.groupBy({
                by: ['blogId'],
                _count: {
                    blogId: true,
                },
                where: {
                    resolved: false,
                },
                orderBy: {
                    _count: {
                        blogId: 'desc',
                    },
                },
            });

            return res.status(200).json({ reports });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST', 'GET'] });
