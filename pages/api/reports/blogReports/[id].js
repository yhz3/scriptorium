pages/api/reports/blogReports/[id].js

import {PrismaClient} from '@prisma/client';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient()

/**
 * GET -> Get a blogReport
 * PUT -> Update a blogReport
 * DELETE -> Delete a blogReport
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    const { id } = req.query;
    const blogReportId = parseInt(id);

    if (isNaN(blogReportId)) {
        return res.status(400).json({ error: 'Invalid blog report ID.' });
    }

    if (req.method === "GET") {
        try {
            const blogReport = await prisma.blogReport.findUnique({
                where: { id: blogReportId },
                include: {
                    blog: true,
                    byUser: { select: { id: true, username: true } },
                },
            });

            if (!blogReport) {
                return res.status(404).json({ error: "Blog report not found." });
            }

            if (req.user.role !== 'ADMIN' && req.user.id !== blogReport.byUserId) {
                return res.status(403).json({ error: "Forbidden." });
            }

            return res.status(200).json({ blogReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === "PUT") {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: "Forbidden. Admins only." });
            }

            const { resolved } = req.body;
            const data = {};

            if (typeof resolved === 'boolean') {
                data.resolved = resolved;
            }

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ error: "No valid fields to update." });
            }

            const updatedBlogReport = await prisma.blogReport.update({
                where: {id: blogReportId},
                data,
            });

            return res.status(200).json({ blogReport: updatedBlogReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === "DELETE") {
        try {
            if (req.user.role !== 'ADMIN') {
                return res.status(403).json({ error: 'Fobidden. Admins only.' });
            }

            const deletedBlogReport = await prisma.blogReport.delete({
                where: { id: blogReportId },
            });

            return res.status(200).json({ blogReport: deletedBlogReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}

export default withAuthentication(handler, { methods: ['GET', 'PUT', 'DELETE'] });
