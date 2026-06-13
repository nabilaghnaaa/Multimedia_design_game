import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./SimulationPage.css";

import level1Bg from "../assets/simulation/stage1/level1/level1-bg.png";

import girlPinkBack from "../assets/simulation/stage1/level1/girl-pink-back.png";
import girlPinkLeft from "../assets/simulation/stage1/level1/girl-pink-left.png";
import boyBlue from "../assets/simulation/stage1/level1/boy-blue.png";
import carBlack from "../assets/simulation/stage1/level1/car-black.png";
import crashImg from "../assets/simulation/stage1/level1/crash.png";

import policeGood from "../assets/simulation/stage1/level1/police-good.png";
import policeStop from "../assets/simulation/stage1/level1/police-stop.png";

import bubbleQuestionRight from "../assets/simulation/stage1/level1/bubble-question-right.png";
import bubbleGoodLeft from "../assets/simulation/stage1/level1/bubble-good-left.png";
import bubbleWarningRight from "../assets/simulation/stage1/level1/bubble-warning-right.png";

const STAGE1_PROGRESS_KEY = "stage1-progress";

const PHASE = {
  INTRO: "intro",
  GIRL_STOP: "girl-stop",
  TRAFFIC_ENTER: "traffic-enter",
  QUESTION: "question",
  WRONG_MOVE: "wrong-move",
  WRONG_RESULT: "wrong-result",
  CORRECT_MOVE: "correct-move",
  CORRECT_RESULT: "correct-result",
};

