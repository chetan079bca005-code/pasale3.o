import React from 'react';

interface NepaliRupeeIconProps {
  className?: string;
}

/**
 * Nepali Rupee (रु) icon component to replace dollar sign icons
 * This displays the Nepali Rupee symbol as a styled text element
 */
export const NepaliRupeeIcon: React.FC<NepaliRupeeIconProps> = ({ className = '' }) => (
  <span 
    className={`inline-flex items-center justify-center font-bold ${className}`}
    style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
  >
    रु
  </span>
);

export default NepaliRupeeIcon;
