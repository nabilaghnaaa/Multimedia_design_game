import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationStage2Level2.css";

import level2Bg from "../assets/simulation/stage2/level2/level2-bg.png";
import truckBack from "../assets/simulation/stage2/level2/truck-back.png";
import girlRiderBack from "../assets/simulation/stage2/level2/girl-rider-back.png";
import oncomingCarFront from "../assets/simulation/stage2/level2/oncoming-car-front.png";
import crashLevel2 from "../assets/simulation/stage2/level2/crash-level2.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";
import bubbleGoodRight from "../assets/simulation/stage1/level1/bubble-good-right.png";

import backsoundMusic from "../assets/sounds/backsound.mp3";
import buttonClickSound from "../assets/sounds/button-click.mp3";
import correctCringSound from "../assets/sounds/correct-cring.mp3";
import crashSound from "../assets/sounds/crash.mp3";
import hormSound from "../assets/sounds/horm.mp3";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  OVERTAKE_MOVE: "overtake-move",
  OVERTAKE_CRASH: "overtake-crash",
  SAFE_MOVE: "safe-move",
  SAFE_RESULT: "safe-result",
};

const BACKSOUND_NORMAL_VOLUME = 0.18;
const BACKSOUND_DUCK_VOLUME = 0.06;

const normalizeNumberArray = (data, fallback = []) => {
  if (!Array.isArray(data)) return fallback;

  return [
    ...new Set(
      data
        .map((item) => Number(item))
        .filter((item) => Number.isFinite(item))
    ),
  ].sort((a, b) => a - b);
};

const safeParseArray = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;

    const parsed = JSON.parse(saved);
    return normalizeNumberArray(parsed, fallback);
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);
    return fallback;
  }
};

