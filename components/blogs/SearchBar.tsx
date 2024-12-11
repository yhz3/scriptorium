import React, { useState, useEffect } from 'react';
import { Template } from '../../types/template';
import axios from 'axios';
import { ThemeProvider } from 'next-themes';

interface SearchBarProps {
    onSearch: (query: string, tags: string[], templateIds: number[] | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
    const [searchInput, setSearchInput] = useState<string>('');
    const [isHovered, setIsHovered] = useState(false);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);

    useEffect(() => {
        fetchTags();
        fetchTemplates();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get('/api/tags');
            const tags = response.data.tags.map((tag: any) => tag.name).filter((name: string) => name.trim() !== '');
            setAvailableTags(tags);

        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('/api/templates', {
                params: {
                    page: 1,
                    pageSize: 1000,
                },
            });
            setAvailableTemplates(response.data.templates);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchInput, selectedTags, selectedTemplateIds.length > 0 ? selectedTemplateIds : null);
    };

    const handleTagChange = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleTemplateChange = (templateId: number) => {
        setSelectedTemplateIds((prev) =>
            prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mb-4">
            <div className="flex">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search by title, content, tags, or templates..."
                    className="w-full"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        background: isHovered ? 'linear-gradient(to right, #3f2957, #4f2968)' :
                            'linear-gradient(to right, #1f2937, #2f2948)',
                        paddingLeft: '10px',
                        borderLeft: '1px solid gray',
                        borderTop: '1px solid gray',
                        borderBottom: '1px solid gray',
                        borderTopLeftRadius: '5px',
                        borderBottomLeftRadius: '5px'
                    }}
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-300 text-black hover:bg-gray-500"
                    style={{borderTopRightRadius: '5px', borderBottomRightRadius: '5px'}}
                >Search</button>
                <button
                    type="button"
                    className="px-4 py-2 bg-gray-800 text-white hover:bg-purple-800 ml-2"
                    style={{ borderRadius: '20px', fontSize: '15px', 
                        paddingLeft: '40px', paddingRight: '40px' 
                    }}
                    onClick={() => window.location.href = '/blogs/create'}
                >+</button>

            </div>
            <div className="mt-4">
                <label className="block text-black dark:text-white">Filter by Tags:</label>
                <div className="flex flex-wrap">
                    {availableTags.map((tag) => (
                        <label key={tag} className="mr-2 mb-2 flex items-center">
                            <input
                                type="checkbox"
                                value={tag}
                                checked={selectedTags.includes(tag)}
                                onChange={() => {
                                    handleTagChange(tag);
                                    onSearch(searchInput, selectedTags.includes(tag) ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag], selectedTemplateIds.length > 0 ? selectedTemplateIds : null);
                                }}
                                className="mr-1"
                            />
                            <span>{tag}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="mt-4">
                <label className="block text-black dark:text-white">Filter by Templates:</label>
                <div className="flex flex-wrap">
                    {availableTemplates.map((template) => (
                        <label key={template.id} className="mr-2 mb-2 flex items-center">
                            <input
                                type="checkbox"
                                value={template.id}
                                checked={selectedTemplateIds.includes(template.id)}
                                onChange={() => {
                                    handleTemplateChange(template.id);
                                    onSearch(searchInput, selectedTags, selectedTemplateIds.includes(template.id) ? selectedTemplateIds.filter(id => id !== template.id) : [...selectedTemplateIds, template.id]);
                                }}
                                className="mr-1"
                            />
                            <span>{template.title}</span>
                        </label>
                    ))}
                </div>
            </div>
        </form>
    );
};

export default SearchBar;
