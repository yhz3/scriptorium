export interface Blog {
    id?: number;
    title: string;
    description: string;
    content: string;
    tags: any[];
    templateIds: number[];
    templates?: any[];
    author?: {
        id: number;
        username: string;
        firstName: string;
        lastName: string;
    };
    rating?: number;
    createdAt?: string;
    updatedAt?: string;
}
