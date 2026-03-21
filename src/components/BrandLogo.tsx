import React from 'react';

interface BrandLogoProps {
  size?: 'header' | 'login';
  appearance?: 'solid' | 'blended';
}

const IMAGE_SIZE = 225;
const CROP_BOX = {
  left: 24,
  top: 80,
  width: 167,
  height: 63,
};

const sizes = {
  header: {
    width: 168,
    maxWidth: '36vw',
  },
  login: {
    width: 290,
    maxWidth: '100%',
  },
};

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'login', appearance = 'solid' }) => {
  const config = sizes[size];
  const scale = config.width / CROP_BOX.width;
  const containerHeight = CROP_BOX.height * scale;
  const imageSize = IMAGE_SIZE * scale;
  const isBlended = appearance === 'blended';
  const logoSource =
    size === 'login' ? '/foto-login-remove-background.com.png' : '/foto-login.jpg';

  return (
    <div
      style={{
        width: `${config.width}px`,
        maxWidth: config.maxWidth,
        height: `${containerHeight}px`,
        overflow: 'hidden',
        position: 'relative',
        display: 'block',
      }}
    >
      <img
        src={logoSource}
        alt="Vintage Arte de Morar"
        style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
        maxWidth: 'none',
        display: 'block',
        transform: `translate(-${CROP_BOX.left * scale}px, -${CROP_BOX.top * scale}px)`,
        transformOrigin: 'top left',
        pointerEvents: 'none',
        userSelect: 'none',
        mixBlendMode: isBlended ? 'multiply' : 'normal',
        opacity: isBlended ? 0.92 : 1,
        filter: isBlended ? 'contrast(1.04) saturate(1.08)' : 'none',
      }}
    />
  </div>
  );
};

export default BrandLogo;
