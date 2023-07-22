import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './result.css';

const Result = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resultData = location?.state?.resultData;

  if (!resultData) {
    return null; // Handle the case when resultData is undefined
  }

  const {
    totalQuestions,
    Language,
    correctAnswers,
    totalEasyQuestions,
    correctEasyQuestions,
    totalMediumQuestions,
    correctMediumQuestions,
    totalHardQuestions,
    correctHardQuestions,
    topics,
  } = resultData;

  const calculatePercentage = (correct, total) => {
    return total !== 0 ? ((correct / total) * 100).toFixed(2) : 0;
  };

  const easyPercentage = calculatePercentage(correctEasyQuestions, totalEasyQuestions);
  const mediumPercentage = calculatePercentage(correctMediumQuestions, totalMediumQuestions);
  const hardPercentage = calculatePercentage(correctHardQuestions, totalHardQuestions);
 

  const getResultIcon = (correct, total) => {
    if (correct === total) {
      return <FaCheckCircle className="result-icon correct" />;
    } else if (correct === 0) {
      return <FaTimesCircle className="result-icon incorrect" />;
    } else {
      return <FaTimesCircle className="result-icon partially-correct" />;
    }
  };

  const storeData = () => {
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
        .then(response => {
          const fname = response.data.fname;
          const email = response.data.email;
          const language=Language;
          const correct_answers = correctAnswers;
          const easy_percentage = easyPercentage;
          const medium_percentage = mediumPercentage;
          const hard_percentage = hardPercentage;
          const topicsData = {};

          // Loop through the topics object and convert it to the desired format
          Object.entries(topics).forEach(([topic, result]) => {
            topicsData[topic] = {
              total_questions: result.totalQuestions,
              correct_answers: result.totalCorrectAnswers,
              percentage: calculatePercentage(result.totalCorrectAnswers, result.totalQuestions),
            };
          });

          // Make the API call to store the data

          const StoreData = { fname, email,language, correct_answers, easy_percentage, medium_percentage, hard_percentage ,topicsData};
          axios.post('http://localhost:8000/store_data', StoreData)
            .then(response => {
              console.log(response.data);
              navigate('/Dashboard'); // Redirect to the home page or any other page after storing the data
            })
            .catch(error => {
              console.log(error);
              navigate('/error'); // Redirect to error page if there's an error
            });
        })
        .catch(error => {
          console.log(error);
          navigate('/error'); // Redirect to error page if there's an error
        });
    } else {
      navigate('/error'); // Redirect to error page if user is not logged in
    }
  };

  return (
    <div className="result-container">
      <h1>Quiz Result</h1>
      <p className="result-info">Total Questions: {totalQuestions}</p>
      <p className="result-info">Correct Answers: {correctAnswers}</p>
      <div className="result-section">
        <div className="result-category result-category1 easy">
          <h2>Easy Questions</h2>
          <p className="result-subinfo">
            {correctEasyQuestions} / {totalEasyQuestions} ({easyPercentage}%)
          </p>
          {getResultIcon(correctEasyQuestions, totalEasyQuestions)}
        </div>
        <div className="result-category result-category2 medium">
          <h2>Medium Questions</h2>
          <p className="result-subinfo">
            {correctMediumQuestions} / {totalMediumQuestions} ({mediumPercentage}%)   
          </p>
          {getResultIcon(correctMediumQuestions, totalMediumQuestions)}
        </div>
        <div className="result-category result-category3 hard">
          <h2>Hard Questions</h2>
          <p className="result-subinfo">
            {correctHardQuestions} / {totalHardQuestions} ({hardPercentage}%)
          </p>
          {getResultIcon(correctHardQuestions, totalHardQuestions)}
        </div>
      </div>
      <button className="bp1" onClick={storeData}>Exit Quiz</button>
    </div>
    
  );
};

export default Result;
