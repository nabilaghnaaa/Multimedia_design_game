import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimulationLevel5.css";

import StageCompleteOverlay from "../components/StageCompleteOverlay/StageCompleteOverlay";

import level5Bg from "../assets/simulation/stage1/level5/level5-bg.png";
import truckBack from "../assets/simulation/stage1/level5/truck-back.png";
import girlRiderBack from "../assets/simulation/stage1/level5/girl-rider-back.png";
import oncomingCarFront from "../assets/simulation/stage1/level5/oncoming-car-front.png";
import crashLevel5 from "../assets/simulation/stage1/level5/crash-level5.png";

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

const STAGE1_PROGRESS_KEY = "stage1-progress";

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

export default function SimulationLevel5() {
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
  const [showStageComplete, setShowStageComplete] = useState(false);

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

  const saveLevel5Progress = () => {
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
          5,
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
      console.error("Gagal menyimpan progress level 5:", error);
    }
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
    setShowStageComplete(false);

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
    saveLevel5Progress();
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
      navigate("/stage1-select");
    }, 160);
  };

  const handleFinish = () => {
    playSound(buttonClickAudioRef, 1, 450);
    setShowStageComplete(true);
  };

  const handleGoToStage2 = () => {
    playSound(buttonClickAudioRef, 1, 450);

    localStorage.setItem("selectedStage", "2");

    const savedUnlockedLevels = localStorage.getItem("unlockedLevels");
    const unlockedLevels = savedUnlockedLevels
      ? JSON.parse(savedUnlockedLevels)
      : [1];

    const updatedUnlockedLevels = [
      ...new Set([...unlockedLevels, 1, 2, 3, 4, 5, 6]),
    ].sort((a, b) => a - b);

    localStorage.setItem(
      "unlockedLevels",
      JSON.stringify(updatedUnlockedLevels)
    );

    setTimeout(() => {
      navigate("/map");
    }, 160);
  };

  const handleCloseStageComplete = () => {
    playSound(buttonClickAudioRef, 1, 450);
    setShowStageComplete(false);
  };

  const isQuestion = phase === PHASE.QUESTION;
  const isOvertakeMove = phase === PHASE.OVERTAKE_MOVE;
  const isCrashResult = phase === PHASE.OVERTAKE_CRASH;
  const isSafeMove = phase === PHASE.SAFE_MOVE;
  const isSafeResult = phase === PHASE.SAFE_RESULT;
  const isSafePhase = isSafeMove || isSafeResult;
  const isOvertakePhase = isOvertakeMove || isCrashResult;

  return (
    <main className="simulation-level5-page" onClick={startBacksound}>
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

      <button type="button" className="level5-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="level5-badge">
        <span>LEVEL 5</span>
        <strong>Peringatan Dua Arah</strong>
      </div>

      <section
        key={restartKey}
        className={`level5-viewport ${
          isCrashResult ? "level5-viewport--crash-shake" : ""
        }`}
      >
        <div
          className={`level5-bg-world ${
            startScene ? "level5-bg-world--move" : ""
          }`}
        >
          <img
            src={level5Bg}
            alt="Background jalan lurus"
            className="level5-bg"
            draggable="false"
          />
        </div>

        <div className="level5-actors-layer">
          {showTruck && (
            <img
              src={truckBack}
              alt="Truk tampak belakang"
              className={`level5-actor level5-truck ${
                startScene ? "level5-truck--enter" : ""
              } ${isQuestion ? "level5-truck--stop" : ""} ${
                isOvertakePhase ? "level5-truck--overtake-go" : ""
              } ${isSafePhase ? "level5-truck--safe-go" : ""}`}
              draggable="false"
            />
          )}

          {!isCrashResult && showRider && (
            <img
              src={girlRiderBack}
              alt="Pengendara cewe tampak belakang"
              className={`level5-actor level5-rider ${
                startScene ? "level5-rider--enter" : ""
              } ${isQuestion ? "level5-rider--stop" : ""} ${
                isOvertakeMove ? "level5-rider--overtake-go" : ""
              } ${isSafePhase ? "level5-rider--safe-go" : ""}`}
              draggable="false"
            />
          )}

          {!isCrashResult && isOvertakeMove && (
            <img
              src={oncomingCarFront}
              alt="Mobil dari arah berlawanan"
              className="level5-actor level5-oncoming-car level5-oncoming-car--enter"
              draggable="false"
            />
          )}

          {isQuestion && (
            <>
              <div className="level5-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="level5-bubble-img"
                  draggable="false"
                />

                <p>
                  Ada rambu dua arah di depan.
                  <br />
                  Aku sebaiknya menyalip truk
                  <br />
                  atau tetap di belakang truk?
                </p>
              </div>

              <div className="level5-answer-wrapper">
                <button
                  type="button"
                  className="level5-answer-button level5-answer-button--danger"
                  onClick={handleOvertake}
                >
                  Menyalip sekarang
                </button>

                <button
                  type="button"
                  className="level5-answer-button"
                  onClick={handleStayLane}
                >
                  Tetap di jalur di belakang truk
                </button>
              </div>
            </>
          )}

          {isCrashResult && (
            <>
              <div className="level5-result-dim level5-result-dim--wrong" />

              <img
                src={crashLevel5}
                alt="Tabrakan dramatis"
                className="level5-actor level5-crash"
                draggable="false"
              />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="level5-actor level5-police level5-police--stop"
                draggable="false"
              />

              <div className="level5-result-bubble level5-result-bubble--warning-right">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="level5-result-bubble-img"
                  draggable="false"
                />

                <div className="level5-result-text level5-result-text--warning">
                  <h2>Hati-hati!</h2>
                  <p>
                    Menyalip di jalan dua arah itu berbahaya kalau dari arah
                    berlawanan ada kendaraan lain. Pengendara harus sabar dan
                    tidak menyalip sembarangan.
                  </p>
                </div>
              </div>

              <div className="level5-result-buttons">
                <button
                  type="button"
                  className="level5-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level5-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isSafeResult && (
            <>
              <div className="level5-result-dim level5-result-dim--good" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="level5-actor level5-police level5-police--good"
                draggable="false"
              />

              <div className="level5-result-bubble level5-result-bubble--good">
                <img
                  src={bubbleGoodRight}
                  alt=""
                  className="level5-result-bubble-img"
                  draggable="false"
                />

                <div className="level5-result-text level5-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memilih tetap di jalur dan tidak menyalip truk. Itu
                    keputusan yang aman saat berada di jalan dua arah, apalagi
                    ketika jarak pandang ke depan tertutup kendaraan besar.
                  </p>
                </div>
              </div>

              <div className="level5-result-buttons">
                <button
                  type="button"
                  className="level5-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="level5-secondary-button"
                  onClick={handleFinish}
                >
                  Selesai Stage 1
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {showStageComplete && (
        <StageCompleteOverlay
          stage={1}
          onMainClick={handleGoToStage2}
          onSecondaryClick={handleCloseStageComplete}
        />
      )}
    </main>
  );
}