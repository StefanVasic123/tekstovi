import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useSearchPosts } from '@/hooks/useSearchPosts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faBars,
  faTimes,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import { usePosts } from '@/app/context';
import FilterPanel from '../filters/filterPanel';

const Navbar = () => {
  const { isWishlist, toggleHeartClick } = usePosts();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  const router = useRouter();

  const isUser = useCurrentUser();
  const isSmallScreen = window.innerWidth < 768;

  const handleProfileClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSearchIconClick = () => {
    setSearchOpen((prevState) => !prevState);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Use your custom search hook to fetch data based on the searchQuery
  const searchPosts = useSearchPosts(searchQuery);

  useEffect(() => {
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  return (
    <div className='w-full flex sm:flex-row justify-between p-4'>
      {/* Left section */}
      <div className='pt-2'>
        <Link href='/'>
          <p className='font-black'>LYRIFY</p>
        </Link>
      </div>

      <div className={`${isSmallScreen && 'flex flex-col'}`}>
        {/* Mobile menu button */}
        <button
          className='text-3xl cursor-pointer sm:hidden'
          onClick={handleMobileMenuClick}
        >
          {isMobileMenuOpen ? (
            <FontAwesomeIcon icon={faTimes} />
          ) : (
            <FontAwesomeIcon icon={faBars} />
          )}
        </button>

        {/* Right section */}
        <div
          className={`flex items-center space-x-4 ${
            isMobileMenuOpen ? 'flex-col' : 'hidden sm:flex'
          }`}
        >
          {/* Search icon */}
          <div className='nav-link'>
            <button
              onClick={handleSearchIconClick}
              className='focus:outline-none'
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          {/* Search input field */}
          {isSearchOpen && (
            <div className='nav-link'>
              <input
                type='text'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search...'
                className='border rounded-md p-2'
              />
            </div>
          )}
          {/* isMobileMenuOpen && (
          <div className='flex items-center space-x-4'>
            <div className='group relative'>
              <Link href='/'>
                <span className={`${isSmallScreen ? '' : 'mr-5'}`}>
                  tekstovi
                </span>
              </Link>
            </div>
          </div>
        ) */}
          <div className='nav-link'>
            {isWishlist ? (
              <BlueHeartIcon onClick={toggleHeartClick} />
            ) : (
              <GrayHeartIcon onClick={toggleHeartClick} />
            )}
          </div>

          <Link className='nav-link' href='/how-it-works'>
            <p
              className={`text-center ${isSmallScreen ? '' : 'ml-4'}`}
              onClick={closeMobileMenu}
            >
              How it
              <br />
              works
            </p>
          </Link>

          <Link className='nav-link' href='/about-us'>
            <p
              className={`text-center ${isSmallScreen ? '' : 'ml-4'}`}
              onClick={closeMobileMenu}
            >
              About
              <br />
              us
            </p>
          </Link>
          <Link className='nav-link' href='/pricing'>
            <p
              className={`text-center ${isSmallScreen ? '' : 'ml-4'}`}
              onClick={closeMobileMenu}
            >
              Pricing
            </p>
          </Link>
          {isUser && (
            <Link className='nav-link' href='/admin'>
              <p
                className={`text-center ${isSmallScreen ? '' : 'ml-4'}`}
                onClick={closeMobileMenu}
              >
                Admin
              </p>
            </Link>
          )}
          <div
            className='ml-4 text-center cursor-pointer relative nav-link'
            onMouseEnter={handleProfileClick}
            onMouseLeave={closeDropdown}
          >
            <button
              onClick={() => !isUser && router.push('/auth/login')}
              className='focus:outline-none'
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
            {isDropdownOpen && isUser && (
              <div
                className={`${
                  !isSmallScreen && 'absolute'
                } bg-white border rounded-md right-0`}
              >
                <Link href='/my-account'>
                  <p className='block p-2' onClick={closeDropdown}>
                    My Account
                  </p>
                </Link>
                <Link href='/settings'>
                  <p className='block p-2' onClick={closeDropdown}>
                    Settings
                  </p>
                </Link>
                <Link href='/logout'>
                  <p className='block p-2' onClick={closeDropdown}>
                    Logout
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile Filters Button */}
      <div className='md:hidden lg:hidden'>
        <button
          onClick={() => setShowSidebar((prevProps) => !prevProps)}
          className='p-2 border rounded-md'
        >
          Filters
        </button>
        <FilterPanel show={showSidebar} setter={setShowSidebar} />
      </div>
    </div>
  );
};

export default Navbar;
