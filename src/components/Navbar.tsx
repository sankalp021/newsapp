import { NewsCategory } from '@/services/api';
import { useState } from 'react';

interface NavbarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: NewsCategory) => void;
  currentCategory: NewsCategory;
}

const Navbar = ({ onSearch, onCategoryChange, currentCategory }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const categories: NewsCategory[] = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 mix-blend-difference">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <span className="text-3xl font-bold tracking-tighter">NEWS</span>
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="text-2xl"
          >
            MENU
          </button>
        </div>
      </div>

      {/* Full screen menu */}
      <div className={`fixed inset-0 bg-black z-50 transition-transform duration-500 ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-12">
            <span className="text-3xl font-bold">MENU</span>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="text-2xl"
            >
              CLOSE
            </button>
          </div>

          <div className="space-y-8">
            <div className="relative">
              <input
                type="search"
                placeholder="SEARCH NEWS..."
                className="w-full bg-transparent text-5xl font-bold border-b-2 border-white/20 pb-4 focus:outline-none focus:border-white placeholder:text-white/20"
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-4xl font-bold">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    onCategoryChange(category);
                    setIsMenuOpen(false);
                  }}
                  className={`p-4 text-left hover:bg-white hover:text-black transition-colors ${
                    currentCategory === category ? 'bg-white text-black' : ''
                  }`}
                >
                  {category.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
