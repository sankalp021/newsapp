import { useState, KeyboardEvent } from 'react';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBox = ({ onSearch, placeholder = "Search news..." }: SearchBoxProps) => {
  const [searchInput, setSearchInput] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (searchInput.trim()) {
      onSearch(searchInput);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="search"
          placeholder={placeholder}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-white/5 border border-white/20 rounded-lg py-3 md:py-4 px-4 md:px-5 pr-12
                    text-base md:text-lg lg:text-xl font-medium text-white
                    focus:outline-none focus:border-white/50
                    placeholder:text-white/40 transition-all duration-200"
        />
        <button 
          onClick={handleSearch}
          aria-label="Search"
          className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 rounded-lg
                    w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white/20
                    text-white transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </div>

      {searchInput.length > 0 && (
        <button 
          onClick={() => setSearchInput('')} 
          className="absolute right-14 md:right-16 top-1/2 -translate-y-1/2 text-white/40 hover:text-white
                    w-6 h-6 md:w-8 md:h-8 flex items-center justify-center"
          aria-label="Clear search"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBox;
