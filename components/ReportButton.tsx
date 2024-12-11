// components/ReportButton.tsx

import React, { useState } from 'react';
import axios from 'axios';

interface ReportButtonProps {
    type: 'blog' | 'comment';
    id: number | undefined;
}

const ReportButton: React.FC<ReportButtonProps> = ({ type, id }) => {
    const [showModal, setShowModal] = useState(false);
    const [description, setDescription] = useState('');

    const handleReport = async () => {
        try {
            const endpoint = type === 'blog' ? '/api/blogs/report' : '/api/comments/report';
            await axios.post(
                endpoint,
                {
                    [`${type}Id`]: id,
                    description,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                }
            );
            alert('Report submitted successfully.');
            setShowModal(false);
            setDescription('');
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Error submitting report.');
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="text-red-500 hover:text-red-700"
            >
                Report
            </button>

            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Modal backdrop */}
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowModal(false)}></div>

                    {/* Modal content */}
                    <div className="bg-white p-6 rounded shadow-lg z-10">
                        <h2 className="text-xl mb-4">Report {type}</h2>
                        <textarea
                            placeholder="Describe the issue"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            rows={4}
                        ></textarea>
                        <div className="flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 mr-2 bg-gray-300 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReport}
                                className="px-4 py-2 bg-red-500 text-white rounded"
                                disabled={!description.trim()}
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportButton;
