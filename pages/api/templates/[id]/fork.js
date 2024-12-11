import { PrismaClient } from '@prisma/client';
import { withAuthentication } from '../../../../utils/withAuthentication';

const prisma = new PrismaClient();

/**
 * handler for forking a template.
 * supports POST method.
 * @param {object} req - http request object
 * @param {object} res - http response object
 */
async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: 'Invalid or missing template ID' });
    }

    const templateId = parseInt(id, 10);

    if (req.method === 'POST') {
        // fork a template by ID
        try {
            const user = req.user;

            // fetch the original template
            const originalTemplate = await prisma.template.findUnique({
                where: { id: templateId },
                include: {
                    author: { select: { id: true, username: true } },
                },
            });

            if (!originalTemplate) {
                return res.status(404).json({ error: 'Original template not found' });
            }

            // get title for the new template
            const newTitle = req.body.title;

            // ensure if user doesn't already have template with same title
            if (newTitle) {
                const existingTemplate = await prisma.template.findFirst({
                    where: { title: newTitle, authorId: user.id },
                });

                if (existingTemplate) {
                    return res.status(400).json({ error: 'Template with the same title already exists' });
                }
            }

            // ensure if user is forking own template, then title is provided
            if (originalTemplate.author.id === user.id && !newTitle) {
                return res.status(400).json({ error: 'New title is required for forking own template' });
            }

            // create a new template with the same content under the current user's account
            const forkedTemplate = await prisma.template.create({
                data: {
                    title: newTitle || originalTemplate.title,
                    explanation: originalTemplate.explanation,
                    code: originalTemplate.code,
                    language: originalTemplate.language,
                    tags: originalTemplate.tags,
                    author: { connect: { id: user.id } },
                    forkedFrom: { connect: { id: originalTemplate.id } },
                },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                },
            });

            return res.status(201).json({ template: forkedTemplate });
        } catch (error) {
            console.error('Error in POST /api/templates/[id]/fork:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}

export default withAuthentication(handler, { methods: ['POST'] });
