// api/tags/index.js
import {PrismaClient} from "@prisma/client";
import updateErrorExamine from "../../../utils/updateErrorExamine";
import { withAuthentication } from "../../../utils/withAuthentication";

/**
 * POST -> Registering the tag
 * GET -> Query and pagniate the tag 
 * @param {string} req
 * @param {string} res
 * @returns {object}
 */
const prisma = new PrismaClient();
export default async function handler(req, res) {
    if (req.method === "POST") {
        try {
            const { name } = req.body;

            if (!name) {
            return res.status(400).json({ error: 'Tag name is required' });
            }

            const newTag = await prisma.tag.create({
            data: {
                name,
            },
            });

            return res.status(201).json({ tag: newTag });
        } catch (error) {
            console.log(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } if (req.method === "GET") {
         try {
            const { page = '1', pageSize = '10', search } = req.query;
            const pageNum = parseInt(page, 10);
            const pageSizeNum = parseInt(pageSize, 10);

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Invalid page number' });
            }

            if (isNaN(pageSizeNum) || pageSizeNum < 1) {
                return res.status(400).json({ error: 'Invalid page size' });
            }

            const skip = (pageNum - 1) * pageSizeNum;
            const take = pageSizeNum;

            const where = {};
            if (search) {
                where.name = { contains: search };
            }

            let tags = {};
            tags = await prisma.tag.findMany({
                where,
                skip,
                take,
            });

            if (tags.length === 0) {
                return res.status(404).json({ error: "No tag found."});
            }
            
            return res.status(200).json({ tags });
         } catch (error) {
            console.log(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error}); 
         }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}