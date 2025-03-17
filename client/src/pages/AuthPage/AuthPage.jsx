import React, { useEffect, useState } from "react";
import "./AuthPage.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { refresh } from "../../redux/loading.slice.js";
import axios from "axios";
import { toast } from "react-toastify";
import ClipLoader from "react-spinners/ClipLoader";
import baseUrl from "../../utils/baseUrl.js";
const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.loading.status);
  const userExist = useSelector((state) => state.user.value);
  const [usernameORemail, setUsernameORemail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [passwordr, setPasswordr] = useState("");
  const [email, setEmail] = useState("");
  const userLogIn = async (e) => {
    e.preventDefault();
    if (usernameORemail === "") {
      return toast("please enter username...");
    }
    if (password === "") {
      return toast("please enter password...");
    }
    try {
      const res = await axios.post(
        `${baseUrl}/user/auth/login`,

        {
          usernameORemail,
          password,
        },
        {
          withCredentials: true,
        }
      );
      dispatch(refresh());
      navigate("/home");
      // window.localStorage.setItem("userId", res.data.data.user._id);
    } catch (error) {
      console.log(error);
      toast("incorrect username or password...");
    }
  };

  const userRegistration = async (e) => {
    e.preventDefault();
    const inCompleteDetail = [fullname, username, email, passwordr].some(
      (element) => {
        return element === null || element.trim() === "";
      }
    );
    if (inCompleteDetail) {
      return toast("incomplete details..");
    }
    try {
      const res = await axios.post(`${baseUrl}/user/auth/register`, {
        fullname,
        username,
        email,
        password: passwordr,
      });
      if (res) {
        toast("user register successfully.");
        setFullname("");
        setUsername("");
        setEmail("");
        setPasswordr("");
        setIsLogin(!isLogin);
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (userExist && !loading) {
      navigate("/home");
    }
  }, [userExist]);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return (
    <>
      <div
        className="nv"
        style={{
          textAlign: "center",
          fontSize: "20px",
          fontWeight: "600",
          padding: "1rem ",
          backgroundColor: "#007bff",
          color: "#fff",
        }}
      >
        ChatBuddy
      </div>
      <div className={`auth-page ${isLogin ? "login-mode" : "signup-mode"}`}>
        <div className="text-section">
          <h1>{isLogin ? "Welcome Back!" : "Join Us!"}</h1>
          <p>
            {isLogin
              ? "Log in to continue exploring our ChatBuddy."
              : "Sign up and start your journey with us!"}
          </p>
          <button onClick={toggleForm} className="toggle-button">
            {isLogin ? "Sign Up" : "Login"}
          </button>
        </div>
        <div className="form-section">
          <div className="form-container">
            {isLogin ? (
              <form className="login-form">
                <h2>Login</h2>
                <input
                  type="email"
                  placeholder="Email/username"
                  value={usernameORemail}
                  onChange={(e) => setUsernameORemail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="submit"
                  className="submit-button"
                  onClick={(e) => userLogIn(e)}
                >
                  Login
                </button>
              </form>
            ) : (
              <form className="signup-form">
                <h2>Sign Up</h2>
                <input
                  type="text"
                  placeholder="fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <input
                  type="email"
                  placeholder="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="password"
                  value={passwordr}
                  onChange={(e) => setPasswordr(e.target.value)}
                />
                <button
                  type="submit"
                  className="submit-button"
                  onClick={(e) => userRegistration(e)}
                >
                  Sign Up
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthPage;
