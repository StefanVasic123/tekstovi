import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMedia } from 'react-use';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';
import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import { useWishList } from '@/app/context';

const Navbar = () => {
  const { isWishlist, toggleHeartClick } = useWishList();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const isUser = useCurrentUser();
  const isSmallScreen = useMedia('(max-width: 767px)'); // Adjust the max-width value as needed

  const handleProfileClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className='w-full flex flex-col sm:flex-row justify-between items-center p-4'>
      {/* Left section */}
      <div className='flex items-center space-x-4 hidden lg:flex'>
        <div className='group relative'>
          <Link href='/'>
            <span className='mr-5'>tekstovi</span>
          </Link>
        </div>
      </div>

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
        {isMobileMenuOpen && (
          <div className='flex items-center space-x-4'>
            <div className='group relative'>
              <Link href='/'>
                <span className={`${isSmallScreen ? '' : 'mr-5'}`}>
                  tekstovi
                </span>
              </Link>
            </div>
          </div>
        )}
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
  );
};

export default Navbar;
