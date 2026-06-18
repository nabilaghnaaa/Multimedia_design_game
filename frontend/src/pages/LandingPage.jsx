import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import "./LandingPage.css";

import welcomeBg from "../assets/welcome/welcome-bg.png";
import welcomeLogo from "../assets/welcome/welcome-logo.png";
import welcomeBoard from "../assets/welcome/welcome-board.png";
import welcomeButton from "../assets/welcome/welcome-button.png";
import welcomeCar from "../assets/welcome/welcome-car.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";

const LandingPage = () => {
  const navigate = useNavigate();

  const backsoundAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);

  const [showLogo, setShowLogo] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const playButtonClick = () => {
    if (!buttonClickAudioRef.current) return;

    buttonClickAudioRef.current.pause();
    buttonClickAudioRef.current.currentTime = 0;

    buttonClickAudioRef.current.play().catch((error) => {
      console.warn("Sound button gagal diputar:", error);
    });
  };

  const startBacksound = () => {
    if (!backsoundAudioRef.current) return;

    backsoundAudioRef.current.volume = 0.35;
    backsoundAudioRef.current.loop = true;
    backsoundAudioRef.current.muted = false;

    backsoundAudioRef.current.play().catch((error) => {
      console.warn("Backsound belum bisa autoplay sebelum user klik:", error);
    });
  };

  useEffect(() => {
    document.body.classList.add("landing-no-scroll");

    const timers = [
      setTimeout(() => setShowLogo(true), 100),
      setTimeout(() => setShowCar(true), 350),
      setTimeout(() => setShowBoard(true), 600),
      setTimeout(() => setShowButton(true), 800),
    ];

    const audio = backsoundAudioRef.current;

    if (audio) {
      audio.volume = 0.35;
      audio.loop = true;
      audio.muted = false;

      audio.play().catch((error) => {
        console.warn(
          "Browser memblokir autoplay backsound. Musik akan aktif setelah user klik halaman:",
          error
        );
      });
    }

    const unlockAudio = () => {
      startBacksound();
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      timers.forEach(clearTimeout);
      document.body.classList.remove("landing-no-scroll");

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.pause();
        backsoundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleStartGame = () => {
    playButtonClick();
    startBacksound();

    const savedUnlocked = localStorage.getItem("unlockedLevels");
    const savedCompleted = localStorage.getItem("completedLevels");

    if (!savedUnlocked) {
      localStorage.setItem("unlockedLevels", JSON.stringify([1]));
    }

    if (!savedCompleted) {
      localStorage.setItem("completedLevels", JSON.stringify([]));
    }

    axios
      .post("http://localhost:5000/api/progress/start")
      .then((response) => {
        if (response?.data?.session_id) {
          localStorage.setItem("sessionId", response.data.session_id);
        }
      })
      .catch((error) => {
        console.error(
          "Backend progress tidak aktif, lanjut pakai localStorage:",
          error
        );
      });

    setTimeout(() => {
      navigate("/stage-select");
    }, 180);
  };

  return (
    <main className="welcome-page" onClick={startBacksound}>
      <audio
        ref={backsoundAudioRef}
        src={backsoundMusic}
        preload="auto"
        loop
        autoPlay
      />

      <audio
        ref={buttonClickAudioRef}
        src={buttonClickSound}
        preload="auto"
      />

      <img
        src={welcomeBg}
        alt="Background Traffic Sign Adventure"
        className="welcome-bg"
        draggable="false"
      />

      <div className="welcome-soft-overlay" />

      <img
        src={welcomeLogo}
        alt="Traffic Sign Adventure"
        className={`welcome-logo ${showLogo ? "show" : ""}`}
        draggable="false"
      />

      <img
        src={welcomeCar}
        alt="Karakter Traffic Sign Adventure"
        className={`welcome-car ${showCar ? "show" : ""}`}
        draggable="false"
      />

      <img
        src={welcomeBoard}
        alt="Selamat datang, Petualang Cilik"
        className={`welcome-board ${showBoard ? "show" : ""}`}
        draggable="false"
      />

      <button
        type="button"
        onClick={handleStartGame}
        className={`welcome-start-button ${showButton ? "show" : ""}`}
        aria-label="Mulai Petualangan"
      >
        <img src={welcomeButton} alt="Mulai Petualangan" draggable="false" />
      </button>
    </main>
  );
};

export default LandingPage;