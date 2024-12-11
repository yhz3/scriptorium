// pages/api/reports/commentReports/[id].js

import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient();
/**
 * GET -> Get a commentReport
 * PUT -> Update a commentReport
 * DELETE -> Remove a commentReport
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    const { id } = req.query;
    const commentReportId = parseInt(id);

    if (isNaN(commentReportId)) {
        return res.status(400).json({ error: "Invalid comment report id." });
    }

    if (req.method === "GET") {
        try {
            const commentReport = await prisma.commentReport.findUnique({
                where: { id: commentReportId },
                include: {
                    comment: true,
                    byUser: { select: { id: true, username: true } }
                },
            });


            if (!commentReport) {
                return res.status(404).json({ error: "Comment report not found given id." });
            }

            if (req.user.role !== "ADMIN" || req.user.id !== commentReport.byUser) {
                return res.status(403).json({ error: "Forbidden." });
            }
            return res.status(200).json({ commentReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === "PUT") {
        try {

            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ error: "Forbidden. You are not the admin." });
            }

            const { resolved } = req.body;
            let data = {};

            if (typeof resolved === 'boolean') {
                data.resolved = resolved;
            }

            if (Object.keys(data).length === 0) {
                return res.status(400).json({ error: "No valid fields to update." });
            }

            const updatedCommentReport = await prisma.commentReport.update({
                where: { id: commentReportId },
                data,
            });

            return res.status(200).json({ commentReport: updatedCommentReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === "DELETE") {
        try {
            if (req.user.role !== "ADMIN") {
                return res.status(403).json({ error: "Forbidden. You are not the admin." });
            }

            const deletedCommentReport = await prisma.commentReport.delete({
                where: { id: commentReportId },
            });
            return res.status(200).json({ commentReport: deletedCommentReport });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else {
        return res.status(405).json({ message: "Method not supported." });
    }
}

export default withAuthentication(handler, { methods: ['GET', 'PUT', 'DELETE'] });
