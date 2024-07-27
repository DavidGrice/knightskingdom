import React, { useState } from 'react';
import './ProfileIcon.module.css'; // Import the CSS file for styling

const ProfileIcon = ({ initialImage, initialText }) => {
  const [image, setImage] = useState(initialImage);
  const [text, setText] = useState(initialText);

  // Function to upgrade the image
  const upgradeImage = (newImage) => {
    setImage(newImage);
  };

  return (
    <div className="profile-icon">
      <img src={image} alt="Profile Icon" className="profile-image" />
      <span className="profile-text">{text}</span>
    </div>
  );
};

export default ProfileIcon;