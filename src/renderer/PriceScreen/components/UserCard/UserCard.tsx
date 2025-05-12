declare global {
  interface Window {
    electron: any;
  }
}

import React from 'react';
import './UserCard.css';

interface User {
  name: {
    first: string;
    last: string;
  };
  location: {
    street: {
      number: number;
    };
  };
}

interface UserCardProps {
  /** User data to be displayed in the card */
  user: User;
}

/**
 * CoinIcon component that displays a stylized shekel (₪) icon.
 * 
 * @component
 * @returns {JSX.Element} A circular icon with a shekel symbol
 */
const CoinIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="28" fill="#fbbf24" stroke="#f59e0b" strokeWidth="4" />
    <text x="32" y="40" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#fff">₪</text>
  </svg>
);

/**
 * UserCard component that displays user information in a card format.
 * Shows the user's name, current date/time, and a coin icon with a sum.
 * 
 * @component
 * @example
 * ```tsx
 * const user = {
 *   name: { first: 'ישראל', last: 'ישראלי' },
 *   location: { street: { number: 5000 } }
 * };
 * <UserCard user={user} />
 * ```
 * 
 * @param {UserCardProps} props - Component props
 * @param {User} props.user - User data object
 * 
 * @returns {JSX.Element} A card displaying user information
 */
const UserCard: React.FC<UserCardProps> = ({ user }) => (
  <div className="user-card">
    <div className="user-card-title">
      שם נציג: {user ? `${user.name.first} ${user.name.last}` : 'not found - error 111'}
    </div>
    <div className="user-card-date">
      לידיעתך סכום הצבירה בקופה שלך נכון לתאריך: {(() => {
        const now = new Date();
        const date = now.toLocaleDateString('he-IL');
        const time = now.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
        return `${time} ${date}`;
      })()}
    </div>
    <div className="user-card-coin">
      <CoinIcon />
    </div>
    <div className="user-card-sum">
      {user ? user.location.street.number.toLocaleString('he-IL') : '5,000'} <span className="user-card-sum-currency">₪</span>
    </div>
  </div>
);

export default UserCard; 