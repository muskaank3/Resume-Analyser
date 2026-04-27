import React, { useEffect, useState } from "react";
import axios from "axios";
import Result from "../components/Result";
import "./Home.css";
import boy1 from "../assets/Boy/boy1.png";
import loc from "../assets/Location/location.webp";

const Home = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // LOGIN STATES
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // localStorage se login yaad rahe
  useEffect(() => {
    const savedLogin = localStorage.getItem("isLoggedIn");

    if (savedLogin === "true") {
      setIsLoggedIn(true);
    }
  }, []);

  const handleUploadClick = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
    } else {
      setShowUploadModal(true);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setLoginError("Please fill all fields");
      return;
    }

    if (!email.includes("@")) {
      setLoginError("Please enter valid email");
      return;
    }

    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters");
      return;
    }

    setLoginError("");
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");

    setShowLogin(false);
    setShowUploadModal(true);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert("Please select resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", selectedFile);

    try {
      setLoading(true);

      const res = await axios.post(
        "https://resume-backend-cgfh.onrender.com",
        formData
      );

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
      }, 2000);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Error analysing resume");
    }
  };

  if (data) {
    return <Result data={data} />;
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <h2>Analyzing your resume...</h2>
        <p>Please wait while we scan your resume</p>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-left">
          <h1>Resume analyser</h1>

          <p>
            Improve your resume with our free analysis to increase your chances
            of getting shortlisted
          </p>

          <div className="hero-btns">
            <button className="upload-main-btn" onClick={handleUploadClick}>
              Upload resume
            </button>
          </div>
        </div>

        <div className="hero-right">
          <div className="preview-card">
            <h4>Resume analyser</h4>
            <h3>Your resume quality is medium.</h3>

            <p>
              Improve it to increase your chances of getting shortlisted.
            </p>

            <div className="progress-box">
              <img src={loc} alt="location" className="location" />

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
                <div className="mini-card success">Good use of action verbs</div>
                <div className="mini-card success">Structured formatting</div>
                <div className="mini-card success">No repetition</div>
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

      <section className="how-it-works">
        <div className="works-card">
          <div className="works-left">
            <h2>How this works</h2>

            <div className="step">
              <span>1</span>
              <p>We analyse your resume based on 10+ important parameters</p>
            </div>

            <div className="step">
              <span>2</span>
              <p>
                Our analysis gives you actionable feedback to improve your
                resume
              </p>
            </div>

            <div className="step">
              <span>3</span>
              <p>
                You can upload the improved resume to your profile or create a
                new one through our resume service
              </p>
            </div>
          </div>

          <div className="works-right">
            <div className="circle-art">
              <img src={boy1} alt="boy" className="boy1" />
            </div>
          </div>
        </div>

        <div className="last-btn">
          <button className="upload-main-btnn" onClick={handleUploadClick}>
            Upload Resume
          </button>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="modal-overlay">
          <button
            className="close-btn"
            onClick={() => {
              setShowLogin(false);
              setLoginError("");
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
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="password-box">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

              
              </div>

              {loginError && (
                <p className="login-error">{loginError}</p>
              )}

              <button type="submit">Login</button>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="modal-overlay">
          <button
            className="close-btn"
            onClick={() => setShowUploadModal(false)}
          >
            ×
          </button>

          <div className="upload-modal">
            <h2>Upload Your Resume</h2>

            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />

            {selectedFile && (
              <p className="file-name">
                Selected File: {selectedFile.name}
              </p>
            )}

            <button className="analyze-btn" onClick={handleAnalyze}>
              Analyze Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;