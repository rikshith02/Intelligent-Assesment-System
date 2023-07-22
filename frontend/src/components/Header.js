import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Alert from 'react-bootstrap/Alert';

const Header = () => {
  const [alert, setAlert] = useState(null);
  const history = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
   
    axios
      .post('http://localhost:8000/logout', null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(response => {
        if (response.status === 200) {
          localStorage.removeItem('token');
          showAlert("success", "Logout Successful !!!");
          history('/');
        } else {
          console.log('Logout failed');
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  };

  const handleHome = () => {
    axios
      .get('http://localhost:8000/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          token: token
        }
      })
      .then(response => {
        const { role } = response.data;
        if (role === 'admin') {
          history('/Adashboard');
        } else {
          history('/Dashboard');
        }
      })
      .catch(error => {
        console.log('Error:', error);
      });
  };


  const showAlert = (variant, message) => {
    setAlert({ variant, message });

    // Clear the alert after 3 seconds
    setTimeout(() => {
        setAlert(null);
    }, 1000);
};

  return (
    <>
      <header>
        <Navbar bg="light" variant="light" expand="lg">
          <Container>
            <Navbar.Brand>
              Assessment System
            </Navbar.Brand>
            {token ? (
              <>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link onClick={handleHome} to="/home">
                      Home
                    </Nav.Link>
                    <Nav.Link>
                      Features
                    </Nav.Link>
                  </Nav>
                  <Nav>
                    <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
                  </Nav>
                </Navbar.Collapse>
              </>
            ) : null}
          </Container>
        </Navbar>
      </header>
      {alert && (
        <Alert variant={alert.variant}>{alert.message}</Alert>
      )}
    </>
  );
};

export default Header;
