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

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  QUESTION: "question",
  OVERTAKE_MOVE: "overtake-move",
  OVERTAKE_CRASH: "overtake-crash",
  SAFE_MOVE: "safe-move",
  SAFE_RESULT: "safe-result",
};

export default function SimulationLevel5() {
  const navigate = useNavigate();
  const timersRef = useRef([]);
  const audioContextRef = useRef(null);

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

  const getAudioContext = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playCrashSound = () => {
    const audioContext = getAudioContext();
    if (!audioContext) return;

    const now = audioContext.currentTime;

    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    masterGain.connect(audioContext.destination);

    const boom = audioContext.createOscillator();
    boom.type = "sawtooth";
    boom.frequency.setValueAtTime(130, now);
    boom.frequency.exponentialRampToValueAtTime(35, now + 0.42);

    const boomGain = audioContext.createGain();
    boomGain.gain.setValueAtTime(0.0001, now);
    boomGain.gain.exponentialRampToValueAtTime(0.85, now + 0.015);
    boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    boom.connect(boomGain);
    boomGain.connect(masterGain);

    const bufferSize = audioContext.sampleRate * 0.36;
    const noiseBuffer = audioContext.createBuffer(
      1,
      bufferSize,
      audioContext.sampleRate
    );

    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(250, now + 0.34);

    const noiseGain = audioContext.createGain();
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.9, now + 0.01);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterGain);

    boom.start(now);
    boom.stop(now + 0.45);

    noise.start(now);
    noise.stop(now + 0.36);
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

    return () => {
      clearTimers();
    };
  }, []);

  const handleOvertake = () => {
    if (answerLocked) return;

    getAudioContext();
    setAnswerLocked(true);
    setPhase(PHASE.OVERTAKE_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        playCrashSound();
        setPhase(PHASE.OVERTAKE_CRASH);
      }, 1800)
    );
  };

  const handleStayLane = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveLevel5Progress();
    setPhase(PHASE.SAFE_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.SAFE_RESULT);
      }, 2800)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/stage1-select");
  };

  const handleFinish = () => {
    setShowStageComplete(true);
  };

  const handleGoToStage2 = () => {
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

    navigate("/map");
  };

  const handleCloseStageComplete = () => {
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
    <main className="simulation-level5-page">
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