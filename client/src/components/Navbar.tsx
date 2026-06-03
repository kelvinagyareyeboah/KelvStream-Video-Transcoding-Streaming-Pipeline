import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  return (
    <Fragment>
      <nav className='ks-navbar'>
        {/* Brand */}
        <Link to='/' className='ks-brand' aria-label='KelvStream Home'>
          <div className='ks-brand-icon'>
            <svg width='20' height='20' viewBox='0 0 24 24' fill='white'>
              <path d='M8 5v14l11-7z' />
            </svg>
          </div>
          <span className='ks-brand-name'>KelvStream</span>
        </Link>

        {/* Search */}
        <SearchBar />

        {/* Upload Shortcut */}
        <a
          href={import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}
          target='_blank'
          rel='noreferrer'
          title='Upload & Transcode a Video via FFmpeg Pipeline'
          className='ks-upload-btn'
        >
          <span>⬆</span><span className='btn-text'> Upload</span>
        </a>
      </nav>
    </Fragment>
  );
};

export default Navbar;
