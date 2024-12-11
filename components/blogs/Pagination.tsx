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
    const pages = [];

    for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
    }

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
            {pages.map((page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1 mx-1 rounded ${
                        page === currentPage ? "px-4 py-2 bg-purple-600 text-black hover:bg-purple-800 rounded border border-solid border-gray"  : "px-4 py-2 bg-gradient-to-r from-gray-300 to-purple-300 text-black hover:from-gray-500 hover:to-gray-700 rounded border border-solid border-gray"
                    }`}
                >
                    {page}
                </button>
            )))}
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
}

export default Pagination;
