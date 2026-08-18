import React, { useEffect, useState } from "react";
import axios from "axios";
import Result from "../components/Result";
import "./Home.css";
import boy1 from "../assets/Boy/boy1.png";
import loc from "../assets/Location/location.webp";

const API_URL = "https://resume-backend-cgfh.onrender.com";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [data, setData] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN STATES
  // =========================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // =========================
  // REGISTER STATES
  // =========================

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerError, setRegisterError] = useState("");

  // =========================
  // CHECK LOGIN
  // =========================

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // =========================
  // UPLOAD BUTTON
  // =========================

  const handleUploadClick = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setShowLogin(true);
      setShowRegister(false);

      setLoginError("");
      setEmail("");
      setPassword("");

      return;
    }

    setShowUploadModal(true);
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoginError("");

    if (!email || !password) {
      setLoginError("Please fill all fields");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email: email.trim().toLowerCase(),
          password,
        }
      );

      console.log("LOGIN RESPONSE:", res.data);

      // =========================
      // SAVE JWT
      // =========================

      localStorage.setItem("token", res.data.token);

      setIsLoggedIn(true);

      // =========================
      // CLEAR LOGIN FIELDS
      // =========================

      setEmail("");
      setPassword("");
      setLoginError("");

      // =========================
      // CLOSE LOGIN
      // =========================

      setShowLogin(false);

      // =========================
      // OPEN UPLOAD
      // =========================

      setShowUploadModal(true);

    } catch (error) {
      console.error("LOGIN ERROR:", error);

      setLoginError(
        error.response?.data?.message ||
          "Invalid email or password"
      );
    }
  };

  // =========================
  // REGISTER
  // =========================

  const handleRegister = async (e) => {
    e.preventDefault();

    setRegisterError("");

    if (!registerEmail || !registerPassword) {
      setRegisterError("Please fill all fields");
      return;
    }

    if (!registerEmail.includes("@")) {
      setRegisterError("Please enter a valid email");
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          email: registerEmail.trim().toLowerCase(),
          password: registerPassword,
        }
      );

      console.log("REGISTER RESPONSE:", res.data);

      // =========================
      // IMPORTANT
      // =========================
      // Register ke baad:
      // - JWT save nahi karna
      // - isLoggedIn true nahi karna
      // - upload open nahi karna
      //
      // User ko manually login karna hoga.

      const registeredEmail =
        registerEmail.trim().toLowerCase();

      // =========================
      // CLEAR REGISTER FIELDS
      // =========================

      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterError("");

      // =========================
      // PUT REGISTERED EMAIL
      // INTO LOGIN FIELD
      // =========================

      setEmail(registeredEmail);
      setPassword("");

      // =========================
      // CLOSE REGISTER
      // =========================

      setShowRegister(false);

      // =========================
      // OPEN LOGIN
      // =========================

      setShowLogin(true);

      // Make sure login error is empty
      setLoginError("");

    } catch (error) {
      console.error("REGISTER ERROR:", error);

      setRegisterError(
        error.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  // =========================
  // ANALYZE RESUME
  // =========================

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select resume first");
      return;
    }

    const token = localStorage.getItem("token");

    // =========================
    // NO TOKEN
    // =========================

    if (!token) {
      setShowUploadModal(false);
      setShowLogin(true);
      setLoginError("");
      return;
    }

    const formData = new FormData();

    formData.append("resume", selectedFile);

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_URL}/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);

      setTimeout(() => {
        setData({
          score: res.data.score || 0,
          skills: res.data.skills || [],
          suggestions: res.data.suggestions || [],
          goodPoints: res.data.goodPoints || [],
          fileName: selectedFile.name,
        });

        setShowUploadModal(false);
        setLoading(false);
        setSelectedFile(null);
      }, 2000);

    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      setLoading(false);

      // =========================
      // TOKEN INVALID / EXPIRED
      // =========================

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        localStorage.removeItem("token");

        setIsLoggedIn(false);
        setShowUploadModal(false);
        setShowLogin(true);

        setLoginError(
          "Session expired. Please login again."
        );

        return;
      }

      alert(
        error.response?.data?.message ||
          "Error analysing resume"
      );
    }
  };

  // =========================
  // RESULT
  // =========================

  if (data) {
    return <Result data={data} />;
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>

        <h2>Analyzing your resume...</h2>

        <p>
          Please wait while we scan your resume
        </p>
      </div>
    );
  }

  return (
    <div className="home">

      {/* ================= HERO ================= */}

      <section className="hero">

        <div className="hero-left">

          <h1>Resume analyser</h1>

          <p>
            Improve your resume with our free analysis
            to increase your chances of getting shortlisted
          </p>

          <div className="hero-btns">

            <button
              className="upload-main-btn"
              onClick={handleUploadClick}
            >
              Upload resume
            </button>

          </div>

        </div>

        <div className="hero-right">

          <div className="preview-card">

            <h4>Resume analyser</h4>

            <h3>
              Your resume quality is medium.
            </h3>

            <p>
              Improve it to increase your chances
              of getting shortlisted.
            </p>

            <div className="progress-box">

              <img
                src={loc}
                alt="location"
                className="location"
              />

              <div className="multi-progress">

                <ul>
                  <li>Low</li>
                  <li className="list">Medium</li>
                  <li>High</li>
                  <li>Excellent</li>
                </ul>

              </div>

            </div>

            <div className="feedback-box">

              <h5>What you did well</h5>

              <div className="feedback-cards">

                <div className="mini-card success">
                  Good use of action verbs
                </div>

                <div className="mini-card success">
                  Structured formatting
                </div>

                <div className="mini-card success">
                  No repetition
                </div>

              </div>

            </div>

            <div className="feedback-box">

              <h5>What you can improve</h5>

              <div className="mini-card warning">
                Add more projects and technical skills
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= HOW IT WORKS ================= */}

      <section className="how-it-works">

        <div className="works-card">

          <div className="works-left">

            <h2>How this works</h2>

            <div className="step">
              <span>1</span>

              <p>
                We analyse your resume based on
                10+ important parameters
              </p>
            </div>

            <div className="step">
              <span>2</span>

              <p>
                Our analysis gives you actionable
                feedback to improve your resume
              </p>
            </div>

            <div className="step">
              <span>3</span>

              <p>
                You can upload the improved resume
                to your profile or create a new one
                through our resume service
              </p>
            </div>

          </div>

          <div className="works-right">

            <div className="circle-art">

              <img
                src={boy1}
                alt="boy"
                className="boy1"
              />

            </div>

          </div>

        </div>

        <div className="last-btn">

          <button
            className="upload-main-btnn"
            onClick={handleUploadClick}
          >
            Upload Resume
          </button>

        </div>

      </section>

      {/* ================= LOGIN MODAL ================= */}

      {showLogin && (

        <div className="modal-overlay">

          <button
            className="close-btn"
            onClick={() => {
              setShowLogin(false);
              setLoginError("");
              setEmail("");
              setPassword("");
            }}
          >
            ×
          </button>

          <div className="login-modal">

            <h2>Login to Continue</h2>

            <form onSubmit={handleLogin}>

              <input
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />

              <div className="password-box">

                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

              </div>

              {/* LOGIN ERROR */}

              {loginError && (
                <p className="login-error">
                  {loginError}
                </p>
              )}

              <button type="submit">
                Login
              </button>

            </form>

            <p className="auth-switch">

              Don't have an account?{" "}

              <button
                type="button"
                onClick={() => {
                  setShowLogin(false);
                  setShowRegister(true);

                  setLoginError("");
                  setEmail("");
                  setPassword("");
                }}
              >
                Register
              </button>

            </p>

          </div>

        </div>

      )}

      {/* ================= REGISTER MODAL ================= */}

      {showRegister && (

        <div className="modal-overlay">

          <button
            className="close-btn"
            onClick={() => {
              setShowRegister(false);
              setRegisterError("");
              setRegisterEmail("");
              setRegisterPassword("");
            }}
          >
            ×
          </button>

          {/* SAME CLASS AS LOGIN */}

          <div className="login-modal">

            <h2>Create Account</h2>

            <form onSubmit={handleRegister}>

              <input
                type="email"
                placeholder="Enter Email"
                value={registerEmail}
                onChange={(e) =>
                  setRegisterEmail(e.target.value)
                }
                required
              />

              <input
                type="password"
                placeholder="Create Password"
                value={registerPassword}
                onChange={(e) =>
                  setRegisterPassword(e.target.value)
                }
                required
              />

              {/* REGISTER ERROR */}

              {registerError && (
                <p className="login-error">
                  {registerError}
                </p>
              )}

              <button type="submit">
                Register
              </button>

            </form>

            <p className="auth-switch">

              Already have an account?{" "}

              <button
                type="button"
                onClick={() => {
                  setShowRegister(false);
                  setShowLogin(true);

                  setRegisterError("");
                  setRegisterEmail("");
                  setRegisterPassword("");

                  setLoginError("");
                  setEmail("");
                  setPassword("");
                }}
              >
                Login
              </button>

            </p>

          </div>

        </div>

      )}

      {/* ================= UPLOAD MODAL ================= */}

      {showUploadModal && (

        <div className="modal-overlay">

          <button
            className="close-btn"
            onClick={() => {
              setShowUploadModal(false);
              setSelectedFile(null);
            }}
          >
            ×
          </button>

          <div className="upload-modal">

            <h2>Upload Your Resume</h2>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) =>
                setSelectedFile(
                  e.target.files[0]
                )
              }
            />

            {selectedFile && (
              <p className="file-name">
                Selected File:{" "}
                {selectedFile.name}
              </p>
            )}

            <button
              className="analyze-btn"
              onClick={handleAnalyze}
            >
              Analyze Now
            </button>

          </div>

        </div>

      )}

    </div>
  );
};

export default Home;