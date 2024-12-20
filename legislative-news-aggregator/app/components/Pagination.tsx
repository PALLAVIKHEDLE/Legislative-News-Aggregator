import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalResults,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * 6 + 1;
  const end = Math.min(currentPage * 6, totalResults);

  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);

    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 2; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else if (currentPage <= 3) {
      // Near the start
      pageNumbers.push(2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Near the end
      pageNumbers.push('...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      // In the middle
      pageNumbers.push(
        '...',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        '...',
        totalPages
      );
    }

    return pageNumbers;
  };

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {start} - {end} of {totalResults} results
      </div>
      
      <div className="pagination-controls">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-button"
        >
          Previous
        </button>

        <div className="pagination-numbers">
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
              disabled={pageNum === '...'}
              className={`pagination-number ${
                typeof pageNum === 'number' && pageNum === currentPage
                  ? 'active'
                  : ''
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
