import React, { useState, useEffect } from "react";
import axios from "axios";
import "./java.css";
import { FaMicrophone, FaArrowRight, FaArrowLeft, FaStepForward, FaCircle, FaSquare,FaExclamationTriangle} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaRegSmile, FaMeh, FaRegFrown } from 'react-icons/fa';

const Java = () => {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [user, setUser] = useState({});

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

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

  const handleListen = () => {
    if (userAnswers[questionIndex] !== "Skipped") {
      if (!isListening) {
        setIsListening(true);
        recognition.start();
        recognition.onresult = (event) => {
          const speechToText = event.results[0][0].transcript;
          setUserAnswers((prevUserAnswers) => {
            const newUserAnswers = [...prevUserAnswers];
            const previousAnswer = newUserAnswers[questionIndex];
            newUserAnswers[questionIndex] = previousAnswer ? previousAnswer + " " + speechToText : speechToText;
            return newUserAnswers;
          });
        };
        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsListening(false);
        recognition.stop();
      }
    }
  };

  const handleNextQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      compareLists();
    }
  };

  const handleSkipQuestion = () => {
    if (questionIndex < questions.length - 1) {
      setUserAnswers((prevUserAnswers) => {
        const newUserAnswers = [...prevUserAnswers];
        newUserAnswers[questionIndex] = "Skipped";
        return newUserAnswers;
      });
      setQuestionIndex(questionIndex + 1);
    } else {
      compareLists();
    }
  };

  const handlePreviousQuestion = () => {
    if (questionIndex > 0) {
      setQuestionIndex(questionIndex - 1);
    }
  };

  const handleEditAnswer = (event) => {
    const editedAnswer = event.target.value;
    setUserAnswers((prevUserAnswers) => {
      const newUserAnswers = [...prevUserAnswers];
      newUserAnswers[questionIndex] = editedAnswer;
      return newUserAnswers;
    });
  };

  const compareLists = () => {
    axios
      .post("http://localhost:8000/similarity", {
        sentences1: userAnswers,
        sentences2: questions.map((question) => question.Answer),
      })
      .then((response) => {
        const similarityResults = response.data.similarity_results;

        const correctAnswers = similarityResults.filter((result) => result.status === "Correct").length;
        const totalEasyQuestions = questions.filter((question) => question.Difficulty === "Easy").length;
        const totalMediumQuestions = questions.filter((question) => question.Difficulty === "Medium").length;
        const totalHardQuestions = questions.filter((question) => question.Difficulty === "Hard").length;
        const correctEasyQuestions = similarityResults.filter((result, index) => questions[index].Difficulty === "Easy" && result.status === "Correct").length;
        const correctMediumQuestions = similarityResults.filter((result, index) => questions[index].Difficulty === "Medium" && result.status === "Correct").length;
        const correctHardQuestions = similarityResults.filter((result, index) => questions[index].Difficulty === "Hard" && result.status === "Correct").length;
        const topics = {};

        similarityResults.forEach((result, index) => {
          const topic = questions[index].Topic;
          const isCorrect = result.status === "Correct";

          if (!topics.hasOwnProperty(topic)) {
            // Initialize the topic object if it doesn't exist
            topics[topic] = {
              totalQuestions: 0,
              totalCorrectAnswers: 0,
            };
          }

          topics[topic].totalQuestions++;
          if (isCorrect) {
            topics[topic].totalCorrectAnswers++;
          }
        });

        const Language = "Java";
        const resultData = {
          totalQuestions: questions.length,
          Language,
          correctAnswers,
          totalEasyQuestions,
          correctEasyQuestions,
          totalMediumQuestions,
          correctMediumQuestions,
          totalHardQuestions,
          correctHardQuestions,
          topics
        };

        setResultData(resultData);
        const correctQuestions = similarityResults.filter((result, index) => questions[index] && result.status === "Correct");
        const correctQuestionData = correctQuestions.map((question) => {
          console.log("Question:", question); // Check the question object
          return questions[question.index].Question; // Retrieve the question text only
        });
        console.log("Correct Question Data:", correctQuestionData);
        const uemail = user.email;
        axios
          .post("http://localhost:8000/store-correct-questions", {
            email: uemail,
            questions: correctQuestionData,
            language: "Java",
          })
          .then((response) => {
            console.log("Correct questions stored successfully in the backend:", response.data);
          })
          .catch((error) => {
            console.error("Error storing correct questions in the backend:", error);
          });

        navigate("/result", {
          state: {
            resultData,
          },
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const femail = user.email;
  const quizStart = () => {
    axios
      .post("http://localhost:8000/jquestions", {
        email: femail,
        language: "Java",
      })
      .then((response) => response.data)
      .then((data) => {
        const randomQuestions = [];
        while (randomQuestions.length < 10) {
          const randomQuestion =
            data.questions[Math.floor(Math.random() * data.questions.length)];
          if (!randomQuestions.includes(randomQuestion)) {
            randomQuestions.push(randomQuestion);
          }
        }
        setQuestions(randomQuestions);
        setUserAnswers(new Array(10).fill(""));
        console.log("Skipped questions count:", data.skipped_count);
      })
      .catch((error) => console.error(error));
  };


  const handleSubmit = () => {
    if (questionIndex === questions.length - 1) {
      setUserAnswers((prevUserAnswers) => {
        const newUserAnswers = [...prevUserAnswers];
        newUserAnswers[questionIndex] = userAnswers[questionIndex]; // Update user's answer for the last question
        return newUserAnswers;
      });
      compareLists();
    } else {
      setQuestionIndex(questions.length - 1);
    }
  };




  const currentQuestion = questions[questionIndex];
  const isLastQuestion = questionIndex === questions.length - 1;
  const difficultyColor = currentQuestion ? {
    Easy: '#4caf50',
    Medium: '#fbc02d',
    Hard: '#f44336',
  }[currentQuestion.Difficulty] : '';
  const getDifficultyIcon = () => {
    if (currentQuestion) {
      switch (currentQuestion.Difficulty) {
        case "Easy":
          // return <FaCheckCircle />;
          return <FaCircle />;
        case "Medium":
          return <FaSquare/>;
        case "Hard":
          return <FaExclamationTriangle/>;
        default:
          return null;
      }
    }
  };
  
  return (
    <div className="container1">
      <h1>Java Quiz</h1>
      {questions.length === 0 ? (
        <button className="generate-btn" onClick={quizStart}>
          Start Quiz
        </button>
      ) : (
        <>
          <div className="question-container">
            <div className="difficulty" style={{ backgroundColor: difficultyColor }}>
              {getDifficultyIcon()} {currentQuestion.Difficulty}
            </div>
            <p className="question">
              {questionIndex + 1}.{currentQuestion.Question}
            </p>
            <div className={`listening ${isListening ? "" : "disabled"}`}>
              <FaMicrophone className="microphone-icon" />
              <p>Listening...</p>
            </div>
            <button
              className={`answer-btn ${!currentQuestion || userAnswers[questionIndex] === "Skipped" ? "disabled" : ""}`}
              onClick={handleListen}
              disabled={!currentQuestion || userAnswers[questionIndex] === "Skipped"}
            >
              Speak your answer
            </button>
            <p>Note:Speak properly</p>
            <div className="answer-edit">
              <p className="answerp">Answer:</p>
              <input
                type="text"
                value={userAnswers[questionIndex]}
                onChange={handleEditAnswer}
                disabled={!currentQuestion || userAnswers[questionIndex] === "Skipped"}
              />
            </div>
            {/* <p className="answer">Correct answer: {currentQuestion.Answer}</p> */}
          </div>
          <div className="button-group">
            <button
              className="previous-btn"
              onClick={handlePreviousQuestion}
              disabled={questionIndex === 0}
            >
              <FaArrowLeft />
              Previous
            </button>
            <button
              className="skip-btn"
              onClick={handleSkipQuestion}
              disabled={isLastQuestion}
            >
              Skip
              <FaStepForward />
            </button>
            <button
              className="next-btn"
              onClick={handleNextQuestion}
              disabled={isLastQuestion}
            >
              Next
              <FaArrowRight />
            </button>
          </div>
          {isLastQuestion && (
            <>
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Java;

