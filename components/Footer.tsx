import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-4 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Course Builder. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
