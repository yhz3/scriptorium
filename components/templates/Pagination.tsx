// components/templates/Pagination.tsx

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : "px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray" 
        }`}
      >
        Previous
      </button>
      {getPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 mx-1 rounded ${
            page === currentPage ? "px-4 py-2 bg-purple-600 text-black hover:bg-purple-800 rounded border border-solid border-gray"  : "px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 mx-1 rounded ${
          currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : "px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray"
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
