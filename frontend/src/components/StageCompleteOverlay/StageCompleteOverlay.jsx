import React from "react";
import "./StageCompleteOverlay.css";

import stage1Complete from "../../assets/stage-complete/stage-1-complete.png";
import stage2Complete from "../../assets/stage-complete/stage-2-complete.png";

export default function StageCompleteOverlay({
  stage = 1,
  onMainClick,
  onSecondaryClick,
}) {
  const isStage2 = Number(stage) === 2;
  const popupImage = isStage2 ? stage2Complete : stage1Complete;

  return (
    <div className="stage-complete-overlay-wrapper">
      <div className="stage-complete-overlay-bg" />

      <div className="stage-complete-overlay-content">
        <img
          src={popupImage}
          alt={
            isStage2
              ? "Stage 2 telah kamu tamatkan"
              : "Stage 1 telah kamu tamatkan"
          }
          className="stage-complete-overlay-popup"
          draggable="false"
        />

        <div className="stage-complete-overlay-buttons">
          <button
            type="button"
            className="stage-complete-overlay-main-button"
            onClick={onMainClick}
          >
            {isStage2 ? "Kembali ke Pilih Stage" : "Lanjut Stage 2"}
          </button>

          <button
            type="button"
            className="stage-complete-overlay-secondary-button"
            onClick={onSecondaryClick}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}