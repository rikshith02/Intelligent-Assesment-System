import React, { useState } from 'react';
import "./mix.css";
import axios from 'axios';
import { NavLink } from 'react-router-dom';
import Alert from 'react-bootstrap/Alert';

const Register = () => {
    const [passShow, setPassShow] = useState(false);
    const [cpassShow, setCPassShow] = useState(false);
    const [alert, setAlert] = useState(null);

    const [inpval, setInpval] = useState({
        fname: "",
        email: "",
        password: "",
        cpassword: ""
    });

    const setVal = (e) => {
        const { name, value } = e.target;

        setInpval((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const addUserdata = async (e) => {
        e.preventDefault();

        const { fname, email, password, cpassword } = inpval;

        if (fname === "") {
            showAlert("danger", "Name is required!");
        } else if (email === "") {
            showAlert("danger", "Email is required!");
        } else if (!email.includes("@")) {
            showAlert("danger", "Email should include @!");
        } else if (password === "") {
            showAlert("danger", "Password is required!");
        } else if (password.length < 6) {
            showAlert("danger", "Password must be at least 6 characters!");
        } else if (cpassword === "") {
            showAlert("danger", "Confirm Password is required!");
        } else if (cpassword.length < 6) {
            showAlert("danger", "Confirm Password must be at least 6 characters!");
        } else if (password !== cpassword) {
            showAlert("danger", "Password and Confirm Password are not matching!");
        } else {
            showAlert("success", "User registration successfully done!");
            try {
                const userData = { fname, email, password, cpassword };
                const res = await axios.post('http://localhost:8000/signup', userData);
                console.log(res.data);
                showAlert("success", "User registration successfully done!");
            } catch (error) {
                console.log(error);
                showAlert("danger", "An error occurred during user registration.");
            }
            showAlert("success", "User registration successfully done!");
        }
    };

    const showAlert = (variant, message) => {
        setAlert({ variant, message });
        setTimeout(() => {
            setAlert(null);
        }, 1000);
    };

    return (
        <>
            {alert && (
                <Alert variant={alert.variant}>{alert.message}</Alert>
            )}
            <section>
                <div className="form_data">
                    <div className="form_heading">
                        <h1>Sign Up</h1>
                        <p style={{ textAlign: "center" }}>
                            We are glad that you will be using Project Cloud to manage your tasks! We hope that you will like it.
                        </p>
                    </div>
                    <form>
                        <div className="form_input">
                            <label htmlFor="fname">Name</label>
                            <input type="text" onChange={setVal} value={inpval.fname} name="fname" id="fname" placeholder='Enter Your Name' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="email">Email</label>
                            <input type="email" onChange={setVal} value={inpval.email} name="email" id="email" placeholder='Enter Your Email Address' />
                        </div>
                        <div className="form_input">
                            <label htmlFor="password">Password</label>
                            <div className="two">
                                <input type={!passShow ? "password" : "text"} value={inpval.password} onChange={setVal} name="password" id="password" placeholder='Enter Your password' />
                                <div className="showpass" onClick={() => setPassShow(!passShow)}>
                                    {!passShow ? "Show" : "Hide"}
                                </div> 
                            </div>
                        </div>
                        <div className="form_input">
                            <label htmlFor="password">Confirm Password</label>
                            <div className="two">
                                <input type={!cpassShow ? "password" : "text"} value={inpval.cpassword} onChange={setVal} name="cpassword" id="cpassword" placeholder='Confirm password' />
                                <div className="showpass" onClick={() => setCPassShow(!cpassShow)}>
                                    {!cpassShow ? "Show" : "Hide"}
                                </div>
                            </div>
                        </div>

                        <button className='btn' onClick={addUserdata}>Sign Up</button>
                        <p>Already have an Account?<NavLink to="/">Login</NavLink> </p>
                    </form>
                </div>
            </section>
        </>
    );
};

export default Register;
