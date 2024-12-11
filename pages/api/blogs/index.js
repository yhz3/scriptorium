import {PrismaClient} from '@prisma/client';
import updateErrorExamine from '../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../utils/withAuthentication';
import authenticate from '../../../utils/authenticate';

const prisma = new PrismaClient();
/**
 * POST -> Create a new blog
 * GET -> Get filtered blogs based on search query with pagination
 * @param {object} req 
 * @param {object} res 
 * @returns 
 */
async function handler(req, res) {
    if (req.method === "POST") {
        try {

            const authorId = req.user.id;

            const {title, description, content, tags, templateIds} = req.body;
            if (!title) {
                return res.status(400).json({ error: "Title must be present." });
            }
            if (!description) {
                return res.status(400).json({ error: "Description must be present." });
            }
            if (!content) {
                return res.status(400).json({ error: "Content must be present." });
            }
            
            let data = {title: title, description: description,
                content: content, author: { connect: { id: authorId } }};
                if (tags) {
                    const tagsArray = tags.map(tag => tag.trim());
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

                // for getting template ids from content
                const templateIdsFromContent = await extractTemplateIdsFromContent(content);
                if (templateIdsFromContent.length > 0) {
                    data.templates = {
                        connect: templateIdsFromContent.map((id) => ({ id })),
                    };
                }

                // for manually added templates (probably unnecessary)
                if (templateIds) {
                    const templatesArray = templateIds.map(templateId => templateId);
                    for (let templateId of templatesArray) {
                        // ensure templateId is a valid number
                        if (isNaN(parseInt(templateId))) {
                            return res.status(400).json({ error: `Invalid template id ${templateId}` });
                        }
                        const templateObj = await prisma.template.findUnique({
                            where: { id: parseInt(templateId) },
                        });
                        if (!templateObj) {
                            return res.status(400).json({ error: `Template with id ${templateId} not found.` });
                        }
                    }
                    data.templates = { connect: templatesArray.map(templateId => ({ id: parseInt(templateId) })) };
                }
                
                const newBlog = await prisma.blog.create({
                    data: data
                });
                return res.status(201).json({ message: "Success", blog: newBlog });
            } catch (error) {
                console.error('Error in creating blog', error);
                const errRes = updateErrorExamine(error);
                return res.status(errRes.code).json({ error: errRes.error});
            }
        } else if (req.method === "GET") {
        // List filtered blogs with pagniation
        try {
            const { page, pageSize, search, tags, template } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const pageSizeNum = parseInt(pageSize, 10) || 10;

            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({ error: 'Invalid page number' });
            }

            if (isNaN(pageSizeNum) || pageSizeNum < 1) {
                return res.status(400).json({ error: 'Invalid page size' });
            }

            if (template && isNaN(parseInt(template, 10))) {
                return res.status(400).json({ error: 'Invalid template id' });
            }

            const skip = (pageNum - 1) * pageSizeNum;
            const take = pageSizeNum;

            const conditions = [];

            // handle search parameter
            if (search) {
                const searchConditions = [
                        { title: { contains: search } },
                        { description: { contains: search } },
                        { content: { contains: search } },
                        { tags: { some: { name: { contains: search } } } },
                        { templates: { some: { title: { contains: search } } } },
                        { templates: { some: { code: { contains: search } } } },
                    ];
                    conditions.push({ OR: searchConditions });
            }

            // handle tags parameter
            if (tags) {
                const tagsArray = tags.split(',').map(tag => tag.trim());
                conditions.push({
                    tags: {
                        some: {
                            name: { in: tagsArray },
                        },
                    },
                });
            }

            if (template) {
                conditions.push({
                    templates: {
                        some: {
                            id: parseInt(template, 10),
                        },
                    },
                });
            }

            // check if user is authenticated or not to handle hidden blogs
            try {
                const user = await authenticate(req);
            } catch (error) {
                if (error.message !== 'Authorization header missing.') {
                    return res.status(401).json({ error: error.message });
                }
            }

            if (req.user && req.user.id) {
                // if user is authenticated, show their own hidden blogs as well
                conditions.push({
                    OR: [
                        { hidden: false },
                        {
                            AND: [
                                { hidden: true },
                                { authorId: req.user.id },
                            ],
                        },
                    ],
                });
            } else {
                // visitor can only see non-hidden blogs
                conditions.push({ hidden: false });
            }

            // build where clause
            const where = conditions.length > 0 ? { AND: conditions } : {};

            const blogs = await prisma.blog.findMany({
                where,
                skip,
                take,
                include: {
                    author: {
                        select: { id: true, username: true, firstName: true, lastName: true },
                    },
                    tags: {
                        select: { id: true, name: true },
                    },
                    templates: {
                        select: { id: true, title: true },
                    },
                    upvotes: true,
                },
            });

            // calculate ratings for each blog
            // note blog.upvotes.upVote = true if upvoted, false if downvoted
            const blogsWithRatings = blogs.map(blog => {
                const upvotes = blog.upvotes.reduce((acc, upvote) => {
                    return acc + (upvote.upVote ? 1 : -1);
                }, 0);
                return {
                    ...blog,
                    rating: upvotes,
                };
            });

            // sort blogs by rating in descending order
            blogsWithRatings.sort((a, b) => b.rating - a.rating);

            // get total count
            const totalBlogs = await prisma.blog.count({ where });

            return res.status(200).json({
                blogs: blogsWithRatings,
                total: totalBlogs,
                page: pageNum,
                pageSize: pageSizeNum,
                totalPages: Math.ceil(totalBlogs / pageSizeNum),
            });
        } catch (error) {
            console.error('Error fetching blogs', error);
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error});
        }
    } else {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
}

// helper for getting template ids from blog content
async function extractTemplateIdsFromContent(content) {
    const templateIds = [];
    const regex = /@template\[(.*?)\]/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const mention = match[1].trim();
        let template;

        if (!isNaN(parseInt(mention))) {
            template = await prisma.template.findUnique({
                where: { id: parseInt(mention) },
            });
        } else {
            template = await prisma.template.findFirst({
                where: { title: { equals: mention } },
            });
        }

        if (template) {
            templateIds.push(template.id);
        }
    }

    return templateIds;
}

export default withAuthentication(handler, { methods: ['POST'] });
