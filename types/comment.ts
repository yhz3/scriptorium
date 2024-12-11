// types/comment.ts
export interface User {
    id: number;
    username: string;
}

export interface Vote {
    id: number;
    upVote: boolean;
    by: number; // userId of the voter
}

export interface Comment {
    id: number;
    content: string;
    author: User;
    rating: number;
    createdAt: string;
    updatedAt: string;
    votes: Vote[];
    userVote: boolean | null;
    replies?: Comment[]; // nested replies
    parentId?: number;
    showReplies?: boolean;
}
