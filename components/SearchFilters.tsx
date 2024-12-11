// components/SearchFilters.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface SearchFiltersProps {
    onSearch: (query: string) => void;
    onTagFilterChange: (tags: string[]) => void;
    onLanguageFilterChange: (language: string) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
    onSearch,
    onTagFilterChange,
    onLanguageFilterChange,
}) => {
    const [searchInput, setSearchInput] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [availableLanguages] = useState<string[]>([
        'c',
        'cpp',
        'java',
        'python',
        'javascript',
        'go',
        'ruby',
        'php',
        'rust',
    ]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const response = await axios.get('/api/tags');
            const filteredTags = response.data.tags.filter((tag: any) => tag.name.trim() !== '');
            setAvailableTags(filteredTags.map((tag: any) => tag.name));
            
        } catch (error) {
            console.error('Error fetching tags:', error);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchInput);
    };

    const handleTagChange = (tag: string) => {
        let updatedTags: string[];
        if (selectedTags.includes(tag)) {
            updatedTags = selectedTags.filter((t) => t !== tag);
        } else {
            updatedTags = [...selectedTags, tag];
        }
        setSelectedTags(updatedTags);
        onTagFilterChange(updatedTags);
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const language = e.target.value;
        setSelectedLanguage(language);
        onLanguageFilterChange(language);
    };

    return (
        <div className="mb-4">
            <form onSubmit={handleSearchSubmit} className="flex mb-4">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search templates..."
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
                >
                    Search
                </button>


                <button
                    type="button"
                    className="px-4 py-2 bg-gray-800 text-white hover:bg-purple-800 ml-2"
                    style={{ borderRadius: '20px', fontSize: '15px', 
                        paddingLeft: '40px', paddingRight: '40px' 
                    }}
                    onClick={() => window.location.href = '/codeEditor/new'}
                >+</button>

            </form>
            <div className="flex flex-wrap items-center mb-4">
                <label className="mr-2 font-semibold text-black dark:text-white">Filter by Tags:</label>
                {availableTags.map((tag) => (
                    <label key={tag} className="mr-2 mb-2 flex items-center text-black dark:text-white">
                        <input
                            type="checkbox"
                            value={tag}
                            checked={selectedTags.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                            className="mr-1"
                        />
                        <span>{tag}</span>
                    </label>
                ))}
            </div>

            
            <div className="flex items-center mb-4">
                <label className="mr-2 font-semibold text-black dark:text-white">Filter by Language:</label>
                <select
                    value={selectedLanguage}
                    onChange={handleLanguageChange}
                    className="border p-1 rounded"
                    style={{ backgroundColor: 'black', color: 'white' }}
                >
                    <option value="" style={{ color: 'black' }}>All Languages</option>
                    {availableLanguages.map((lang) => (
                        <option key={lang} value={lang} style={{ color: 'black' }}>
                            {lang.toUpperCase()}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SearchFilters;
