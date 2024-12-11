import React from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import BlogForm from '../../components/blogs/BlogForm';
import { Blog } from '../../types/blog';
import { Header } from '..';

const CreateBlog: React.FC = () => {
    const router = useRouter();

    const handleCreate = async (blogData: Blog) => {
        try {
            const response = await axios.post('/api/blogs', blogData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            alert("Blog posting success!");
            // redirect to 
            router.push(`/blogs`);
        } catch (error) {
            // shouldn't get here, as we're handling errors in the form
            console.error('Error creating blog post:', error);
        }
    };

    return <BlogForm onSubmit={handleCreate} />;
};

export { CreateBlog };

export default function Page() {
    return (
        <>
            <Header content="Blog Creation"/>
            <CreateBlog/>
        </>
    )
}
