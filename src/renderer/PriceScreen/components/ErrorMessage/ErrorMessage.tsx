declare global {
  interface Window {
    electron: any;
  }
}

import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  /** Error message to be displayed */
  error: string;
}

/**
 * ErrorMessage component that displays error information in a user-friendly format.
 * 
 * @component
 * @example
 * ```tsx
 * <ErrorMessage error="Failed to load user data" />
 * ```
 * 
 * @param {ErrorMessageProps} props - Component props
 * @param {string} props.error - Error message to display
 * 
 * @returns {JSX.Element} A styled error message container
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => (
  <div className="error-message">
    <h3>שגיאה בטעינת נתוני נציג</h3>
    <p>{error}</p>
  </div>
);

export default ErrorMessage; 