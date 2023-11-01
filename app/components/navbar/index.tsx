import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div className='w-full flex flex justify-between items-center p-4'>
      <div className='flex items-center space-x-4'>
        <div className='group relative'>
          <Link href='/'>
            <span className='mr-5'>tekstovi</span>
          </Link>
        </div>
      </div>
      <div>
        <Link href='/admin'>
          <p>admin</p>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
