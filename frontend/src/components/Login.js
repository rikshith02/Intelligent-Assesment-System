import React, { useState } from 'react';
import { NavLink } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import "./mix.css";
import axios from 'axios';
import Alert from 'react-bootstrap/Alert';

const Login = () => {
    const history = useNavigate();
    const [passShow, setPassShow] = useState(false);
    const [alert, setAlert] = useState(null);

    const [inpval, setInpval] = useState({
        email: "",
        password: "",
    });

    const setVal = (e) => {
        const { name, value } = e.target;

        setInpval((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const loginuser = async (e) => {
        e.preventDefault();

        const { email, password } = inpval;

        if (email === "") {
            showAlert("danger", "Email is required!");
        } else if (!email.includes("@")) {
            showAlert("danger", "Email must include @!");
        } else if (password === "") {
            showAlert("danger", "Password is required!");
        } else if (password.length < 6) {
            showAlert("danger", "Password must be at least 6 characters!");
        } else {
            console.log("user login successfully done");
            try {
                const logData = { email, password };
                const response = await axios.post('http://localhost:8000/login', logData);
                const token = response.data.access_token;
                localStorage.setItem('token', token);
                console.log(response.data.role);
                if (response.data.role === "admin") {
                    history("/Adashboard");
                } else {
                    history("/Dashboard");
                }
                console.log(response.data);
            } catch (error) {
                console.log(error);
                showAlert("danger", "Please Check Login Details!!!");
            }
        }
    };

    const showAlert = (variant, message) => {
        setAlert({ variant, message });

        // Clear the alert after 3 seconds
        setTimeout(() => {
            setAlert(null);
        }, 2000);
    };

    return (
        <>
            {alert && (
                <Alert variant={alert.variant}>{alert.message}</Alert>
            )}
            <section>
                <div className="form_data">
                    <div className="form_heading">
                        <h1>Welcome Back, Log In</h1>
                        <p>Hi, we are glad you are back. Please login.</p>
                    </div>
                    <form>
                        <div className="form_input">
                            <label htmlFor="email">Email</label>
                            <input type="email" value={inpval.email} onChange={setVal} name="email" id="email" placeholder='Enter Your Email Address' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="password">Password</label>
                            <div className="two">
                                <input type={!passShow ? "password" : "text"} onChange={setVal} value={inpval.password} name="password" id="password" placeholder='Enter Your password' />
                                <div className="showpass" onClick={() => setPassShow(!passShow)}>
                                    {!passShow ? "Show" : "Hide"}
                                </div>
                            </div>
                        </div>

                        <button className='btn' onClick={loginuser}>Login</button>
                        <p>Don't have an Account?<NavLink to="/signup">Sign Up</NavLink> </p>
                    </form>
                </div>
            </section>
        </>
    )
}

export default Login;