
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./adashboard.css";
import Sidebar from './Sidebar';

const Adashboard = () => {
  const [user, setUser] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios.get('http://localhost:8000/user', {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          token: token
        }
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(error => {
          console.log(error);
          navigate('*'); // Redirect to error page if there's an error
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleUpload = () => {
    navigate('/upload');
  };
  const handleUserUpload = () => {
    navigate('/userupload');
  };



  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  return (
    <>
      <div className={`adashboard-container ${sidebarVisible ? 'sidebar-visible' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <img src="https://cdn-icons-png.flaticon.com/128/3917/3917762.png" alt="Sidebar Toggle" />
        </button>
        <Sidebar sidebarVisible={sidebarVisible} detail={user} />
      </div>
      <div className='u'>
        <h1>Users</h1>
        <button className='bu' onClick={handleUserUpload}>Upload</button>
      </div>
      <div className='q'>
        <h1>Question Bank</h1>
        <button className='bq' onClick={handleUpload}>Upload</button>
      </div>
    </>
  );
}

export default Adashboard;
