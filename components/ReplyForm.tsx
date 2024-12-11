// components/ReplyForm.tsx
import React, { useState } from 'react';
import { Comment as CommentType } from '../types/comment';
import axios from 'axios';

interface ReplyFormProps {
    parentCommentId: number;
    onReplySubmitted: (newReply: CommentType) => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentCommentId, onReplySubmitted }) => {
    const [content, setContent] = useState<string>('');
    const [error, setError] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            setError('Reply content cannot be empty.');
            return;
        }

        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                setError('You must be logged in to reply.');
                return;
            }

            const response = await axios.post(`/api/comments/${parentCommentId}/replies`, { content }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setContent('');
            onReplySubmitted(response.data.reply);
        } catch (error) {
            console.error('Error submitting reply:', error);
            setError('An error occurred while submitting your reply.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-2">
            {error && <p className="text-red-500">{error}</p>}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                placeholder="Write your reply..."
                rows={3}
            />
            <button type="submit" className="px-1 py-1 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray">
                Reply
            </button>
        </form>
    );
};

export default ReplyForm;
