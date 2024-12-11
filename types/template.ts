// types/template.ts

export interface Tag {
    id: number;
    name: string;
}

export interface Author {
    id: number;
    firstName: string;
    lastName: string;
}

export interface Template {
    id: number;
    title: string;
    explanation: string;
    code: string;
    language: string;
    author: Author;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
}
