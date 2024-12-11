// blogs/index.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Blog } from '../../types/blog';
import BlogList from '../../components/blogs/BlogList';
import Pagination from '../../components/blogs/Pagination';
import SearchBar from '../../components/blogs/SearchBar';
import { Header } from '..';
import { ThemeProvider } from 'next-themes';

const BlogsPage: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);

    useEffect(() => {
        fetchBlogs();
    }, [currentPage, searchQuery, selectedTags, selectedTemplateIds]);

    const fetchBlogs = async () => {
        try {
            const response = await axios.get('/api/blogs', {
                params: {
                    page: currentPage,
                    pageSize,
                    search: searchQuery,
                    tags: selectedTags.join(','),
                    template: selectedTemplateIds.join(','),
                },
            });
            setBlogs(response.data.blogs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching blogs:', error);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string, tags: string[], templateIds: number[] | null) => {
        setSearchQuery(query);
        setSelectedTags(tags);
        setSelectedTemplateIds(templateIds || []);
        setCurrentPage(1); // go back to first page when query changes
    };

    return (
        <div className="container mx-auto p-4 text-black dark:text-white">
            <h1 style ={{
                paddingBottom: '15px',
                fontSize: '30px',
            }}>Explore Blogs</h1>
            <SearchBar onSearch={handleSearch} />
            <BlogList blogs={blogs} />
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
        </div>
    );
};

export { BlogsPage };

export default function Page() {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system">
                <div className='bg-gray-50 dark:bg-black transition-colors'>
                    <Header content="blogs" />
                    <BlogsPage />
                </div>
            </ThemeProvider>
        </>
    );
}
