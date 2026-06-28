import React, { useState } from 'react';

const GridThumbnail = ({ src, className, style }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return null;
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
};

export default GridThumbnail;