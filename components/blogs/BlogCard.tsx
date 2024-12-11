import React from 'react';
import Link from 'next/link';
import { Blog } from '../../types/blog';

interface BlogCardProps {
    blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {

    console.log('Tags:', blog.tags);

    return (
        <div className="border p-4 rounded shadow">
            <Link href={`/blogs/${blog.id}`}>
                <h2 className="text-x1 font-bold hover:text-blue-500">{blog.title}</h2>
            </Link>
            <p className="text-gray-400">{blog.description}</p>

            {/* Tags */}
            <div className="mt-2 flex flex-wrap">
                {blog.tags && blog.tags.length > 0 ? (
                    blog.tags.map((tag) => {
                        const typedTag = tag as { id: number, name: string };
                        return (
                            <span
                                key={tag.id}
                                className="text-sm text-black dark:text-white px-2 py-1 mr-2 mb-2 rounded"
                            >
                                {typedTag.name}
                            </span>
                        );
                    })
                ) : (
                    <p className="text-black dark:text-white" style={{ fontFamily: "monospace" }}>
                        No tags
                    </p>
                )}
            </div>
        </div>
    );
};

export default BlogCard;
