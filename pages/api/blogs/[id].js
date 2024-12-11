import { PrismaClient } from "@prisma/client";
import { withAuthentication } from "../../../utils/withAuthentication";

const prisma = new PrismaClient();

/**
 * GET -> Get a blog
 * PUT -> Update a blog
 * DELETE -> Remove a blog
 * @param {string} req 
 * @param {string} res 
 */
async function handler(req, res) {
    const { id } = req.query;

    if (!id || isNaN(parseInt(id, 10))) {
        return res.status(400).json({ error: "Invalid blog id" });
    }

    const blogId = parseInt(id, 10);
    
    if (req.method === "GET") {
        try {
            const blog = await prisma.blog.findUnique({
                where: { id: blogId },
                include: {
                    author: {
                        select: { id: true, firstName: true, lastName: true }
                    },
                    tags: true,
                },
            });

            if (blog) {
                return res.status(200).json({message: "Success", blog: blog});
            } else {
                return res.status(404).json({ error: "Blog not found" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === "PUT") {
        try {

            const oldBlog = await prisma.blog.findUnique({
                where: { id: parseInt(id) }
            });

            if (req.user.id != oldBlog.authorId) {
                return res.status(401).json({ error: "Unauthorized to update blog!" });
            }    
            
            const { title, description, content, tags } = req.body;
            let data = {};
            if (title) {
                data.title = title;
            }
            if (description) {
                data.description = description;
            }
            if (content) {
                data.content = content;

                // find templates in content
                const templateIdsFromContent = await extractTemplateIdsFromContent(content);
                if (templateIdsFromContent.length > 0) {
                    data.templates = {
                        connect: templateIdsFromContent.map((id) => ({ id })),
                    };
                }
            }

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
            if (templateIds) {
                const templatesArray = templateIds.split(',').map(templateId => templateId.trim());
                for (let templateId of templatesArray) {
                    const templateObj = await prisma.tag.findUnique({
                        where: { id: parseInt(templateId) },
                    });
                    if (!templateObj) {
                        return res.status(400).json({ error: `Template with id ${templateId} not found.` });
                    }
                }
                data.templates = { connect: templatesArray.map(templateId => ({ id: parseInt(templateId) })) };
            }
            if (!data) {
                return res.status(400).json({ error: "Request body empty. "});
            }

            const updatedBlog = await prisma.blog.update({
                where: { id: blogId },
                data: data,
            });
            return res.status(200).json({message: "Success", Blog: updatedBlog});
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else if (req.method === "DELETE") {
        try {

            const oldBlog = await prisma.blog.findUnique({
                where: { id: parseInt(id) }
            });

            if (req.user.id != oldBlog.authorId) {
                return res.status(401).json({ error: "Unauthorized to delete blog!" });
            }

            const deletedBlog = await prisma.blog.delete({
                where: { id: parseInt(id) },
            });

            if (!deletedBlog) {
                return res.status(404).json({ error: "Blog not found given id." });
            }

            return res.status(200).json({ message: "Success", removed: deletedBlog });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    } else {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
}

export default withAuthentication(handler,  { methods: ['PUT', 'DELETE'] })
