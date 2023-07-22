import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './sidebarc.css';

const SidebarC = ({ sidebarVisible, detail }) => {
  const [emailExists, setEmailExists] = useState(false);

  useEffect(() => {
    if (detail && detail.email) {
      axios
        .get('http://localhost:8000/checkEmail', {
          params: {
            email: detail.email,
          },
        })
        .then((response) => {
          setEmailExists(response.data.exists);
        })
        .catch((error) => {
          console.log('Error checking email:', error);
        });
    }
  }, [detail]);

  const name = detail && detail.fname ? detail.fname.toUpperCase() : '';

  return (
    <div className={`sidebar ${sidebarVisible ? 'active' : ''}`}>
      <div className='udetail'>
        <img className="pimage" src="https://cdn-icons-png.flaticon.com/128/1154/1154473.png" alt="Profile Icon" />
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
          {emailExists ? (
            <Link to="/grade">
              <img className="rimage" src="https://cdn-icons-png.flaticon.com/128/9217/9217018.png" alt="Result Link Icon" />
              <span>Result</span>
            </Link>
          ) : (
            <span className="disabled-link">
              <img className="rimage" src="https://cdn-icons-png.flaticon.com/128/9217/9217018.png" alt="Result Link Icon" />
              <span>Result</span>
            </span>
          )}
        </li>
        <li>
          {emailExists ? (
            <Link to="/analysis">
              <img className="rimage" src="https://cdn-icons-png.flaticon.com/128/6744/6744989.png" alt="Analysis Link Icon" />
              <span>Analysis</span>
            </Link>
          ) : (
            <span className="disabled-link">
              <img className="rimage" src="https://cdn-icons-png.flaticon.com/128/6744/6744989.png" alt="Analysis Link Icon" />
              <span>Analysis</span>
            </span>
          )}
        </li>
      </ul>
    </div>
  );
};

export default SidebarC;

