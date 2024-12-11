// components/Comment.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Comment as CommentType } from '../types/comment';
import { User } from '../types/user'; // Assuming you have a User type
import ReplyForm from './ReplyForm';
import { upvoteComment, downvoteComment } from '../utils/commentApi'; // Functions to handle voting
import ReportButton from './ReportButton'; // Import the ReportButton component

interface CommentProps {
    comment: CommentType;
    currentUser?: User;
    depth?: number;
}

const Comment: React.FC<CommentProps> = ({
    comment,
    currentUser,
    depth = 0,
}) => {
    const [showReplyForm, setShowReplyForm] = useState<boolean>(false);
    const [replies, setReplies] = useState<CommentType[] | null>(null);
    const [loadingReplies, setLoadingReplies] = useState<boolean>(false);
    const [commentData, setCommentData] = useState<CommentType>(comment);
    const [userVote, setUserVote] = useState<boolean | null>(comment.userVote);
    const [rating, setRating] = useState<number>(comment.rating);

    // Removed the 'refresh' state as it's no longer needed

    const handleVote = async (upVote: boolean) => {
        if (!currentUser) {
            // Redirect to login or show a message
            alert('Please log in to vote.');
            // Example: Redirect to login page
            // window.location.href = '/login';
            return;
        }
        try {
            const response = await axios.post(
                '/api/comments/votes',
                { upVote, commentId: comment.id },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    }, 
                }
            );

            // Update user vote state
            setUserVote((prevVote) => {
                if (prevVote === upVote) {
                    // If the user is toggling their vote, remove the vote
                    return null;
                }
                return upVote;
            });

            // Update the rating based on the response from the server
            setRating(response.data.rating);

            // If the server doesn't provide the new rating, you can manually adjust it:
            /*
            setRating((prevRating) => {
                if (upVote) {
                    return prevVote === true ? prevRating - 1 : prevRating + 1;
                } else {
                    return prevVote === false ? prevRating + 1 : prevRating - 1;
                }
            });
            */
        } catch (error) {
            console.error('Error voting on comment:', error);
            alert('There was an error processing your vote. Please try again.');
        }
    };

    const toggleReplies = async () => {
        if (replies) {
            setReplies(null);
        } else {
            await fetchReplies();
        }
    };

    const handleReplySubmitted = (newReply: CommentType) => {
        setShowReplyForm(false);

        if (!newReply.author) {
            newReply.author = {
                id: currentUser?.id || 0,
                username: currentUser?.username || 'Unknown',
            };
        }

        setCommentData({
            ...commentData,
            replies: [...(commentData.replies || []), newReply],
        });
    };

    const fetchReplies = async () => {
        setLoadingReplies(true);
        try {
            const response = await axios.get(`/api/comments/${comment.id}/replies`);
            setReplies(response.data.comments);
        } catch (error) {
            console.error('Error fetching replies:', error);
        } finally {
            setLoadingReplies(false);
        }
    };

    return (
        <div className="mb-4" style={{ marginLeft: depth * 20 }}>
            <div className="flex items-start">
                <div className="mr-2 flex flex-col items-center">
                    <button
                        onClick={() => handleVote(true)}
                        className={`text-gray-500 hover:text-green-500 ${
                            userVote === true ? 'text-green-500' : ''
                        }`}
                        disabled={!currentUser} // Optionally disable if not logged in
                        aria-label="Upvote"
                    >
                        ▲
                    </button>
                    <div className="text-center">{rating}</div> {/* Updated to use 'rating' state */}
                    <button
                        onClick={() => handleVote(false)}
                        className={`text-gray-500 hover:text-red-500 ${
                            userVote === false ? 'text-red-500' : ''
                        }`}
                        disabled={!currentUser} // Optionally disable if not logged in
                        aria-label="Downvote"
                    >
                        ▼
                    </button>
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-400"> 
                        {comment.author.username} • {new Date(comment.createdAt).toLocaleString()}
                    </p>
                    <p>{comment.content}</p>
                    <div className="mt-2 flex space-x-4">
                        {currentUser && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-blue-500 hover:underline"
                            >
                                {showReplyForm ? 'Cancel' : 'Reply'}
                            </button>
                        )}
                        {commentData.replies && commentData.replies.length > 0 && (
                            <button
                                onClick={toggleReplies}
                                className="text-blue-500 hover:underline"
                            >
                                {replies ? 'Hide Replies' : `View Replies (${commentData.replies.length})`}
                            </button>
                        )}
                        {/* Render the ReportButton component */}
                        {currentUser && (
                            <div className="mt-2">
                                <ReportButton type="comment" id={comment.id} />
                            </div>
                        )}
                    </div>
                    {showReplyForm && (
                        <ReplyForm
                            parentCommentId={comment.id}
                            onReplySubmitted={handleReplySubmitted}
                        />
                    )}
                    {/* Render Replies */}
                    {replies && replies.length > 0 && (
                        <div className="mt-4 border-l-2 border-gray-300 pl-4">
                            {replies.map((reply) => (
                                <Comment
                                    key={reply.id}
                                    comment={reply}
                                    currentUser={currentUser}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                    {loadingReplies && (
                        <div className="mt-2 text-gray-500">Loading replies...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Comment;
