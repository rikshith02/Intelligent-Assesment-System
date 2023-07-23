import React  from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Error from './components/Error';
import Adashboard from './components/Adashboard';
import Java from './components/Java';
import Python from './components/Python';
import Upload from './components/Upload';
import Userupload from './components/Userupload';
import User from './components/User';
import Profile from './components/Profile';
import Result from './components/Result';
import Grades from './components/Grades';
import Analysis from './components/Analysis';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/Adashboard" element={<Adashboard />} />
          <Route path="/java" element={<Java />} />
          <Route path="/python" element={<Python />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/userupload" element={<Userupload />} />
          <Route path="/user" element={<User />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/result" element={<Result />} />
          <Route path="/grade" element={<Grades />} />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </Router>
  );
}

export default App;