export default function SimulationStage2Level2() {
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
  const [showTruck, setShowTruck] = useState(false);
  const [showRider, setShowRider] = useState(false);
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

  const saveStage2Level2Progress = () => {
    const completedLevels = safeParseArray("completedLevels", []);
    const unlockedLevels = safeParseArray("unlockedLevels", [1, 6]);

    const updatedCompletedLevels = normalizeNumberArray(
      [...completedLevels, 6, 7],
      []
    );

    const updatedUnlockedLevels = normalizeNumberArray(
      [...unlockedLevels, 6, 7, 8],
      [1, 6]
    );

    localStorage.setItem("selectedStage", "2");
    localStorage.setItem("selectedLevel", "8");
    localStorage.setItem("selectedStage2Level", "3");
    localStorage.setItem(
      "completedLevels",
      JSON.stringify(updatedCompletedLevels)
    );
    localStorage.setItem(
      "unlockedLevels",
      JSON.stringify(updatedUnlockedLevels)
    );
  };

  const startLevel = () => {
    clearTimers();
    startBacksound();

    setRestartKey((prev) => prev + 1);
    setPhase(PHASE.INTRO);
    setStartScene(false);
    setShowTruck(false);
    setShowRider(false);
    setAnswerLocked(false);

    timersRef.current.push(
      setTimeout(() => {
        setStartScene(true);
        setShowTruck(true);
        setShowRider(true);
      }, 120)
    );

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 4000)
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

  const handleOvertake = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);
    playSound(hormAudioRef, 1, 1000);

    setAnswerLocked(true);
    setPhase(PHASE.OVERTAKE_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(crashAudioRef, 1, 1600);
        setPhase(PHASE.OVERTAKE_CRASH);
      }, 1800)
    );
  };

  const handleStayLane = () => {
    if (answerLocked) return;

    playSound(buttonClickAudioRef, 1, 450);

    setAnswerLocked(true);
    saveStage2Level2Progress();
    setPhase(PHASE.SAFE_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playSound(correctCringAudioRef, 1, 1300);
        setPhase(PHASE.SAFE_RESULT);
      }, 2800)
    );
  };

  const handleRetry = () => {
    playSound(buttonClickAudioRef, 1, 450);
    startLevel();
  };

  const handleBack = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/map");
    }, 160);
  };

  const handleFinish = () => {
    playSound(buttonClickAudioRef, 1, 450);

    setTimeout(() => {
      navigate("/simulation/8");
    }, 160);
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isOvertakeMove = phase === PHASE.OVERTAKE_MOVE;
  const isCrashResult = phase === PHASE.OVERTAKE_CRASH;
  const isSafeMove = phase === PHASE.SAFE_MOVE;
  const isSafeResult = phase === PHASE.SAFE_RESULT;
  const isSafePhase = isSafeMove || isSafeResult;
  const isOvertakePhase = isOvertakeMove || isCrashResult;

  return (
    <main className="simulation-s2l2-page" onClick={startBacksound}>
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

      <button type="button" className="s2l2-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="s2l2-badge">
        <span>STAGE 2 - LEVEL 2</span>
        <strong>Dilarang Menyalip</strong>
      </div>

      <section
        key={restartKey}
        className={`s2l2-viewport ${
          isCrashResult ? "s2l2-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`s2l2-bg-world ${
            startScene ? "s2l2-bg-world--move" : ""
          }`}
        >
          <img
            src={level2Bg}
            alt="Background jalan dengan rambu dilarang menyalip"
            className="s2l2-bg"
            draggable="false"
          />
        </div>

        <div className="s2l2-actors-layer">
          {showTruck && (
            <img
              src={truckBack}
              alt="Truk tampak belakang"
              className={`s2l2-actor s2l2-truck ${
                startScene ? "s2l2-truck--enter" : ""
              } ${isQuestion ? "s2l2-truck--stop" : ""} ${
                isOvertakePhase ? "s2l2-truck--overtake-go" : ""
              } ${isSafePhase ? "s2l2-truck--safe-go" : ""}`}
              draggable="false"
            />
          )}

          {!isCrashResult && showRider && (
            <img
              src={girlRiderBack}
              alt="Pengendara motor tampak belakang"
              className={`s2l2-actor s2l2-rider ${
                startScene ? "s2l2-rider--enter" : ""
              } ${isQuestion ? "s2l2-rider--stop" : ""} ${
                isOvertakeMove ? "s2l2-rider--overtake-go" : ""
              } ${isSafePhase ? "s2l2-rider--safe-go" : ""}`}
              draggable="false"
            />
          )}

          {!isCrashResult && isOvertakeMove && (
            <img
              src={oncomingCarFront}
              alt="Mobil dari arah berlawanan"
              className="s2l2-actor s2l2-oncoming-car s2l2-oncoming-car--enter"
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="s2l2-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="s2l2-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu dilarang menyalip.
                  <br />
                  Aku sebaiknya menyalip truk
                  <br />
                  atau tetap di belakang truk?
                </p>
              </div>

              <div className="s2l2-answer-wrapper">
                <button
                  type="button"
                  className="s2l2-answer-button s2l2-answer-button--danger"
                  onClick={handleOvertake}
                >
                  Tetap menyalip
                </button>

                <button
                  type="button"
                  className="s2l2-answer-button"
                  onClick={handleStayLane}
                >
                  Tidak menyalip dan tetap di jalur
                </button>
              </div>
            </>
          )}

          {isCrashResult && (
            <>
              <div className="s2l2-result-dim s2l2-result-dim--wrong" />

              <img
                src={crashLevel2}
                alt="Tabrakan karena menyalip"
                className="s2l2-actor s2l2-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="s2l2-actor s2l2-police s2l2-police--stop"
                draggable="false"
              />

              <div className="s2l2-result-bubble s2l2-result-bubble--warning-right">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="s2l2-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l2-result-text s2l2-result-text--warning">
                  <h2>Bahaya!</h2>
                  <p>
                    Rambu dilarang menyalip berarti pengendara tidak boleh
                    mendahului kendaraan lain. Menyalip di area ini bisa
                    menyebabkan tabrakan dengan kendaraan dari arah berlawanan.
                  </p>
                </div>
              </div>

              <div className="s2l2-result-buttons">
                <button
                  type="button"
                  className="s2l2-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l2-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isSafeResult && (
            <>
              <div className="s2l2-result-dim s2l2-result-dim--good" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="s2l2-actor s2l2-police s2l2-police--good"
                draggable="false"
              />

              <div className="s2l2-result-bubble s2l2-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="s2l2-result-bubble-img"
                  draggable="false"
                />

                <div className="s2l2-result-text s2l2-result-text--good">
                  <h2>Bagus!</h2>
                  <p>
                    Kamu memilih tidak menyalip. Saat ada rambu dilarang
                    menyalip, pengendara harus tetap berada di jalur dan
                    menunggu sampai kondisi aman serta diperbolehkan.
                  </p>
                </div>
              </div>

              <div className="s2l2-result-buttons">
                <button
                  type="button"
                  className="s2l2-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="s2l2-secondary-button"
                  onClick={handleFinish}
                >
                  Lanjut Level 3
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}