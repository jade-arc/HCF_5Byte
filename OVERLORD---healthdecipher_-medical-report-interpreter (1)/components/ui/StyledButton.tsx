
import React from 'react';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const StyledButton: React.FC<StyledButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className="bg-gradient-to-br from-primary to-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 active:scale-95 disabled:bg-gray-400 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none flex items-center justify-center h-[42px]"
    >
      {children}
    </button>
  );
};
