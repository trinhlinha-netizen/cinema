import React from 'react';

export const LoadingState = ({ text = 'Đang tải dữ liệu...' }) => (
  <div className="state-box" role="status">
    <span className="spinner" aria-hidden="true" />
    <p>{text}</p>
  </div>
);

export const EmptyState = ({ text = 'Không có dữ liệu phù hợp.' }) => (
  <div className="state-box">
    <p>{text}</p>
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="state-box state-error" role="alert">
    <p>{message || 'Đã xảy ra lỗi.'}</p>
    {onRetry && (
      <button type="button" className="btn btn-secondary" onClick={onRetry}>
        Thử lại
      </button>
    )}
  </div>
);
