// pages/templates/index.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Template } from '../../types/template';
import TemplateList from '../../components/templates/TemplateList';
import Pagination from '../../components/templates/Pagination';
import SearchFilters from '../../components/SearchFilters';
import { Header } from '..';
import { ThemeProvider } from 'next-themes';

const TemplatesPage: React.FC = () => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [pageSize] = useState<number>(10);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchTemplates();
    }, [currentPage, searchQuery, selectedTags, selectedLanguage]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/templates', {
                params: {
                    page: currentPage,
                    pageSize,
                    search: searchQuery,
                    tags: selectedTags.join(','),
                    language: selectedLanguage,
                },
            });
            setTemplates(response.data.templates);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleTagFilterChange = (tags: string[]) => {
        setSelectedTags(tags);
        setCurrentPage(1);
    };

    const handleLanguageFilterChange = (language: string) => {
        setSelectedLanguage(language);
        setCurrentPage(1);
    };

    return (
        <div className="container mx-auto p-4 bg-gray-50 dark:bg-black transition-colors">
            <h1 style={{
                paddingBottom: '15px',
                fontSize: '30px'
            }}
            className='text-black dark:text-white'
            >
                Explore Templates
            </h1>
            <SearchFilters
                onSearch={handleSearch}
                onTagFilterChange={handleTagFilterChange}
                onLanguageFilterChange={handleLanguageFilterChange}
            />
            {loading ? (
                <p className='text-black dark:text-white'>Loading templates...</p>
            ) : (
                <>
                    <TemplateList templates={templates} />
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

// export default TemplatesPage;

export default function Page() {
    return (
        <>
            <ThemeProvider attribute="class" defaultTheme="system">
                <div className='bg-gray-50 dark:bg-black transition-colors' >
                    <Header content="Templates"/>
                    <TemplatesPage/>
                </div>
            </ThemeProvider>
        </>
    )
}
