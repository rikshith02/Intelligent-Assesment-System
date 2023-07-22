
import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './dashboard.css';
import { useNavigate } from 'react-router-dom';
import SidebarC from './SidebarC';

const Dashboard = () => {
  const [user, setUser] = useState({});
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [totalJavaQuestions, setTotalJavaQuestions] = useState(0);
  const [answeredJavaQuestions, setAnsweredJavaQuestions] = useState(0);
  const [totalPythonQuestions, setTotalPythonQuestions] = useState(0);
  const [answeredPythonQuestions, setAnsweredPythonQuestions] = useState(0);
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
  const navigate = useNavigate();

  const notifyError = (message) => {
    toast.error(message, {
      position: toast.POSITION.TOP_CENTER,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
  
      if (token) {
        try {
          const responseUser = await axios.get('http://localhost:8000/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            params: {
              token: token,
            },
          });
          setUser(responseUser.data);
  
          const responseJava = await axios.post('http://localhost:8000/questions', {
            email: responseUser.data.email,
            language: 'java',
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const { correct_total_questions: correctJavaQuestions, total_questions: totalJavaQuestions } = responseJava.data;
          setTotalJavaQuestions(totalJavaQuestions);
          setAnsweredJavaQuestions(correctJavaQuestions);
  
          const responsePython = await axios.post('http://localhost:8000/questions', {
            email: responseUser.data.email,
            language: 'python',
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const { correct_total_questions: correctPythonQuestions, total_questions: totalPythonQuestions } = responsePython.data;
          setTotalPythonQuestions(totalPythonQuestions);
          setAnsweredPythonQuestions(correctPythonQuestions);
  
          const url = `http://localhost:8000/login-history?email=${responseUser.data.email}`;
          const responseLoginCount = await axios.get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const loginCount = responseLoginCount.data.loginCount;
          const passwordChangeCount = responseLoginCount.data.passwordChangeCount;
          if (loginCount === 1 && passwordChangeCount === 0) {
            setShowPopup(true);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          navigate('/');
        }
      } else {
        navigate('/');
      }
    };
  
    fetchData();
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
          current_password:currentPassword,
          new_password:newPassword,
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

  const handleJavaAttempt = () => {
    navigate('/java');
  };

  const handlePythonAttempt = () => {
    navigate('/python');
  };

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
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
                  onClick={() => setCPassShow(!cpassShow)}
                  type="button"
                  >
                  <img
                    src={toggleImage3}
                    alt="Toggle"
                    onClick={handleToggleImage3}
                  />
                </button>
              </div>
              <button className='sbt'type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}

      <div className={`adashboard-container ${sidebarVisible ? 'sidebar-visible' : ''}`}>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <img src="https://cdn-icons-png.flaticon.com/128/3917/3917762.png" alt="Sidebar Toggle" />
        </button>
        <SidebarC sidebarVisible={sidebarVisible} detail={user} />
      </div>
      <div className='j'>
        <h1>Java</h1>
        <button className='bj' onClick={handleJavaAttempt}>Attempt</button>
        {totalJavaQuestions > 0 && (
          <>
            <p11>Total Questions: {totalJavaQuestions}</p11>
            <p12>Answered Questions: {answeredJavaQuestions}</p12>
            <p13>Unanswered Questions: {totalJavaQuestions - answeredJavaQuestions}</p13>
          </>
        )}
      </div>
      <div className='p'>
        <h1>Python</h1>
        <button className='bp' onClick={handlePythonAttempt}>Attempt</button>
        {totalPythonQuestions > 0 && (
          <>
            <p11>Total Questions: {totalPythonQuestions}</p11>
            <p12>Answered Questions: {answeredPythonQuestions}</p12>
            <p13>Unanswered Questions: {totalPythonQuestions - answeredPythonQuestions}</p13>
          </>
        )}
      </div>
      <ToastContainer/>
    </>
  );
};

export default Dashboard;


