import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BlogForm from '../../../components/blogs/BlogForm';
import { Blog } from '../../../types/blog';

const EditBlog: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [blogData, setBlogData] = useState<Blog | undefined>(undefined);
    
    useEffect(() => {
        if (id) {
        axios.get(`/api/blogs/${id}`)
            .then(response => {
                const blog = response.data.blog;
                setBlogData({
                    id: blog.id,
                    title: blog.title,
                    description: blog.description,
                    content: blog.content,
                    tags: blog.tags.map((tag: any) => tag.name),
                    templateIds: blog.templates.map((template: any) => template.id),
                    templates: blog.templates,
                    author: blog.author,
                    rating: blog.rating || 0,
                    createdAt: blog.createdAt,
                    updatedAt: blog.updatedAt,
                });
            })
            .catch(error => {
                console.error('Error fetching blog post:', error);
                // TODO: handle error
            });
        }
    }, [id]);

    const handleUpdate = async (updatedData: Blog) => {
        try {
            await axios.put(`/api/blogs/${id}`, updatedData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            router.push(`/blogs/${id}`);
        } catch (error) {
            console.error('Error updating blog post:', error);
            //TODO: handle error
        }
    };

    return <BlogForm initialData={blogData} onSubmit={handleUpdate} />;
};

export default EditBlog;

