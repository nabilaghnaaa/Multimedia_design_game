import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationLevel4.css";

import level4Bg from "../assets/simulation/stage1/level4/level4-bg.png";
import boyRiderBack from "../assets/simulation/stage1/level4/boy-rider-back.png";
import crashCarMotor from "../assets/simulation/stage1/level4/crash-car-motor.png";
import carBlack from "../assets/simulation/stage1/level4/car-black.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleGoodRight from "../assets/simulation/stage1/level1/bubble-good-right.png";
import bubbleWarningLeft from "../assets/simulation/stage1/level1/bubble-warning-left.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hormSound from "../assets/sounds/horm.mp3";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

const BACKSOUND_NORMAL_VOLUME = 0.18;
const BACKSOUND_DUCK_VOLUME = 0.06;

export default function SimulationLevel4() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const restoreBacksoundTimerRef = useRef(null);

  const backsoundAudioRef = useRef(null);
  const buttonClickAudioRef = useRef(null);
  const correctCringAudioRef = useRef(null);
  const crashAudioRef = useRef(null);
  const hormAudioRef = useRef(null);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startScene, setStartScene] = useState(false);
  const [showRider, setShowRider] = useState(false);
  const [showCar, setShowCar] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const startBacksound = () => {
    if (!backsoundAudioRef.current) return;

    backsoundAudioRef.current.volume = BACKSOUND_NORMAL_VOLUME;
    backsoundAudioRef.current.loop = true;
    backsoundAudioRef.current.muted = false;

    backsoundAudioRef.current.play().catch((error) => {
      console.warn("Backsound belum bisa autoplay sebelum user klik:", error);
    });
  };

  const duckBacksound = (duration = 900) => {
    if (!backsoundAudioRef.current) return;

    if (restoreBacksoundTimerRef.current) {
      clearTimeout(restoreBacksoundTimerRef.current);
      restoreBacksoundTimerRef.current = null;
    }

    backsoundAudioRef.current.volume = BACKSOUND_DUCK_VOLUME;

    restoreBacksoundTimerRef.current = setTimeout(() => {
      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.volume = BACKSOUND_NORMAL_VOLUME;
      }
    }, duration);
  };

  const playSound = (audioRef, volume = 1, duckDuration = 900) => {
    if (!audioRef.current) return;

    duckBacksound(duckDuration);

    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.volume = volume;

    audioRef.current.play().catch((error) => {
      console.warn("Sound gagal diputar:", error);
    });
  };

  const safeParseArray = (key, fallback) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return fallback;

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return fallback;

      return parsed
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item));
    } catch (error) {
      console.error(`Gagal membaca ${key}:`, error);
      return fallback;
    }
  };

  const saveLevel4Progress = () => {
    try {
      const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const progressCompletedLevels = Array.isArray(progress.completedLevels)
        ? progress.completedLevels
            .map((item) => Number(item))
            .filter((item) => Number.isFinite(item))
        : [];

      const savedCompletedLevels = safeParseArray("completedLevels", []);
      const savedUnlockedLevels = safeParseArray("unlockedLevels", [1]);

      const updatedCompletedLevels = [
        ...new Set([
          ...progressCompletedLevels,
          ...savedCompletedLevels,
          1,
          2,
          3,
          4,
        ]),
      ].sort((a, b) => a - b);

      const updatedUnlockedLevels = [
        ...new Set([...savedUnlockedLevels, 1, 2, 3, 4, 5]),
      ].sort((a, b) => a - b);

      localStorage.setItem(
        STAGE1_PROGRESS_KEY,
        JSON.stringify({
          ...progress,
          unlockedLevel: 5,
          completedLevels: updatedCompletedLevels,
        })
      );

      localStorage.setItem(
        "unlockedLevels",
        JSON.stringify(updatedUnlockedLevels)
      );

      localStorage.setItem(
        "completedLevels",
        JSON.stringify(updatedCompletedLevels)
      );

      localStorage.setItem("selectedStage", "1");
      localStorage.setItem("selectedLevel", "5");
    } catch (error) {
      console.error("Gagal menyimpan progress level 4:", error);
    }
  };

  const startLevel = () => {
    clearTimers();
    startBacksound();

    setRestartKey((prevKey) => prevKey + 1);
    setPhase(PHASE.INTRO);
    setStartScene(false);
    setShowRider(false);
    setShowCar(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartScene(true);
        setShowRider(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setShowCar(true);
      }, 2450)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 4100)
    );
  };

  useEffect(() => {
    startLevel();

    const unlockAudio = () => {
      startBacksound();
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("touchstart", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      clearTimers();

      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);

      if (restoreBacksoundTimerRef.current) {
        clearTimeout(restoreBacksoundTimerRef.current);
      }

      if (backsoundAudioRef.current) {
        backsoundAudioRef.current.pause();
        backsoundAudioRef.current.currentTime = 0;
      }
    };
  }, []);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);
    playSound(hormAudioRef, 1, 1000);

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(crashAudioRef, 1, 1600);
        setPhase(PHASE.WRONG_RESULT);
      }, 1550)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);

    setAnswerLocked(true);
    saveLevel4Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef, 1, 1300);
        setPhase(PHASE.CORRECT_RESULT);
      }, 3600)
    );
  };

  const handleRetry = () => {
    playSound(buttonClickAudioRef, 1, 450);
    startLevel();
  };

  const handleBack = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/stage1-select");
    }, 160);
  };

  const handleFinish = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/simulation/5");
    }, 160);
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const isResultPhase = isWrongResult || isCorrectResult;

  return (
    <main className="simulation-level4-page" onClick={startBacksound}>
      <audio
        ref={backsoundAudioRef}
        src={backsoundMusic}
        preload="auto"
        loop
        autoPlay
      />

      <audio ref={buttonClickAudioRef} src={buttonClickSound} preload="auto" />
      <audio ref={correctCringAudioRef} src={correctCringSound} preload="auto" />
      <audio ref={crashAudioRef} src={crashSound} preload="auto" />
      <audio ref={hormAudioRef} src={hormSound} preload="auto" />

      <button type="button" className="level4-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="level4-badge">
        <span>LEVEL 4</span>
        <strong>Peringatan Persimpangan</strong>
      </div>

      <section key={restartKey} className="level4-viewport">
        <div
          className={`level4-bg-world ${
            startScene ? "level4-bg-world--move" : ""
          }`}
        >
          <img
            src={level4Bg}
            alt="Background persimpangan"
            className="level4-bg"
            draggable="false"
          />
        </div>

        <div className="level4-actors-layer">
          {showRider && !isResultPhase && (
            <img
              src={boyRiderBack}
              alt="Pengendara motor cowok"
              className={`level4-actor level4-rider ${
                startScene ? "level4-rider--enter" : ""
              } ${isQuestion ? "level4-rider--stop" : ""} ${
                isWrongMove ? "level4-rider--wrong-go" : ""
              } ${isCorrectMove ? "level4-rider--correct-wait-go" : ""}`}
              draggable="false"
            />
          )}

          {showCar && !isResultPhase && (
            <img
              src={carBlack}
              alt="Mobil hitam"
              className={`level4-actor level4-car ${
                showCar ? "level4-car--enter" : ""
              } ${isQuestion ? "level4-car--stop" : ""} ${
                isWrongMove ? "level4-car--wrong-hit" : ""
              } ${isCorrectMove ? "level4-car--correct-pass" : ""}`}
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="level4-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="level4-bubble-img"
                  draggable="false"
                />

                <p>
                  Wah, ada rambu persimpangan
                  <br />
                  di depan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="level4-answer-wrapper">
                <button
                  type="button"
                  className="level4-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Pelan-pelan dan perhatikan kendaraan lain
                </button>

                <button
                  type="button"
                  className="level4-answer-button"
                  onClick={handleWrongAnswer}
                >
                  Tetap jalan tanpa melihat kanan kiri
                </button>
              </div>
            </>
          )}

          {isWrongResult && (
            <>
              <div className="level4-result-dim level4-result-dim--wrong" />

              <img
                src={crashCarMotor}
                alt="Tabrakan mobil dan motor"
                className="level4-actor level4-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="level4-actor level4-police level4-police--stop"
                draggable="false"
              />

              <div className="level4-result-bubble level4-result-bubble--warning">
                <img
                  src={bubbleWarningLeft}
                  alt=""
                  className="level4-result-bubble-img"
                  draggable="false"
                />

                <div className="level4-result-text level4-result-text--warning">
                  <h2>Hati-hati!</h2>
                  <p>
                    Saat mendekati persimpangan, pengendara harus mengurangi
                    kecepatan dan melihat kondisi sekitar. Kalau langsung jalan,
                    kendaraan dari arah lain bisa menabrak.
                  </p>
                </div>
              </div>

              <div className="level4-result-buttons">
                <button
                  type="button"
                  className="level4-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level4-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="level4-result-dim level4-result-dim--correct" />

              <img
                src={boyRiderBack}
                alt="Pengendara motor aman"
                className="level4-actor level4-rider-safe-result"
                draggable="false"
              />

              <img
                src={policeGood}
                alt="Polisi good"
                className="level4-actor level4-police level4-police--good"
                draggable="false"
              />

              <div className="level4-result-bubble level4-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="level4-result-bubble-img"
                  draggable="false"
                />

                <div className="level4-result-text level4-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memperlambat kendaraan dan memperhatikan kendaraan dari
                    arah lain. Mobil lewat dulu, lalu motor bisa lanjut dengan
                    aman.
                  </p>
                </div>
              </div>

              <div className="level4-result-buttons">
                <button
                  type="button"
                  className="level4-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level4-secondary-button"
                  onClick={handleFinish}
                >
                  Lanjut Level 5
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}