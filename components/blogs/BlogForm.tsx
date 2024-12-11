import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Blog } from '../../types/blog';
import { Template } from '../../types/template';
import * as Yup from 'yup';

interface BlogFormProps {
    initialData?: Blog;
    onSubmit: (data: Blog) => void;
}

// define validation schema with Yup
const validationSchema = Yup.object().shape({
    title: Yup.string().required('Title is required.'),
    description: Yup.string().required('Description is required.'),
    content: Yup.string().required('Content is required.'),
});

const BlogForm: React.FC<BlogFormProps> = ({ initialData, onSubmit }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [content, setContent] = useState(initialData?.content || '');
    const [tags, setTags] = useState(initialData?.tags.join(', ') || '');
    const [templates, setTemplates] = useState(
        initialData?.templates?.map(template => template.title).join(', ') || ''
    );
    const [errors, setErrors] = useState<string[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState<Template[]>([]);
    const [selectedTemplates, setSelectedTemplates] = useState<number[]>(initialData?.templateIds || []);

    useEffect(() => {
        fetchTemplates();
    }, []);

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
            console.error('Error fetching templates', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // create blog with Blog type defined in types/blog.ts
        const blogData: Blog = {
            title,
            description,
            content,
            tags: tags.split(',').map(tag => tag.trim()),
            templateIds: selectedTemplates,
        };

        try {
            await validationSchema.validate(blogData, { abortEarly: false });
            onSubmit(blogData);
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                setErrors(err.errors);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4"
                style={{
                    color: 'white',
                    fontSize: '30px',
                    paddingTop: '15px',
                    paddingBottom: '5px'
                }}
            >{initialData ? 'Edit Blog Post' : 'Create Blog Post'}</h2>
            {errors.length > 0 && (
                <div className="mb-4">
                    {errors.map((error, idx) => (
                        <p key={idx} className="text-red-500">{error}</p>
                    ))}
                </div>
            )}
            <hr className="my-4 border-gray-400" />
            <div className="mb-4">
                <label className="block text-gray-200">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                    placeholder="Enter blog title"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200">Description</label>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                    placeholder="Enter blog description"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200">Content</label>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-400 h-[300px] rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                    placeholder="Enter Blog Content"
                    style={{fontFamily: 'monospace'}}
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200">Tags (comma separated)</label>
                <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                    placeholder="e.g., JavaScript, React"
                />
            </div>
            <div className="mb-4">
                <label className="block text-gray-200">Templates</label>
                <select
                    multiple
                    value={selectedTemplates.map(String)}
                    onChange={(e) => {
                        const options = e.target.options;
                        const selectedIds: number[] = [];
                        for (let i = 0;i < options.length; i++) {
                            if (options[i].selected) {
                                selectedIds.push(parseInt(options[i].value));
                            }
                        }
                        setSelectedTemplates(selectedIds);
                    }}
                    className="w-full mt-1 p-2 border border-gray-400 rounded 
                            bg-gradient-to-r from-[#1f2937] to-[#2f2948] hover:from-[#3f2957] hover:to-[#4f2968]"
                >
                    {availableTemplates.map(template => (
                        <option key={template.id} value={template.id}>
                            {template.title}
                        </option>
                    ))}
                </select>
            </div>
            <div className="flex justify-between mt-4 mb-12">
                <button type="button" onClick={() => window.history.back()} className="px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray">
                    Go Back
                </button>

                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray">
                    {initialData ? 'Update Blog Post' : 'Create Blog Post'}
                </button>
            </div>

        </form>
    );
};

export default BlogForm;
