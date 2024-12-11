import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../utils/withAuthentication';
import { SUPPORTED_LANGS } from '../../../config';

const prisma = new PrismaClient();

/**
 * POST -> Create a new template
 * GET -> Get filtered templates based on query parameters with pagination
 * @param {object} req
 * @param {object} res
 * @returns {void}
 */
async function handler(req, res) { 
    if (req.method === 'POST') {
        // create a new template
        const { title, explanation, code, language, tags, blogIds } = req.body;

        // validate input
        if (!title) {
            return res.status(400).json({ error: "title must be provided." });
        }
        if (!code) {
            return res.status(400).json({ error: "code must be provided." });
        }
        if (!language) {
            return res.status(400).json({ error: "language must be provided." });
        }
        if (!explanation) {
            return res.status(400).json({ error: "explanation must be provided." });
        }
        if (!SUPPORTED_LANGS.includes(language)) {
            return res.status(400).json({
                error: "Language not supported.",
                supportedLanguages: SUPPORTED_LANGS,
            });
        }

        try {

            // validate that user doesn't already have a template with the same title
            const existingTemplate = await prisma.template.findFirst({
                where: {
                    title: title,
                    authorId: req.user.id,
                },
            });
            if (existingTemplate) {
                return res.status(400).json({ error: "You already have a template with this title." });
            }

            /* note that we have access to req.user because of withAuthentication.
             * connect is prisma's way of linking the template to 
             * the existing author with an id the matches req.user.id.
             * authorId is also automatically set this way since it is
             * a prisma field of Author.
            */
            let data = {
                title: title,
                code: code,
                language: language,
                author: { connect: { id: req.user.id } }
            }
            if (explanation) {
                data.explanation = explanation;
            }
            if (tags) {
                const tagsArray = tags.split(',').map(tag => tag.trim());
                for (let tag of tagsArray) {
                    const tagObj = await prisma.tag.findUnique({
                        where: { name: tag },
                    });
                    if (!tagObj) {
                        const newTag = await prisma.tag.create({
                            data: { name: tag },
                        });
                    }
                }
                data.tags = { connect: tagsArray.map(tag => ({ name: tag })) };
            }
            if (blogIds) {
                const blogIdsArray = blogIds.split(',').map(blogId => blogId.trim());
                for (let blogId of blogIdsArray) {
                    const blogObj = await prisma.blog.findUnique({
                        where: { id: parseInt(blogId) },
                    });
                    if (!blogObj) {
                        return res.status(400).json({ error: `Template with id ${blogId} not found.` });
                    }
                }
                data.blogIds = { connect: blogIdsArray.map(blogId => ({ id: parseInt(blogId) })) };
            }

            // add template to database
            const template = await prisma.template.create({
                data: data
            });
            res.status(201).json(template);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error." });
        }
    } else if (req.method === 'GET') {
        try {
            const { page, pageSize, search, tags, authorId, language } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const pageSizeNum = parseInt(pageSize, 10) || 10;

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Invalid page number' });
            }

            if (isNaN(pageSizeNum) || pageSizeNum < 1) {
                return res.status(400).json({ error: 'Invalid page size' });
            }

            const skip = (pageNum - 1) * pageSizeNum;
            const take = pageSizeNum;

            // filtering
            const conditions = [];

            // search filter including tags
            if (search) {
                const searchConditions = [
                    { title: { contains: search } },
                    { explanation: { contains: search } },
                    { code: { contains: search } },
                    { tags: { some: { name: { contains: search } } } },
                ];
                conditions.push({ OR: searchConditions });
            }

            // tags filter with case-insensitive matching
            if (tags) {
                const tagsArr = tags.split(',').map(tag => tag.trim());
                conditions.push({
                    OR: tagsArr.map(tag => ({
                        tags: {
                            some: {
                                name: { equals: tag },
                            },
                        },
                    })),
                });
            }

            // author id filter (for user's own templates)
            if (authorId) {
                // check if authorId is a number
                if (isNaN(authorId)) {
                    return res.status(400).json({ error: 'Invalid author ID' });
                }

                // check if there is an existing author with the given ID
                const author = await prisma.user.findUnique({
                    where: { id: parseInt(authorId, 10) },
                });
                if (!author) {
                    return res.status(400).json({ error: 'No author found with the given ID' });
                }

                conditions.push({ authorId: parseInt(authorId, 10) });
            }

            // language filter
            if (language) {
                if (!SUPPORTED_LANGS.includes(language)) {
                    return res.status(400).json({
                        error: "Language not supported in filter.",
                        supportedLanguages: SUPPORTED_LANGS,
                    });
                }
                conditions.push({ language });
            }

            // build where clause
            const where = conditions.length > 0 ? { AND: conditions } : {};

            const result = await prisma.template.findMany({
                where,
                skip,
                take,
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                    tags: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            const totalTemplates = await prisma.template.count({ where });

            return res.status(200).json({
                templates: result,
                total: totalTemplates,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(totalTemplates / pageSizeNum),
            });
        } catch (error) {
            console.error(error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
