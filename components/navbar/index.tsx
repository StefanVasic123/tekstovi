import React, { useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import GrayHeartIcon from '@/icons/GrayHeartIcon';
import BlueHeartIcon from '@/icons/BlueHeartIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { useWishList } from '@/app/context';

const Navbar = () => {
  const { isHeartClicked, toggleHeartClick } = useWishList();
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const isUser = useCurrentUser();

  const handleProfileClick = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <div className='w-full flex justify-between items-center p-4'>
      {/* Left section */}
      <div className='flex items-center space-x-4'>
        <div className='group relative'>
          <Link href='/'>
            <span className='mr-5'>tekstovi</span>
          </Link>
        </div>
      </div>

      {/* Right section */}
      <div className='flex items-center space-x-4'>
        {isHeartClicked ? (
          <BlueHeartIcon onClick={toggleHeartClick} />
        ) : (
          <GrayHeartIcon onClick={toggleHeartClick} />
        )}
        <Link href='/how-it-works'>
          <p className='ml-4 text-center'>
            How it
            <br />
            works
          </p>
        </Link>
        <Link href='/about-us'>
          <p className='ml-4 text-center'>
            About
            <br />
            us
          </p>
        </Link>
        <Link href='/pricing'>
          <p className='ml-4 text-center'>Pricing</p>
        </Link>
        <Link href='/admin'>
          <p className='ml-4 text-center'>Admin</p>
        </Link>
        <div
          className='ml-4 text-center cursor-pointer'
          onMouseEnter={handleProfileClick}
          onMouseLeave={closeDropdown}
        >
          <Link href={isUser ? '' : '/auth/login'}>
            <FontAwesomeIcon icon={faUser} />
          </Link>
          {isDropdownOpen && isUser && (
            <div className='absolute bg-white border rounded-md right-0'>
              <Link href='/my-account'>
                <p className='block p-2'>My Account</p>
              </Link>
              <Link href='/settings'>
                <p className='block p-2'>Settings</p>
              </Link>
              <Link href='/logout'>Logout</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
