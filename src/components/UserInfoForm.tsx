import React from 'react';
import './UserInfoForm.css';

interface UserInfo {
  name: string;
  date: string;
  address: string;
  phoneNumber: string;
}

interface UserInfoFormProps {
  userInfo: UserInfo;
  onUserInfoChange: (field: keyof UserInfo, value: string) => void;
}

const UserInfoForm: React.FC<UserInfoFormProps> = ({ userInfo, onUserInfoChange }) => {
  return (
    <div className="user-info-form">
      <h2>User Information</h2>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          value={userInfo.name}
          onChange={(e) => onUserInfoChange('name', e.target.value)}
          placeholder="Enter your name"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          value={userInfo.date}
          onChange={(e) => onUserInfoChange('date', e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="address">Address:</label>
        <textarea
          id="address"
          value={userInfo.address}
          onChange={(e) => onUserInfoChange('address', e.target.value)}
          placeholder="Enter your address"
          rows={3}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="phoneNumber">Phone Number:</label>
        <input
          type="tel"
          id="phoneNumber"
          value={userInfo.phoneNumber}
          onChange={(e) => onUserInfoChange('phoneNumber', e.target.value)}
          placeholder="Enter your phone number"
          required
        />
      </div>
    </div>
  );
};

export default UserInfoForm;