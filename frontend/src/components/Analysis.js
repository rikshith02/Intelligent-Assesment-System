import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './analysis.css';

const Analysis = () => {
  const [testScores, setTestScores] = useState([]);
  const [user, setUser] = useState({});
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
              setTestScores(response.data.tests);
            })
            .catch((error) => {
              console.log('Error retrieving tests:', error);
            });
        })
        .catch((error) => {
          console.log(error);
          navigate('*');
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    // Register required scales
    Chart.register(...registerables);
  }, []);

  const calculateTopicsData = (language) => {
    const topicsData = {};

    testScores.forEach((test) => {
      if (test.Language === language) {
        Object.keys(test.topics_data).forEach((topic) => {
          if (topicsData[topic]) {
            topicsData[topic].total_questions += test.topics_data[topic].total_questions;
            topicsData[topic].correct_answers += test.topics_data[topic].correct_answers;
          } else {
            topicsData[topic] = {
              total_questions: test.topics_data[topic].total_questions,
              correct_answers: test.topics_data[topic].correct_answers,
            };
          }
        });
      }
    });

    return topicsData;
  };

  const javaTopicsData = calculateTopicsData('Java');
  const pythonTopicsData = calculateTopicsData('Python');

  const javaChartData = {
    labels: Object.keys(javaTopicsData),
    datasets: [
      {
        label: 'Java',
        data: Object.values(javaTopicsData).map((topicData) => topicData.correct_answers),
        backgroundColor :[
          '#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#EE82EE', '#7B68EE', '#008080', '#FFD700', '#00CED1', '#FFC0CB',
          '#7FFFD4', '#FF00FF', '#7FFF00', '#8B0000', '#00BFFF', '#FF4500', '#00FA9A', '#FF1493', '#000080', '#FF6347',
          '#0000FF', '#D2691E', '#7CFC00', '#8A2BE2', '#8B008B', '#ADFF2F', '#40E0D0', '#FF8C00', '#4B0082', '#98FB98'
        ],
      },
    ],
  };

  const pythonChartData = {
    labels: Object.keys(pythonTopicsData),
    datasets: [
      {
        label: 'Python',
        data: Object.values(pythonTopicsData).map((topicData) => topicData.correct_answers),
        backgroundColor :[
          '#FF6384', '#36A2EB', '#FFCE56', '#FF9F40', '#EE82EE', '#7B68EE', '#008080', '#FFD700', '#00CED1', '#FFC0CB',
          '#7FFFD4', '#FF00FF', '#7FFF00', '#8B0000', '#00BFFF', '#FF4500', '#00FA9A', '#FF1493', '#000080', '#FF6347',
          '#0000FF', '#D2691E', '#7CFC00', '#8A2BE2', '#8B008B', '#ADFF2F', '#40E0D0', '#FF8C00', '#4B0082', '#98FB98'
        ],
      },
    ],
  };

  if (testScores.length > 0) {
    const labels = testScores.map((score) => `${score.test_number} - ${score.Language}`);
    const scores = testScores.map((score) => score.correct_answers);

    const chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Correct Answers',
          data: scores,
          backgroundColor:'#56a1d8',
          borderColor: '#56a1d8',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      scales: {
        y: {
          min: 0,
          max: 10,
          title: {
            display: true,
            text: 'CORRECT ANSWERS',
            color: '#222',
          },
        },
        x: {
          title: {
            display: true,
            text: 'TEST NUMBER - LANGUAGE',
            color: '#222',
          },
        },
      },
    };

    return (
      <>
        <div className="chart-container1">
          <h1>Tests</h1>
          <Bar data={chartData} options={options} />
        </div>
        <div className="chart-container2">
          <h2>Java</h2>
          <Pie data={javaChartData} />
        </div>
        <div className="chart-container3">
          <h2>Python</h2>
          <Pie data={pythonChartData} />
        </div>
      </>
    );
  } else {
    return <p className="loading-message">Loading...</p>;
  }
};



export default Analysis;


