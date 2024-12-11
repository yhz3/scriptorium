// components/CommentList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Comment as CommentType } from '../types/comment';
import Comment from './Comment';
import { User } from '../types/user'; // Assuming you have a User type

interface CommentListProps {
    blogId: number;
    currentUser?: User;
    refreshTrigger: boolean;
}

const CommentList: React.FC<CommentListProps> = ({ blogId, currentUser, refreshTrigger }) => {
    const [comments, setComments] = useState<CommentType[]>([]);
    const [sortOption, setSortOption] = useState<string>('rating');
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);

    useEffect(() => {
        fetchComments();
    }, [sortOption, page, refreshTrigger]);

    const fetchComments = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');

            const response = await axios.get(`/api/blogs/${blogId}/comments`, {
                params: {
                    page,
                    pageSize: 10,
                },
                headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            });

            let fetchedComments = response.data.comments;

            fetchedComments = await Promise.all(
                fetchedComments.map(async (comment: CommentType) => {
                    const replies = await fetchRepliesRecursive(comment.id);
                    return { ...comment, replies };
                })
            );

            // Sort comments based on sortOption
            if (sortOption === 'date') {
                fetchedComments.sort((a: CommentType, b: CommentType) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            } else if (sortOption === 'rating') {
                fetchedComments.sort((a: CommentType, b: CommentType) => b.rating - a.rating);
            }

            setComments(fetchedComments);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const fetchRepliesRecursive = async (commentId: number): Promise<CommentType[]> => {
        try {
            const response = await axios.get(`/api/comments/${commentId}/replies`);
            const replies = response.data.comments;

            const repliesWithNested = await Promise.all(
                replies.map(async (reply: CommentType) => {
                    const nestedReplies = await fetchRepliesRecursive(reply.id);
                    return { ...reply, replies: nestedReplies };
                })
            );

            return repliesWithNested;
        } catch (error) {
            console.error('Error fetching replies:', error);
            return [];
        }
    }

/*    const handleCommentSubmitted = () => {
        fetchComments();
    };
*/
    return (
        <div>
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <label className="mr-2">Sort comments by:</label>
                    <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="px-1 py-1 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray"
                    >
                        <option value="rating">Rating</option>
                        <option value="date">Date</option>
                    </select>
                </div>
            </div>
            <div className="mt-4">
                {comments.map((comment) => (
                    <Comment
                        key={comment.id}
                        comment={comment}
                        currentUser={currentUser}
                    />
                ))}
            </div>
            {/* Pagination component can be added here */}
        </div>
    );
};

export default CommentList;
