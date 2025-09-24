import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const buttonClasses = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="btn-loader">
          <div className="spinner"></div>
        </div>
      )}
      <span className="btn-content">{children}</span>
    </button>
  );
};

export default Button;