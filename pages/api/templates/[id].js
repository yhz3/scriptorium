// pages/api/templates/[id].js

import { PrismaClient } from '@prisma/client';
import updateErrorExamine from '../../../utils/updateErrorExamine';
import { withAuthentication } from '../../../utils/withAuthentication';
import { SUPPORTED_LANGS } from '../../../config';

const prisma = new PrismaClient();

/**
 * GET -> Get a template
 * PUT -> Update a template 
 * DELETE -> Remove a template
 * @param {string} req 
 * @param {string} res 
 * @returns {object}
 */
async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid or missing template ID' });
    }

    const templateId = parseInt(id, 10);
    
    if (req.method === 'GET') {
        try {
            // get template by id
            const template = await prisma.template.findUnique({
                where: { id: templateId },
                include: {
                    author: { 
                        select: { id: true, firstName: true, lastName: true } 
                    },
                },
            });

            if (!template) {
                return res.status(404).json({ error: 'Template not found' });
            }

            return res.status(200).json({ message: "GET template success", 
                template: template});
        } catch (error) {
            const errRes = updateErrorExamine(error);
            return res.status(errRes.code).json({ error: errRes.error });
        }
    } else if (req.method === 'PUT') {
        // update template with given id
        try {
            const { title, explanation, code, tags, blogIds, language } = req.body
            const user = req.user; // from withAuthentication

            // get the existing template
            const existingTemplate = await prisma.template.findUnique({
                where: { id: templateId },
            });

            // make sure the template exists
            if (!existingTemplate) {
                return res.status(404).json({ error: "Template not found." });
            }

            // make sure the user is the author of the template
            if (existingTemplate.authorId !== user.id) {
                return res.status(403).json({ error: "You are not authorized to update this template." });
            }

            // build the updated data object
            const updatedData = {};

            // only update the fields that are present in the request body
            if (title) {
                if (typeof title !== 'string' || title.trim() === '') {
                    return res.status(400).json({ error: "Title must be a non-empty string." });
                }
                updatedData.title = title.trim();
            }
            if (explanation) {
                if (typeof explanation !== 'string') {
                    return res.status(400).json({ error: "Explanation must be a string." });
                }
                updatedData.explanation = explanation;
            }
            if (code) {
                if (typeof code !== 'string') {
                    return res.status(400).json({ error: "Code must be a non-empty string." });
                }
                updatedData.code = code;
            }
            if (language) {
                if (!SUPPORTED_LANGS.includes(language)) {
                    return res.status(400).json({
                        error: 'Language not supported.',
                        supportedLanguages: SUPPORTED_LANGS,
                    });
                }
                updatedData.language = language;
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
                updatedData.tags = { connect: tagsArray.map(tag => ({ name: tag })) };
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
                updatedData.blogs = { connect: blogIdsArray.map(blogId => ({ id: parseInt(blogId) })) };
            }

            // update the template
            const updatedTemplate = await prisma.template.update({
                where: { id: templateId },
                data: updatedData,
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                },
            });

            return res.status(200).json({ template: updatedTemplate });
        } catch (error) {
            console.error('Error in PUT /api/templates/[id]', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        // delete template
        try {
            const user = req.user; // from withAuthentication

            const existingTemplate = await prisma.template.findUnique({
                where: { id: templateId },
            });

            if (!existingTemplate) {
                return res.status(404).json({ error: "Template not found." });
            }

            // make sure the user is the author of the template
            if (existingTemplate.authorId !== user.id) {
                return res.status(403).json({ error: "You are not authorized to delete this template." });
            }

            // delete the template
             const deletedUser = await prisma.template.delete({
                 where: {id: templateId},
             });

             return res.status(200).json({ message: "Template deleted successfully." });
         } catch (error) {
             const errRes = updateErrorExamine(error);
             return res.status(errRes.code).json({ error: errRes.error});
         }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler, { methods: ['PUT', 'DELETE'] });
