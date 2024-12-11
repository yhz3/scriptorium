// components/CommentForm.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface CommentFormProps {
    blogId: number;
    onCommentSubmitted: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ blogId, onCommentSubmitted }) => {
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Comment content cannot be empty.');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('You must be logged in to submit a comment.');
                return;
            }

            await axios.post(`/api/blogs/${blogId}/comments`, { content }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setContent('');
            setError('');
            onCommentSubmitted();
        } catch (error) {
            console.error('Error submitting comment:', error);
            setError('An error occurred while submitting your comment.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            {error && <p className="text-red-500">{error}</p>}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                placeholder="Write your comment..."
                rows={4}
            />
            <button type="submit" className="px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray float-right"
                style={{marginTop: '10px'}}>
                Submit Comment
            </button>
        </form>
    );
};

export default CommentForm;

