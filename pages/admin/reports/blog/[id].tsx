// pages/admin/reports/blog/[id].tsx

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const BlogReportsDetail: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [reports, setReports] = useState<any[]>([]);
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchReports();
    }
  }, [id]);

  const fetchReports = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const [reportsRes, blogRes] = await Promise.all([
        axios.get('/api/blogs/report', {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { blogId: id },
        }),
        axios.get(`/api/blogs/${id}`),
      ]);

      console.log('Reports Response:', reportsRes.data); // Debugging line

      setReports(reportsRes.data.reports); // Adjust based on actual response
      setBlog(blogRes.data.blog);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Error fetching reports.');
    }
  };

  const handleHideContent = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.put(
        `/api/blogs/hide`,
        { id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      alert('Blog hidden successfully.');
      fetchReports(); // Refresh data
    } catch (error) {
      console.error('Error hiding blog:', error);
      alert('Error hiding blog.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <button onClick={() => router.back()} className="mb-4">
        &larr; Back
      </button>
      <h1 className="text-2xl font-bold mb-4">Blog Reports for Blog ID: {id}</h1>

      {blog && (
        <div className="mb-4 p-4 border rounded">
          <h2 className="text-xl font-semibold">{blog.title}</h2>
          <p>{blog.description}</p>
          <p className="text-gray-500">
            Author: {blog.author.firstName} {blog.author.lastName}
          </p>
          <p className="text-gray-500">Hidden: {blog.hidden ? 'Yes' : 'No'}</p>
          {!blog.hidden && (
            <button
              onClick={handleHideContent}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded"
            >
              Hide Content
            </button>
          )}
        </div>
      )}

      <h2 className="text-xl font-semibold mb-2">Reports</h2>
      {reports && reports.length > 0 ? (
        reports.map((report) => (
          <div key={report.id} className="mb-4 p-4 border rounded">
            <p>
              <strong>Reported by:</strong> {"User"}
            </p>
            <p>
              <strong>Description:</strong> {"Description"}
            </p>
            {/* Additional fields if needed */}
          </div>
        ))
      ) : (
        <p>No reports found for this blog.</p>
      )}
    </div>
  );
};

export default BlogReportsDetail;
