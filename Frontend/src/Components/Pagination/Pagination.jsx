import React from 'react';
import PropTypes from 'prop-types';
import './Pagination.css';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  className = '',
}) => {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always include first and last page
    const startPages = Array.from({ length: boundaryCount }, (_, i) => i + 1);
    const endPages = Array.from(
      { length: boundaryCount },
      (_, i) => totalPages - boundaryCount + i + 1
    ).filter(page => page > 0);

    // Calculate sibling pages around current page
    const siblingStart = Math.max(
      currentPage - siblingCount,
      boundaryCount + 1
    );
    const siblingEnd = Math.min(
      currentPage + siblingCount,
      totalPages - boundaryCount
    );

    // Build arrays of page numbers to display
    const itemList = [];

    // Add start pages
    itemList.push(...startPages);

    // Add ellipsis if there's a gap
    if (siblingStart > boundaryCount + 1) {
      itemList.push('ellipsis-start');
    }

    // Add sibling pages
    for (let i = siblingStart; i <= siblingEnd; i++) {
      itemList.push(i);
    }

    // Add ellipsis if there's a gap
    if (siblingEnd < totalPages - boundaryCount) {
      itemList.push('ellipsis-end');
    }

    // Add end pages
    itemList.push(...endPages);

    return itemList;
  };

  const pagination = generatePagination();

  // Don't render if only one page
  if (totalPages <= 1) return null;

  return (
    <nav className={`pagination-container ${className}`} aria-label="Pagination">
      <ul className="pagination">
        <li className={`pagination-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="pagination-link pagination-prev"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
        </li>

        {pagination.map((item, index) => {
          if (item === 'ellipsis-start' || item === 'ellipsis-end') {
            return (
              <li key={`${item}-${index}`} className="pagination-item pagination-ellipsis">
                <span className="pagination-ellipsis-icon">•••</span>
              </li>
            );
          }

          return (
            <li
              key={item}
              className={`pagination-item ${currentPage === item ? 'active' : ''}`}
            >
              <button
                className="pagination-link pagination-number"
                onClick={() => onPageChange(item)}
                aria-current={currentPage === item ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            </li>
          );
        })}

        <li className={`pagination-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="pagination-link pagination-next"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  siblingCount: PropTypes.number,
  boundaryCount: PropTypes.number,
  className: PropTypes.string,
};

export default Pagination;
