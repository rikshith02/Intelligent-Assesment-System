import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { FaUser, FaEnvelope, FaUserTag } from 'react-icons/fa';
import "./profile.css";

const Profile = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passShow, setPassShow] = useState(false);
  const [cpassShow, setCPassShow] = useState(false);
  const [cupassShow, setCuPassShow] = useState(false);
  const [toggleImage1, setToggleImage1] = useState('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
  const [toggleImage2, setToggleImage2] = useState('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
  const [toggleImage3, setToggleImage3] = useState('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
  const [user, setUser] = useState({});
  const navigate = useNavigate();

  const notifyError = (message) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
    });
  };

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

  const validatePassword = () => {
    // Validate the new password length
    if (newPassword.length < 6) {
      notifyError('Password must be at least 6 characters long.');
      return false;
    }

    // Validate the presence of a digit
    if (!/\d/.test(newPassword)) {
      notifyError('Password must contain at least one digit.');
      return false;
    }

    // Validate the presence of an uppercase letter
    if (!/[A-Z]/.test(newPassword)) {
      notifyError('Password must contain at least one uppercase letter.');
      return false;
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      notifyError("New password and confirm password don't match.");
      return false;
    }

    return true;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    

    if (!validatePassword()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const response = await axios.put(
        'http://localhost:8000/change-password',
        {
          email: user.email,
          current_password: currentPassword,
          new_password: newPassword,
        },
       {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowPopup(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        toast.success('Password changed successfully!', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      notifyError('An error occurred while changing the password.');
    }
  };

  const handleToggleImage1 = () => {
    if (toggleImage1 === 'https://cdn-icons-png.flaticon.com/128/2767/2767194.png') {
      setToggleImage1('https://cdn-icons-png.flaticon.com/128/2767/2767146.png');
    } else {
      setToggleImage1('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
    }
  };

  const handleToggleImage2 = () => {
    if (toggleImage2 === 'https://cdn-icons-png.flaticon.com/128/2767/2767194.png') {
      setToggleImage2('https://cdn-icons-png.flaticon.com/128/2767/2767146.png');
    } else {
      setToggleImage2('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
    }
  };

  const handleToggleImage3 = () => {
    if (toggleImage3 === 'https://cdn-icons-png.flaticon.com/128/2767/2767194.png') {
      setToggleImage3('https://cdn-icons-png.flaticon.com/128/2767/2767146.png');
    } else {
      setToggleImage3('https://cdn-icons-png.flaticon.com/128/2767/2767194.png');
    }
  };

  return (
    <>
      {showPopup && (
        <div className="overlay">
          <div className="popup">
            <h2>Change Password</h2>
            <h6 style={{ textAlign: 'center', fontSize: '20px', fontFamily: 'Cursive' }}>{user.email}</h6>
            <form className="popup-form" onSubmit={handleChangePassword}>
              <div className="input-container">
                <input
                  type={cupassShow ? "text" : "password"} // Show or hide current password
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  className="password-toggle"
                  onClick={() => setCuPassShow(!cupassShow)}
                  type="button"
                >
                  <img
                    src={toggleImage1}
                    alt="Toggle"
                    onClick={handleToggleImage1}
                  />
                </button>
              </div>
              <div className="input-container">
                <input
                  type={passShow ? "text" : "password"} // Show or hide new password
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  className="password-toggle"
                  onClick={() => setPassShow(!passShow)}
                  type="button"
                >
                  <img
                    src={toggleImage2}
                    alt="Toggle"
                    onClick={handleToggleImage2}
                  />
                </button>
              </div>
              <div className="input-container">
                <input
                  type={cpassShow ? "text" : "password"} // Show or hide confirm password
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  className="password-toggle"
                  onClick={() =>{ setCPassShow(!cpassShow)}}
                  type="button"
                >
                  <img
                    src={toggleImage3}
                    alt="Toggle"
                    onClick={handleToggleImage3}
                  />
                </button>
              </div>
              <button className='sbt' type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
      <div className="profile-container">
        <h2>Profile</h2>
        <div className="profile-info">
          <div className="profile-icon">
            <FaUser />
          </div>
          <p className="profile-data">
            <span className="profile-label">Name:</span> {user.fname}
          </p>
        </div>
        <div className="profile-info">
          <div className="profile-icon">
            <FaEnvelope />
          </div>
          <p className="profile-data">
            <span className="profile-label">Email:</span> {user.email}
          </p>
        </div>
        <div className="profile-info">
          <div className="profile-icon">
            <FaUserTag />
          </div>
          <p className="profile-data">
            <span className="profile-label">Role:</span> {user.role}
          </p>
        </div>
      </div>
      <button className='bj1' onClick={() => setShowPopup(true)}>Change Password</button>
      <ToastContainer/>
    </>
  );
}


export default Profile;
