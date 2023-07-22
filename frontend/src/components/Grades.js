import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Grades.css'; // Import custom CSS file
const Grades = () => {
  const [userData, setUserData] = useState(null);
  const [user, setUser] = useState({});
  const [showTopics, setShowTopics] = useState(false);
  const [selectedTestIndex, setSelectedTestIndex] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      axios
        .get('http://localhost:8000/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            token: token,
          },
        })
        .then((response) => {
          setUser(response.data);

          const emailData = {
            email: response.data.email,
          };

          axios
            .get('http://localhost:8000/tests', {
              params: {
                email: response.data.email,
              },
            })
            .then((response) => {
              setUserData(response.data.tests);
            })
            .catch((error) => {
              console.log('Error retrieving tests:', error);
            });
        })
        .catch((error) => {
          console.log(error);
          navigate('/');
        });
    }
  },[]);

  const formatDateTime = (dateTime) => {
    const dateObj = new Date(dateTime);
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Adding 1 because the month is zero-based
    const year = dateObj.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    const formattedTime = dateObj.toLocaleTimeString([], { hour: 'numeric', minute: 'numeric', hour12: true });
    return `${formattedDate} ${formattedTime}`;
  };

  const handleTopicsClick = (index) => {
    setSelectedTestIndex(index === selectedTestIndex ? null : index);
  };
  const handleAnalysis = () => {
    navigate("/analysis");
  };

  const getStrength = (percentage) => {
    if (percentage >= 75) {
      return 'strong';
    } else if (percentage >= 25 && percentage < 75) {
      return 'average';
    } else {
      return 'weak';
    }
  };

  const renderStrengthDescription = (strength) => {
    if (strength === 'strong') {
      return 'Strong';
    } else if (strength === 'average') {
      return 'Average';
    } else {
      return 'Weak';
    }
  };

  const renderSubTable = (test, index) => {
    return (
      <table className="sub-table">
        <thead>
          <tr>
            <th>Topic Name</th>
            <th>Total Questions</th>
            <th>Correct Answers</th>
            <th>Percentage</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(test.topics_data).map((topic) => {
            const strength = getStrength(test.topics_data[topic].percentage);
            return (
              <tr key={topic} className={strength}>
                <td>{topic}</td>
                <td>{test.topics_data[topic].total_questions}</td>
                <td>{test.topics_data[topic].correct_answers}</td>
                <td>{test.topics_data[topic].percentage}%</td>
                <td>{renderStrengthDescription(strength)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <>
    <div className="grades-container">
      <h1 className="grades-heading">Results</h1>
      {userData ? (
        <div className="table-container">
          <table className="grades-table">
            <thead>
              <tr>
                <th>Test Number</th>
                <th>Language</th>
                <th>Correct Answers</th>
                <th>Easy Percentage</th>
                <th>Medium Percentage</th>
                <th>Hard Percentage</th>
                <th>Date</th>
                <th>Time</th>
                <th>Topics</th>
              </tr>
            </thead>
            <tbody>
              {userData.map((test, index) => (
                <tr key={index}>
                  <td>{test.test_number}</td>
                  <td>{test.Language}</td>
                  <td>{test.correct_answers}</td>
                  <td data-percentage="easy">{test.easy_percentage}%</td>
                  <td data-percentage="medium">{test.medium_percentage}%</td>
                  <td data-percentage="hard">{test.hard_percentage}%</td>
                  <td>{formatDateTime(test.test_datetime).split(' ')[0]}</td>
                  <td>{formatDateTime(test.test_datetime).split(' ')[1]} {formatDateTime(test.test_datetime).split(' ')[2]}</td>
                  <td>
                    <a onClick={() => handleTopicsClick(index)} className="topic-button">
                      Topics
                    </a>
                    {selectedTestIndex === index && renderSubTable(test, index)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading.....</p>
      )}
    </div>
    
    </>
  );
};

export default Grades;











