// components/editor/CodeEditorPage.tsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Sandbox from './Sandbox';
import { FuncButton } from '../dashboard/FuncButton';
import { User } from '../../types/user';
import { ThemeProvider } from 'next-themes';

interface Template {
    id?: number;
    title: string;
    code: string;
    language: string;
    explanation?: string;
    authorId?: number;
    [key: string]: any;
}

interface CodeEditorPageProps {
    template: Template | null;
    currentUser: User | null;
    isNewTemplate: boolean;
}

const CodeEditorPage: React.FC<CodeEditorPageProps> = ({
    template,
    currentUser,
    isNewTemplate,
}) => {
    const router = useRouter();
    const [language, setLanguage] = useState<string>('javascript');
    const [code, setCode] = useState<string>('');
    const [stdin, setStdin] = useState<string>('');
    const [response, setResponse] = useState<string>('');
    const [title, setTitle] = useState<string>('');
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [explanation, setExplanation] = useState<string>('');

    useEffect(() => {
        if (template) {
            setLanguage(template.language);
            setCode(template.code);
            setTitle(template.title);
            setExplanation(template.explanation || '');
            setIsOwner(currentUser?.id === template.authorId);
        }
    }, [template, currentUser]);

    const handleRun = async () => {
        try {
            const response = await axios.post(
                '/api/execute',
                {
                    language,
                    code,
                    stdin,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            const newResponse = `${response.data.stdout || ''}\n${response.data.stderr || ''
                }`;
            setResponse(newResponse);
        } catch (error) {
            console.error('Error executing code:', error);
        }
    };

    const handleSave = async () => {
        if (!currentUser) {
            alert('You must be logged in to save templates.');
            return;
        }

        if (!title.trim()) {
            alert('Please provide a title for your template.');
            return;
        }

        if (!explanation.trim()) {
            alert('Please provide a description for your template.');
            return;
        }

        if (!code) {
            alert("Please provide code for your template.");
            return;
        }

        try {
            if (isNewTemplate) {
                // Create a new template
                const response = await axios.post(
                    '/api/templates',
                    {
                        title,
                        code,
                        language,
                        explanation: explanation,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                );
                const newTemplate = response.data;
                alert('Template created successfully.');
                router.push(`/codeEditor/${newTemplate.id}`);
            } else if (isOwner) {
                // Update existing template
                await axios.put(
                    `/api/templates/${template?.id}`,
                    {
                        title,
                        code,
                        language,
                        explanation: explanation,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                );
                alert('Template updated successfully.');
            } else {
                // Fork the template
                const response = await axios.post(
                    `/api/templates/${template?.id}/fork`,
                    {
                        title,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                );
                const forkedTemplate = response.data.template;
                // Update the forked template with the current code
                await axios.put(
                    `/api/templates/${forkedTemplate.id}`,
                    {
                        code,
                        language,
                        explanation: explanation,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                        },
                    }
                );
                alert('Template forked and saved successfully.');
                router.push(`/codeEditor/${forkedTemplate.id}`);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert('An error occurred while saving the template.');
        }
    };

    return (
        <ThemeProvider attribute="class" defaultTheme="system">    
        <div>
            {/* SubHeader */}
            <header
                id="header"
                className="flex flex-wrap justify-between items-center p-1 relative"
                style={{
                    borderBottom: '1px solid gray',
                    background: 'linear-gradient(to right, #161b22, #261b32)',
                    paddingLeft: '20px',
                    paddingRight: '20px'
                }}
            >
                <div className="flex items-center space-x-4">
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm text-gray-400 text-[12px]">Language:</label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="bg-[#1e1e1e] text-white text-[13px] border border-gray-500 px-3 py-2 rounded-md"
                            style={{ cursor: 'pointer', height: '40px' }}
                        >
                            {[
                                'javascript',
                                'python',
                                'c',
                                'cpp',
                                'java',
                                'go',
                                'ruby',
                                'rust',
                                'kotlin',
                                'php',
                            ].map((lang, index) => (
                                <option key={index} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </select>
                    </div>

                    {currentUser && (
                        <>
                            <div className="flex flex-col space-y-2">
                                <label className="text-sm text-gray-400 text-[12px]">Title:</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Template Title"
                                    className="bg-[#1e1e1e] text-white text-[13px] border border-gray-500 px-3 py-2 rounded-md"
                                    style={{ height: '40px' }}
                                    disabled={!isOwner && !isNewTemplate}
                                />
                            </div>
                            <div className="flex flex-col space-y-2 ml-4">
                                <label className="text-sm text-gray-400 text-[12px]">Description:</label>
                                <textarea
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    placeholder="Template Description"
                                    className="bg-[#1e1e1e] text-white text-[13px] border border-gray-500 px-3 py-2 rounded-md transition-all duration-300 ease-in-out"
                                    style={{ height: '40px', width: '100%' }}
                                    rows={1}
                                    disabled={!isOwner && !isNewTemplate}
                                    onFocus={(e) => {
                                        e.target.style.height = '100px';
                                        e.target.style.width = '500px';
                                        e.target.style.marginBottom = '10px';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.height = '40px';
                                        e.target.style.width = '100%';
                                        e.target.style.marginBottom = '0px'
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex flex-row items-end space-y-2 mt-4" style={{ marginBottom: '10px'}}>
                    {currentUser && (
                        <div className="w-full flex justify-end hover:scale-105 transition-transform duration-300" style={{marginRight: '10px'}}>
                            <FuncButton content="💾" onClick={handleSave} />
                        </div>
                    )}
                    <div 
                        className="w-full flex justify-end hover:scale-105 transition-transform duration-300" 
                        style={{marginRight: '10px'}}
                    >
                        <FuncButton content="▶" onClick={handleRun} />
                    </div>
                </div>
            </header>

            {/* Flex containers */}
            <div className="flex flex-grow">
                {/* Left column with text editor */}
                <div className="bg-gray-50 dark:bg-[#1e1e1e] transition-colors py-3 w-1/2">
                    <Sandbox
                        code={code}
                        language={language}
                        onChangeCode={setCode}
                    />
                </div>

                {/* Right column */}
                <div className="flex flex-col py-3 w-1/2">
                    {/* Top right quadrant */}
                    <div
                        className="flex-grow px-3 h-1/2 overflow-auto"
                        id="output"
                        style={{
                            backgroundColor: '#1e1e1e',
                            color: 'white',
                            border: '1px solid gray',
                            padding: '10px',
                            borderRadius: '5px',
                            maxHeight: '50%', // Adjust the height as needed
                        }}
                    >
                        <pre className="text-black dark:text-white mt-2 whitespace-pre-wrap">
                            {response}
                        </pre>
                    </div>
                    {/* Bottom right quadrant */}
                    <div
                        className="flex-grow bg-[] px-10 py-10 h-1/2"
                        style={{
                            borderBottom: '1px solid gray',
                            background: 'linear-gradient(to right, #161b22, #261b32)',
                        }}
                    >
                        <textarea
                            placeholder="stdin..."
                            value={stdin}
                            onChange={(e) => setStdin(e.target.value)}
                            className="bg-[#1e1e1e] text-white text-[13px] border border-gray-500 px-3 py-2 rounded-md"
                            style={{ width: '90%', resize: 'both', height: '30%', fontFamily: 'monospace' }}
                        />
                    </div>
                </div>
            </div>
        </div>
        </ThemeProvider>
    );
};

export default CodeEditorPage;
