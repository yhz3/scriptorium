// pages/blog/[id].tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Blog } from '../../types/blog';
import CommentList from '../../components/CommentList';
import CommentForm from '../../components/CommentForm';
import { User } from '../../types/user';
import { Header } from '..';
import ReportButton from '../../components/ReportButton';

const BlogDetail: React.FC = () => {
    const router = useRouter();
    const { id } = router.query;
    const [blog, setBlog] = useState<Blog | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [refreshComments, setRefreshComments] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBlog();
        }
    }, [id]);

    useEffect(() => {
        // fetch user if authenticated
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            axios.get('/api/user/me', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).then(response => {
                setCurrentUser(response.data.user);
            }).catch(error => {
                console.error('Error fetching user:', error);
            });
        }
    }, []);

    const fetchBlog = async () => {
        try {
            const response = await axios.get(`/api/blogs/${id}`);
            setBlog(response.data.blog);
        } catch (error) {
            console.error('Error fetching blog post:', error);
        }
    };

    const handleCommentSubmitted = () => {
        setRefreshComments(!refreshComments);
    }

    if (!blog) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4" style={{ paddingLeft: '15%', paddingRight: '15%' }}>

            <h1 className="text-3xl font-bold mb-2" style={{ paddingTop: '5%' }}>{blog.title}</h1>
            <p className="text-gray-400 mb-4">{blog.description}</p>
            <hr className="my-4" />
            <div className="mb-4">
                <span style={{ color: 'lightgray' }}>By</span>{' '}
                {blog.author ? (
                    <span style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                        {blog.author.firstName}, {blog.author.lastName}
                    </span>
                ) : ( 
                    <span style={{ fontStyle: 'italic', fontFamily: 'monospace' }}>
                        Unknown Author
                    </span>
                )}
            </div>

            {/* Tags */}
            <div className="mb-4">
                <span className="font-semibold">Tags:</span>{' '}
                {blog.tags && blog.tags.length > 0 ? (() => {
                    const validTags = blog.tags.filter(tag => {
                        if (typeof tag === 'string') {
                            return tag.trim() !== '';
                        } else if (typeof tag === 'object' && tag.name) {
                            return tag.name.trim() !== '';
                        }
                        return false;
                    });

                    return validTags.length > 0 ? (
                        validTags.map((tag, index) => (
                            <span
                                key={index}
                                className="text-sm bg-gray-200 text-gray-700 px-2 py-1 mr-2 mb-2 rounded"
                            >
                                {typeof tag === 'string' ? tag : tag.name}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500" style={{ fontFamily: "monospace" }}>
                            No tags
                        </p>
                    );
                })() : (
                    <p className="text-gray-500" style={{ fontFamily: "monospace" }}>
                        No tags
                    </p>
                )}
            </div>

            {/* Report Button */}
            {currentUser && (
                <div className="mt-2">
                    <ReportButton type="blog" id={blog.id} />
                </div>
            )}

            {/* Content */}
            <div className="prose" style={{
                fontFamily: 'monospace',
                backgroundColor: '#1b1f24',
                padding: '20px',
                borderRadius: '10px'
            }}>
                <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            </div>

            <hr style={{marginTop: '70px'}}/>
            <h2
                style={{
                    fontSize: '20px',
                    marginTop: '15px',
                    marginBottom: '5px'
                }}>Comments</h2>

            {currentUser ? (
                <CommentForm blogId={Number(id)} onCommentSubmitted={handleCommentSubmitted} />
            ) : (
                <p className="mb-4">
                    <a href="/login" className="text-blue-500 hover:underline">
                        Log in
                    </a>{' '}
                    to post a comment.
                </p>
            )}

            <CommentList
                blogId={Number(id)}
                currentUser={currentUser || undefined}
                refreshTrigger={refreshComments}
            />
            {/* Return button */}
            <div className="fixed bottom-10 right-20">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray"
                >
                    Go Back
                </button>
            </div>
        </div>


    );
};

export default function Page() {
    return (
        <>
            <Header content="Blog" />
            <BlogDetail />
        </>
    )
}

export { BlogDetail };
