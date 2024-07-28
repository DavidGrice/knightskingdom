import React from 'react';

const CommonComponent = ({ initialImage, hoverImage, altText, onClick }) => {
    return (
        <img 
            src={initialImage} 
            alt={altText} 
            onClick={onClick} 
            onMouseOver={(e) => e.currentTarget.src = hoverImage}
            onMouseOut={(e) => e.currentTarget.src = initialImage}
        />
    );
};

export default CommonComponent;