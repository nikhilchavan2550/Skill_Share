import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOutsideClick = true,
  className = '',
  contentClassName = '',
  footer,
}) => {
  const modalRef = useRef(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Handle click outside to close modal
  const handleOutsideClick = (e) => {
    if (closeOnOutsideClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div
        className={`modal-container modal-${size} ${className}`}
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="modal-title">
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        <div className={`modal-content ${contentClassName}`}>{children}</div>

        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'full']),
  showCloseButton: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool,
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  footer: PropTypes.node,
};

export default Modal;
