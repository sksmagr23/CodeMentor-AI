import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | string;
  alt?: string;
}

/** App mark from /public/logo.png — use in header & brand icon slots */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  alt = 'CodeMentor AI',
}) => {
  const dim = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src="/logo.png"
      alt={alt}
      width={typeof size === 'number' ? size : undefined}
      height={typeof size === 'number' ? size : undefined}
      className={`brand-logo ${className}`}
      style={{ width: dim, height: dim }}
      draggable={false}
    />
  );
};
