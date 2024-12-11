// utils/commentApi.ts
import axios from 'axios';

export const upvoteComment = async (commentId: number) => {
  try {
    await axios.post('/api/comments/votes', {
      upVote: true,
      commentId,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch (error) {
    console.error('Error upvoting comment:', error);
    throw error;
  }
};

export const downvoteComment = async (commentId: number) => {
  try {
    await axios.post('/api/comments/votes', {
      upVote: false,
      commentId,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });
  } catch (error) {
    console.error('Error downvoting comment:', error);
    throw error;
  }
};