export default function SimulationPage() {
  const navigate = useNavigate();
  const { levelId } = useParams();
  const currentLevel = Number(levelId || 1);

  const timersRef = useRef([]);

  const [phase, setPhase] = useState(PHASE.INTRO);
  const [startCamera, setStartCamera] = useState(false);
  const [showGirl, setShowGirl] = useState(false);
  const [showTraffic, setShowTraffic] = useState(false);
  const [answerLocked, setAnswerLocked] = useState(false);

  /*
    Dipakai untuk memaksa scene render ulang saat klik Ulangi Level.
    Jadi kamera benar-benar balik ngeshot dari bawah seperti awal play.
  */
  const [restartKey, setRestartKey] = useState(0);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];
  };

  const saveLevel1Progress = () => {
    try {
      const savedProgress = localStorage.getItem(STAGE1_PROGRESS_KEY);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      const completedLevels = Array.isArray(progress.completedLevels)
        ? progress.completedLevels
        : [];

      const updatedCompletedLevels = [...new Set([...completedLevels, 1])];

      localStorage.setItem(
        STAGE1_PROGRESS_KEY,
        JSON.stringify({
          ...progress,
          unlockedLevel: Math.max(progress.unlockedLevel || 1, 2),
          completedLevels: updatedCompletedLevels,
        })
      );

      localStorage.setItem("unlockedLevels", JSON.stringify([1, 2]));
    } catch (error) {
      console.error("Gagal menyimpan progress level 1:", error);
    }
  };

  const startLevel = () => {
    clearTimers();

    setRestartKey((prevKey) => prevKey + 1);

    setPhase(PHASE.INTRO);
    setStartCamera(false);
    setShowGirl(false);
    setShowTraffic(false);
    setAnswerLocked(false);

    /*
      Kamera dan motor cewek mulai barengan.
      Background naik pelan, motor cewek juga naik pelan.
    */
    timersRef.current.push(
      setTimeout(() => {
        setShowGirl(true);
        setStartCamera(true);
      }, 120)
    );

    /*
      Kamera sudah sampai area persimpangan,
      cewek berhenti di bawah persimpangan.
    */
    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.GIRL_STOP);
      }, 3900)
    );

    /*
      Setelah cewek berhenti, mobil dan cowok masuk dari kanan.
    */
    timersRef.current.push(
      setTimeout(() => {
        setShowTraffic(true);
        setPhase(PHASE.TRAFFIC_ENTER);
      }, 4300)
    );

    /*
      Mobil dan cowok berhenti setengah masuk,
      lalu pertanyaan muncul.
    */
    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.QUESTION);
      }, 5500)
    );
  };

  useEffect(() => {
    startLevel();

    return () => {
      clearTimers();
    };
  }, [currentLevel]);

  const handleWrongAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    setPhase(PHASE.WRONG_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.WRONG_RESULT);
      }, 900)
    );
  };

  const handleCorrectAnswer = () => {
    if (answerLocked) return;

    setAnswerLocked(true);
    saveLevel1Progress();
    setPhase(PHASE.CORRECT_MOVE);

    timersRef.current.push(
      setTimeout(() => {
        setPhase(PHASE.CORRECT_RESULT);
      }, 1100)
    );
  };

  const handleRetry = () => {
    startLevel();
  };

  const handleBack = () => {
    navigate("/stage1-select");
  };

  const handleNext = () => {
    navigate("/simulation/2");
  };

  const isIntro = phase === PHASE.INTRO;
  const isGirlStop = phase === PHASE.GIRL_STOP;
  const isTrafficEnter = phase === PHASE.TRAFFIC_ENTER;
  const isQuestion = phase === PHASE.QUESTION;
  const isWrongMove = phase === PHASE.WRONG_MOVE;
  const isWrongResult = phase === PHASE.WRONG_RESULT;
  const isCorrectMove = phase === PHASE.CORRECT_MOVE;
  const isCorrectResult = phase === PHASE.CORRECT_RESULT;

  const showNormalGirl =
    showGirl &&
    !isWrongMove &&
    !isWrongResult &&
    !isCorrectMove &&
    !isCorrectResult;

  const showBoyAndCar = showTraffic;

  return (
    <main className="simulation-page">
      <button type="button" className="sim-back-button" onClick={handleBack}>
        ← Pilih Level
      </button>

      <div className="sim-level-badge">
        <span>LEVEL {currentLevel}</span>
        <strong>Dilarang Belok Kanan</strong>
      </div>

      <section key={restartKey} className="sim-viewport">
        <div className={`sim-bg-world ${startCamera ? "sim-bg-world--top" : ""}`}>
          <img
            src={level1Bg}
            alt="Background Level 1"
            className="sim-bg"
            draggable="false"
          />
        </div>

        <div className="sim-actors-layer">
          {showNormalGirl && (
            <img
              src={girlPinkBack}
              alt="Cewek pink dari bawah ke atas"
              className={`sim-actor sim-girl-back ${
                isIntro ? "sim-girl-back--walk" : ""
              } ${
                isGirlStop || isTrafficEnter || isQuestion
                  ? "sim-girl-back--stop"
                  : ""
              }`}
              draggable="false"
            />
          )}

          {showBoyAndCar && (
            <>
              <img
                src={carBlack}
                alt="Mobil hitam"
                className={`sim-actor sim-car ${
                  isTrafficEnter ? "sim-car--enter" : ""
                } ${isQuestion ? "sim-car--stop" : ""} ${
                  isWrongMove || isWrongResult ? "sim-car--wrong-drive" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "sim-car--correct-drive"
                    : ""
                }`}
                draggable="false"
              />

              <img
                src={boyBlue}
                alt="Cowok biru"
                className={`sim-actor sim-boy ${
                  isTrafficEnter ? "sim-boy--enter" : ""
                } ${isQuestion ? "sim-boy--stop" : ""} ${
                  isWrongMove || isWrongResult ? "sim-boy--wrong-move" : ""
                } ${
                  isCorrectMove || isCorrectResult
                    ? "sim-boy--correct-drive"
                    : ""
                }`}
                draggable="false"
              />
            </>
          )}

          {isQuestion && (
            <>
              <div className="sim-question-bubble">
                <img
                  src={bubbleQuestionRight}
                  alt=""
                  className="sim-bubble-img"
                  draggable="false"
                />

                <p>
                  Wah, jalan satu arah,
                  <br />
                  ada rambu dilarang belok kanan.
                  <br />
                  Apa yang harus aku lakukan?
                </p>
              </div>

              <div className="sim-answer-wrapper">
                <button
                  type="button"
                  className="sim-answer-button"
                  onClick={handleCorrectAnswer}
                >
                  Belok Kiri
                </button>

                <button
                  type="button"
                  className="sim-answer-button"
                  onClick={handleWrongAnswer}
                >
                  Belok Kanan
                </button>
              </div>
            </>
          )}

          {isWrongMove && (
            <img
              src={girlPinkLeft}
              alt="Cewek pink salah belok kanan"
              className="sim-actor sim-girl-wrong"
              draggable="false"
            />
          )}

          {isCorrectMove && (
            <img
              src={girlPinkLeft}
              alt="Cewek pink belok kiri"
              className="sim-actor sim-girl-correct"
              draggable="false"
            />
          )}

          {isWrongResult && (
            <>
              <div className="sim-result-dim sim-result-dim--wrong" />

              <img
                src={policeStop}
                alt="Polisi stop"
                className="sim-actor sim-police sim-police--stop"
                draggable="false"
              />

              <img
                src={crashImg}
                alt="Tabrakan"
                className="sim-actor sim-crash"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--warning">
                <img
                  src={bubbleWarningRight}
                  alt=""
                  className="sim-result-bubble-img"
                  draggable="false"
                />

                <div className="sim-result-text sim-result-text--warning">
                  <h2>Berhenti!</h2>
                  <p>
                    Kamu melanggar peraturan. Rambu dilarang belok kanan
                    berarti kamu tidak boleh belok ke kanan karena bisa
                    bertabrakan.
                  </p>
                </div>
              </div>

              <div className="sim-result-buttons">
                <button
                  type="button"
                  className="sim-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="sim-secondary-button"
                  onClick={handleBack}
                >
                  Pilih Level
                </button>
              </div>
            </>
          )}

          {isCorrectResult && (
            <>
              <div className="sim-result-dim sim-result-dim--correct" />

              <img
                src={policeGood}
                alt="Polisi good"
                className="sim-actor sim-police sim-police--good"
                draggable="false"
              />

              <img
                src={girlPinkLeft}
                alt="Cewek pink aman"
                className="sim-actor sim-girl-safe-final"
                draggable="false"
              />

              <div className="sim-result-bubble sim-result-bubble--good">
                <img
                  src={bubbleGoodLeft}
                  alt=""
                  className="sim-result-bubble-img"
                  draggable="false"
                />

                <div className="sim-result-text sim-result-text--good">
                  <h2>Kerja Bagus!</h2>
                  <p>
                    Kamu memilih belok kiri. Itu sesuai arah jalan satu arah dan
                    membuat perjalanan tetap aman.
                  </p>
                </div>
              </div>

              <div className="sim-result-buttons">
                <button
                  type="button"
                  className="sim-main-button"
                  onClick={handleRetry}
                >
                  Ulangi Level
                </button>

                <button
                  type="button"
                  className="sim-secondary-button" onClick={handleNext}
                >
                  Lanjut Level 2
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}