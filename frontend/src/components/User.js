import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './user1.css';
import { FaUser, FaEnvelope, FaUserTag } from 'react-icons/fa';

const User = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios
        .get('http://localhost:8000/users')
        .then(response => {
          setUsers(response.data);
        })
        .catch(error => {
          console.log(error);
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      <div className="user-container">
        <h2>User List</h2>
        <table className="user-table">
          <thead>
            <tr>
              <th className="user-table-header">
                <FaUser className="user-icon" />
                <span className="user-column-name">Name</span>
              </th>
              <th className="user-table-header">
                <FaEnvelope className="user-icon" />
                <span className="user-column-name">Email</span>
              </th>
              <th className="user-table-header">
                <FaUserTag className="user-icon" />
                <span className="user-column-name">Role</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.fname}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default User;
