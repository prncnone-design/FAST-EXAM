
import React from 'react';

interface HeaderProps {
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={onLogoClick} 
          className="cursor-pointer flex items-center space-x-2"
        >
          <div className="bg-black text-white px-2 py-1 font-black text-xl italic tracking-tighter">
            AT
          </div>
          <span className="font-extrabold text-2xl tracking-tighter">ABDY TAH</span>
        </div>
        <div className="hidden md:flex space-x-6 text-sm font-medium text-slate-500 uppercase tracking-widest">
          <span>Speed</span>
          <span className="text-black">•</span>
          <span>Precision</span>
          <span className="text-black">•</span>
          <span>Preservation</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
