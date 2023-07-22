
import React from 'react';
import { Link } from 'react-router-dom';
import './sidebarc.css';

const Sidebar = ({ sidebarVisible, detail }) => {
  const name = detail&& detail.fname? detail.fname.toUpperCase() : '';
  return (
    <div className={`sidebar ${sidebarVisible ? 'active' : ''}`}>
      <div className='udetail'>
        <img className="pimage" src="https://cdn-icons-png.flaticon.com/128/3281/3281344.png" alt="Profile Icon" />
        <p className='p1'>{name}</p>
        <p className='p2'>{detail && detail.email}</p>
      </div>
      <ul className="sidebar-menu">
        <li>
          <Link to="/profile">
            <img src="https://cdn-icons-png.flaticon.com/128/1077/1077114.png" alt="Profile Link Icon" />
            <span>Profile</span>
          </Link>
        </li>
        <li>
          <Link to="/user">
            <img src="https://cdn-icons-png.flaticon.com/128/681/681494.png" alt="Profile Link Icon" />
            <span>Users</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

