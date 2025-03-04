import { NewsCategory } from '@/services/api';
import { useState, useEffect } from 'react';
import SearchBox from './SearchBox';
import Link from 'next/link';

interface NavbarProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: NewsCategory) => void;
  currentCategory: NewsCategory;
}

const Navbar = ({ onSearch, onCategoryChange, currentCategory }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categories: NewsCategory[] = ['general', 'business', 'technology', 'sports', 'entertainment', 'health', 'science'];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSearch = (query: string) => {
    onSearch(query);
    setIsMenuOpen(false);
  };
  
  return (
    <>
      {/* Clean monochrome navbar with red accent - improve mobile responsiveness */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black shadow-[0_5px_30px_-15px_rgba(255,45,45,0.1)]' : 'bg-transparent'
      }`}>
        <div className="container px-4 md:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <span className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight heading">
                ByteNews<span className="ml-0.5 text-[rgb(var(--red))]">.</span>
              </span>
            </Link>
            
            <nav className="flex items-center gap-2 md:gap-4">
              {/* Category tabs for desktop with red accent for active */}
              <div className="hidden lg:flex">
                {categories.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onCategoryChange(cat)}
                    className={`px-4 py-2 mx-1 font-semibold uppercase text-sm tracking-wider transition-all ${
                      currentCategory === cat 
                        ? 'text-white border-b-2 border-[rgb(var(--red))]' 
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Menu button with red accent on hover */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="bg-white/10 hover:bg-[rgb(var(--red))]/20 px-3 py-1.5 md:px-4 md:py-2 rounded text-white font-medium md:font-semibold transition-all flex items-center"
                aria-label="Open menu and search"
              >
                <span className="mr-2 hidden sm:inline">MENU</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="12" x2="20" y2="12"></line>
                  <line x1="4" y1="6" x2="20" y2="6"></line>
                  <line x1="4" y1="18" x2="20" y2="18"></line>
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Full screen menu - improve for mobile */}
      <div 
        className={`fixed inset-0 bg-black z-50 transition-all duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-[rgb(var(--red))]" style={{
          opacity: 0.03,
          clipPath: isMenuOpen 
            ? 'circle(150% at top right)' 
            : 'circle(0% at calc(100% - 40px) 40px)',
          transition: 'clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1)'
        }}></div>
        
        <div className="container mx-auto px-4 md:px-8 py-4 md:py-6 relative h-full flex flex-col">
          {/* Menu header - make more compact on mobile */}
          <div className="flex justify-between items-center py-4 md:py-6">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight heading text-white">MENU</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 flex items-center justify-center group hover:bg-white/20"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="group-hover:rotate-90 transition-transform duration-300"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Improve responsive grid for mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mt-4 md:mt-6 grow overflow-y-auto">
            {/* Search column */}
            <div className="space-y-6 md:space-y-8" style={{
              animation: isMenuOpen ? 'fadeUp 0.6s ease-out forwards' : 'none',
              opacity: isMenuOpen ? 1 : 0
            }}>
              <h3 className="text-xl md:text-2xl font-bold text-white">Search News</h3>
              <SearchBox 
                onSearch={handleSearch} 
                placeholder="Type keywords and press enter..."
              />
              <div className="mt-4 md:mt-6">
                <h4 className="text-base md:text-lg font-semibold mb-3 md:mb-4 text-white/90">Popular Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {['climate change', 'technology', 'finance', 'politics', 'sports'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearch(term)}
                      className="px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 rounded-full text-white/90 text-xs md:text-sm font-medium transition-all"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Categories - improve mobile grid */}
            <div style={{
              animation: isMenuOpen ? 'fadeUp 0.8s ease-out forwards' : 'none',
              opacity: isMenuOpen ? 1 : 0
            }}>
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Categories</h3>
              <div className="grid grid-cols-2 gap-y-4 md:gap-y-6 gap-x-8 md:gap-x-12">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    onClick={() => {
                      onCategoryChange(category);
                      setIsMenuOpen(false);
                    }}
                    style={{
                      animation: isMenuOpen ? `fadeUp ${0.5 + index * 0.1}s ease-out forwards` : 'none',
                      opacity: isMenuOpen ? 1 : 0
                    }}
                    className="group text-left"
                  >
                    <span className="text-xl md:text-3xl font-bold text-white block hover:translate-x-2 transition-transform">
                      {category.toUpperCase()}
                    </span>
                    <span className="block h-[1px] bg-white/40 mt-2 w-0 group-hover:w-full transition-all duration-300"></span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer - better mobile layout */}
          <div className="mt-auto border-t border-white/10 pt-4 pb-2 md:pt-6 md:pb-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 text-white/70">
              <p className="text-sm">© {new Date().getFullYear()} NEWS</p>
              <div className="flex gap-4 md:gap-6 text-xs md:text-sm">
                <Link href="#" className="hover:text-white">About</Link>
                <Link href="#" className="hover:text-white">Contact</Link>
                <Link href="#" className="hover:text-white">Privacy</Link>
                <Link href="#" className="hover:text-white">Terms</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
