import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./StageSelectPage.css";

import stageBg from "../assets/stage-select/stage-bg.png";
import stage1Board from "../assets/stage-select/stage-1.png";
import stage2LockedBoard from "../assets/stage-select/stage-2-locked.png";
import stage2UnlockedBoard from "../assets/stage-select/stage-2-unlocked.png";
import stageLockedPopup from "../assets/stage-select/stage-locked-popup.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";

const StageSelectPage = () => {
  const navigate = useNavigate();

  const backsoundAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);

  const [isStage2Unlocked, setIsStage2Unlocked] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [showLockedPopup, setShowLockedPopup] = useState(false);

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
    document.body.classList.add("stage-select-no-scroll");

    const completedLevels = JSON.parse(
      localStorage.getItem("completedLevels") || "[]"
    );

    const stage1Finished = [1, 2, 3, 4, 5].every((level) =>
      completedLevels.includes(level)
    );

    setIsStage2Unlocked(stage1Finished);

    const timer = setTimeout(() => {
      setShowPage(true);
    }, 0);

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
      clearTimeout(timer);
      document.body.classList.remove("stage-select-no-scroll");

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.pause();
        backsoundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleStage1Click = () => {
    playButtonClick();
    startBacksound();

    localStorage.setItem("selectedStage", "1");

    if (!localStorage.getItem("completedLevels")) {
      localStorage.setItem("completedLevels", JSON.stringify([]));
    }

    if (!localStorage.getItem("unlockedLevels")) {
      localStorage.setItem("unlockedLevels", JSON.stringify([1]));
    }

    setTimeout(() => {
      navigate("/stage1-select");
    }, 160);
  };

  const handleStage2Click = () => {
    playButtonClick();
    startBacksound();

    if (!isStage2Unlocked) {
      setShowLockedPopup(true);

      setTimeout(() => {
        setShowLockedPopup(false);
      }, 2200);

      return;
    }

    localStorage.setItem("selectedStage", "2");

    const unlockedLevels = JSON.parse(
      localStorage.getItem("unlockedLevels") || "[1]"
    );

    if (!unlockedLevels.includes(6)) {
      localStorage.setItem(
        "unlockedLevels",
        JSON.stringify([...unlockedLevels, 6])
      );
    }

    setTimeout(() => {
      navigate("/map");
    }, 160);
  };

  const handleBackToHome = () => {
    playButtonClick();
    startBacksound();

    setTimeout(() => {
      navigate("/");
    }, 160);
  };

  const handleCloseLockedPopup = () => {
    playButtonClick();
    startBacksound();
    setShowLockedPopup(false);
  };

  return (
    <main className={`stage-select-page ${showPage ? "show" : ""}`}>
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
        src={stageBg}
        alt="Background Pilih Stage"
        className="stage-select-bg"
        draggable="false"
      />

      <button
        type="button"
        className="stage-board-button stage-board-1"
        onClick={handleStage1Click}
        aria-label="Pilih Stage 1 Rambu Peringatan"
      >
        <img
          src={stage1Board}
          alt="Stage 1 Rambu Peringatan"
          draggable="false"
        />
      </button>

      <button
        type="button"
        className={`stage-board-button stage-board-2 ${
          isStage2Unlocked ? "unlocked" : "locked"
        }`}
        onClick={handleStage2Click}
        aria-label="Pilih Stage 2 Rambu Larangan"
      >
        <img
          src={isStage2Unlocked ? stage2UnlockedBoard : stage2LockedBoard}
          alt={
            isStage2Unlocked
              ? "Stage 2 Rambu Larangan"
              : "Stage 2 Rambu Larangan Terkunci"
          }
          draggable="false"
        />
      </button>

      <button
        type="button"
        className="stage-back-button"
        onClick={handleBackToHome}
      >
        ← Beranda
      </button>

      {showLockedPopup && (
        <div className="stage-popup-overlay" onClick={handleCloseLockedPopup}>
          <img
            src={stageLockedPopup}
            alt="Stage 2 masih terkunci"
            className="stage-locked-popup"
            draggable="false"
          />
        </div>
      )}
    </main>
  );
};

export default StageSelectPage;