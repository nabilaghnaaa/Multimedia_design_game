import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './LandingPage.css';

import welcomeBg from '../assets/welcome/welcome-bg.png';
import welcomeLogo from '../assets/welcome/welcome-logo.png';
import welcomeBoard from '../assets/welcome/welcome-board.png';
import welcomeButton from '../assets/welcome/welcome-button.png';
import welcomeCar from '../assets/welcome/welcome-car.png';

const LandingPage = () => {
  const navigate = useNavigate();

  const [showLogo, setShowLogo] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const [showBoard, setShowBoard] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-no-scroll');

    const timers = [
      setTimeout(() => setShowLogo(true), 100),
      setTimeout(() => setShowCar(true), 350),
      setTimeout(() => setShowBoard(true), 600),
      setTimeout(() => setShowButton(true), 800),
    ];

    return () => {
      timers.forEach(clearTimeout);
      document.body.classList.remove('landing-no-scroll');
    };
  }, []);

  const handleStartGame = () => {
    const savedUnlocked = localStorage.getItem('unlockedLevels');
    const savedCompleted = localStorage.getItem('completedLevels');

    if (!savedUnlocked) {
      localStorage.setItem('unlockedLevels', JSON.stringify([1]));
    }

    if (!savedCompleted) {
      localStorage.setItem('completedLevels', JSON.stringify([]));
    }

    axios
      .post('http://localhost:5000/api/progress/start')
      .then((response) => {
        if (response?.data?.session_id) {
          localStorage.setItem('sessionId', response.data.session_id);
        }
      })
      .catch((error) => {
        console.error('Backend progress tidak aktif, lanjut pakai localStorage:', error);
      });

    navigate('/stage-select');
  };

  return (
    <main className="welcome-page">
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
        className={`welcome-logo ${showLogo ? 'show' : ''}`}
        draggable="false"
      />

      <img
        src={welcomeCar}
        alt="Karakter Traffic Sign Adventure"
        className={`welcome-car ${showCar ? 'show' : ''}`}
        draggable="false"
      />

      <img
        src={welcomeBoard}
        alt="Selamat datang, Petualang Cilik"
        className={`welcome-board ${showBoard ? 'show' : ''}`}
        draggable="false"
      />

      <button
        type="button"
        onClick={handleStartGame}
        className={`welcome-start-button ${showButton ? 'show' : ''}`}
        aria-label="Mulai Petualangan"
      >
        <img
          src={welcomeButton}
          alt="Mulai Petualangan"
          draggable="false"
        />
      </button>
    </main>
  );
};

export default LandingPage;