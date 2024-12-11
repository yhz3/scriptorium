import React from 'react';
import { Blog } from '../../types/blog';
import BlogCard from './BlogCard';

interface BlogListProps {
    blogs: Blog[];
}

const BlogList: React.FC<BlogListProps> = ({ blogs }) => {
    if (blogs.length === 0) {
        return <p className='text-black dark:text-white' style={{
            fontFamily: 'monospace',
            fontSize: '17px',
            textAlign: 'center',
            marginTop: '20vh'
        }}>No blog posts found.</p>;
    }

    return (
        <div className="grid grid-cols-1 gap-4">
            {blogs.map(blog => (
                <BlogCard key={blog.id} blog={blog} />
            ))}
        </div>
    );
};

export default BlogList;
