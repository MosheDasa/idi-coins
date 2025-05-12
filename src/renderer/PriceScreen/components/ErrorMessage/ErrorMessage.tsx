declare global {
  interface Window {
    electron: any;
  }
}

import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  error: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => (
  <div className="error-message">
    <h3>שגיאה בטעינת נתוני נציג</h3>
    <p>{error}</p>
  </div>
);

export default ErrorMessage; 