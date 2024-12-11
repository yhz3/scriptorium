// pages/admin/reports/index.tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const AdminReportsPage: React.FC = () => {
    const router = useRouter();
    const [blogReports, setBlogReports] = useState<any[]>([]);
    const [commentReports, setCommentReports] = useState<any[]>([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) {
                router.push('/login');
                return;
            }

            const [blogReportsRes, commentReportsRes] = await Promise.all([
                axios.get('/api/blogs/report', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }),
                axios.get('/api/comments/report', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                }),
            ]);

            setBlogReports(blogReportsRes.data.reports);
            setCommentReports(commentReportsRes.data.reports);
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Error fetching reports.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Admin Reports</h1>

            <h2 className="text-xl font-semibold mt-6 mb-2">Blog Reports</h2>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">Blog ID</th>
                        <th className="py-2">Number of Reports</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {blogReports.map((report) => (
                        <tr key={report.blogId}>
                            <td className="text-center py-2">{report.blogId}</td>
                            <td className="text-center py-2">{report._count.blogId}</td>
                            <td className="text-center py-2">
                                <button
                                    onClick={() => router.push(`/admin/reports/blog/${report.blogId}`)}
                                    className="text-blue-500 hover:underline"
                                >
                                    View Reports
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2 className="text-xl font-semibold mt-6 mb-2">Comment Reports</h2>
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2">Comment ID</th>
                        <th className="py-2">Number of Reports</th>
                        <th className="py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {commentReports.map((report) => (
                        <tr key={report.commentId}>
                            <td className="text-center py-2">{report.commentId}</td>
                            <td className="text-center py-2">{report._count.commentId}</td>
                            <td className="text-center py-2">
                                <button
                                    onClick={() => router.push(`/admin/reports/comment/${report.commentId}`)}
                                    className="text-blue-500 hover:underline"
                                >
                                    View Reports
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminReportsPage;
