import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./StageSelectPage.css";

import stageBg from "../assets/stage-select/stage-bg.png";
import stage1Board from "../assets/stage-select/stage-1.png";
import stage2LockedBoard from "../assets/stage-select/stage-2-locked.png";
import stage2UnlockedBoard from "../assets/stage-select/stage-2-unlocked.png";
import stageLockedPopup from "../assets/stage-select/stage-locked-popup.png";

const StageSelectPage = () => {
  const navigate = useNavigate();

  const [isStage2Unlocked, setIsStage2Unlocked] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [showLockedPopup, setShowLockedPopup] = useState(false);

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

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("stage-select-no-scroll");
    };
  }, []);

  const handleStage1Click = () => {
    localStorage.setItem("selectedStage", "1");

    if (!localStorage.getItem("completedLevels")) {
      localStorage.setItem("completedLevels", JSON.stringify([]));
    }

    if (!localStorage.getItem("unlockedLevels")) {
      localStorage.setItem("unlockedLevels", JSON.stringify([1]));
    }

    navigate("/stage1-select");
  };

  const handleStage2Click = () => {
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

    navigate("/map");
  };

  return (
    <main className={`stage-select-page ${showPage ? "show" : ""}`}>
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
        onClick={() => navigate("/")}
      >
        ← Beranda
      </button>

      {showLockedPopup && (
        <div
          className="stage-popup-overlay"
          onClick={() => setShowLockedPopup(false)}
        >
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