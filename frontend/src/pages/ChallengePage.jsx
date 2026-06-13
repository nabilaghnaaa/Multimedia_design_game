import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import sign1 from '../assets/signs/rambu_1-removebg-preview.png';
import sign21 from '../assets/signs/rambu 2.1.png';
import sign22 from '../assets/signs/rambu 2.2.png';
import sign23 from '../assets/signs/rambu 2.3.png';
import sign24 from '../assets/signs/rambu 2.4.png';
import sign25 from '../assets/signs/rambu 2.5.png';
import sign26 from '../assets/signs/rambu 2.6.png';
import sign3 from '../assets/signs/rambu 3.png';
import sign4 from '../assets/signs/rambu 4 .png';
import sign5 from '../assets/signs/rambu 5.png';
import sign7 from '../assets/signs/rambu 7.png';
import sign8 from '../assets/signs/rambu 8.png';
import polisiImg from '../assets/characters/polisi1.png';
import polisi2Img from '../assets/characters/polisi2.png';

const signImages = {
  1: sign1,   // Tikungan Tajam
  2: sign21,  // Jalan Licin
  3: sign22,  // Penyeberangan
  4: sign23,  // Persimpangan
  5: sign24,  // Lalu Lintas Dua Arah
  6: sign3,   // Batas Kecepatan
  7: sign4,   // Dilarang Menyalip
  8: sign25,  // Dilarang Masuk
  9: sign26,  // Dilarang Berhenti
  10: sign7,  // Beri Prioritas
  11: sign5,  // Dilarang Belok Kanan / Kiri
  12: sign8,  // Dilarang Putar Balik
};

const TIMER_SECONDS = 15;
const MAX_LIVES = 3;

const GameState = {
  INTRO: 'intro',
  PLAYING: 'playing',
  FEEDBACK: 'feedback',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.start();
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'tick') {
      // Short click sound for ticking clock
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.error("Audio error:", e);
  }
};

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const ChallengePage = () => {
  const navigate = useNavigate();
  
  const [allLevels, setAllLevels] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [gameState, setGameState] = useState(GameState.INTRO);
  
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [lives, setLives] = useState(MAX_LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [timerWarning, setTimerWarning] = useState(false);
  
  const currentQuestion = questions[currentIdx];

  // Fetch levels
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/levels');
        setAllLevels(res.data);
      } catch (err) {
        console.error("Error fetching levels:", err);
      }
    };
    fetchLevels();
  }, []);

  const startGame = () => {
    const shuffled = shuffle(allLevels).slice(0, Math.min(10, allLevels.length));
    setQuestions(shuffled);
    setCurrentIdx(0);
    setLives(MAX_LIVES);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimer(TIMER_SECONDS);
    setSelectedOption(null);
    setFeedback(null);
    setGameState(GameState.PLAYING);
  };

  // Timer logic with audio tick
  useEffect(() => {
    if (gameState !== GameState.PLAYING) return;
    
    setTimerWarning(false);
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 6) {
          setTimerWarning(true);
          playSound('tick'); // Play heartbeat clock tick
        }
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [gameState, currentIdx]);

  const handleTimeout = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    playSound('wrong');
    const newLives = lives - 1;
    setLives(newLives);
    setCombo(0);
    setFeedback({ isCorrect: false, message: '⏰ Waktu habis! Lebih cepat ya lain kali!' });
    setGameState(GameState.FEEDBACK);
    
    if (newLives <= 0) {
      setTimeout(() => setGameState(GameState.GAME_OVER), 2000);
    }
  }, [gameState, lives]);

  const handleAnswer = (option, idx) => {
    if (gameState !== GameState.PLAYING) return;
    
    setSelectedOption(idx);
    const isCorrect = option.is_correct;
    
    if (isCorrect) {
      playSound('correct');
      const newCombo = combo + 1;
      const comboBonus = newCombo >= 3 ? 50 : newCombo >= 2 ? 20 : 0;
      const timeBonus = Math.floor(timer * 5);
      const baseScore = 100;
      const gained = baseScore + timeBonus + comboBonus;
      
      setScore(prev => prev + gained);
      setCombo(newCombo);
      setMaxCombo(prev => Math.max(prev, newCombo));
      setFeedback({ 
        isCorrect: true, 
        message: option.feedback_message,
        gained,
        comboBonus,
        timeBonus
      });
      if (newCombo >= 2) {
        setShowComboPopup(true);
        setTimeout(() => setShowComboPopup(false), 1500);
      }
    } else {
      playSound('wrong');
      const newLives = lives - 1;
      setLives(newLives);
      setCombo(0);
      setFeedback({ isCorrect: false, message: option.feedback_message });
      
      if (newLives <= 0) {
        setGameState(GameState.FEEDBACK);
        setTimeout(() => setGameState(GameState.GAME_OVER), 2500);
        return;
      }
    }
    
    setGameState(GameState.FEEDBACK);
  };

  const handleNext = () => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= questions.length) {
      setGameState(GameState.VICTORY);
    } else {
      setCurrentIdx(nextIdx);
      setSelectedOption(null);
      setFeedback(null);
      setTimer(TIMER_SECONDS);
      setTimerWarning(false);
      setGameState(GameState.PLAYING);
    }
  };

  const timerPercent = (timer / TIMER_SECONDS) * 100;
  const timerColor = timer > 10 ? '#10b981' : timer > 5 ? '#eab308' : '#ef4444';

  // ===== INTRO SCREEN =====
  if (gameState === GameState.INTRO) {
    return (
      <div className="min-h-screen font-kids flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-b from-[#180828] via-[#2e1065] to-[#4c1d95]">
        
        {/* Stars */}
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-pulse"
               style={{
                 width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px',
                 top: Math.random() * 100 + '%', left: Math.random() * 100 + '%',
                 opacity: Math.random() * 0.7 + 0.3,
                 animationDuration: Math.random() * 3 + 2 + 's',
               }} />
        ))}

        {/* Floating elements */}
        <div className="absolute top-20 left-10 text-5xl animate-float">⚡</div>
        <div className="absolute bottom-20 right-10 text-5xl animate-float" style={{ animationDelay: '1s' }}>🚦</div>

        <div className="relative z-10 max-w-md w-full text-center">
          
          <div className="text-8xl mb-4 animate-bounce-slow">⚡</div>
          
          <h1 className="text-6xl font-black text-white tracking-widest drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" style={{ WebkitTextStroke: '2px #0f172a' }}>
            MODE
          </h1>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-500 tracking-wider mb-8 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">
            TANTANGAN!
          </h1>

          {/* Rules Card */}
          <div className="card-arcade p-6 border border-purple-500/30 neon-glow-purple mb-8 text-left shadow-2xl">
            <h3 className="text-yellow-400 font-black text-lg mb-4 text-center tracking-wider">📋 MANUAL BERMAIN</h3>
            <div className="space-y-4">
              {[
                { icon: '🎯', text: '10 Soal rambu lalu lintas acak' },
                { icon: '⏱️', text: `${TIMER_SECONDS} Detik per soal — jangan lambat!` },
                { icon: '❤️', text: `${MAX_LIVES} Nyawa — salah/habis waktu = pecah 1` },
                { icon: '🔥', text: 'Combo beruntun = BONUS poin ekstra!' },
                { icon: '🚀', text: 'Semakin cepat menjawab, skor makin tinggi!' }
              ].map((rule, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-2xl bg-slate-950 p-1.5 rounded-lg border border-white/10">{rule.icon}</span>
                  <span className="text-white/95 text-sm font-bold">{rule.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={startGame}
              disabled={allLevels.length === 0}
              className="w-full btn-arcade-yellow text-2xl py-4"
            >
              {allLevels.length === 0 ? 'MEMUAT GAME...' : '🚀 MULAI TANTANGAN'}
            </button>
            <button 
              onClick={() => navigate('/')}
              className="w-full btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_6px_0_#020617] py-3 text-sm"
            >
              ← KEMBALI
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== GAME OVER SCREEN =====
  if (gameState === GameState.GAME_OVER) {
    return (
      <div className="min-h-screen font-kids flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#1c0303] via-[#7f1d1d] to-[#be123c] relative overflow-hidden">
        
        {/* Neon outer red blur */}
        <div className="absolute inset-0 bg-red-950/20 z-0 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-md w-full">
          <div className="text-8xl mb-4 animate-shake">💀</div>
          <h1 className="text-5xl font-black text-white drop-shadow-md mb-2">GAME OVER!</h1>
          <p className="text-white/80 text-lg font-bold mb-8">Nyawa kamu telah habis terpakai...</p>
          
          {/* LED Arcade Scoreboard */}
          <div className="card-arcade p-6 border-2 border-red-500 neon-glow-red mb-8">
            <div className="text-yellow-400 font-mono text-5xl font-black tracking-widest drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] mb-1">
              {score.toLocaleString()}
            </div>
            <div className="text-white/60 text-xs font-black tracking-widest">SKOR AKHIR</div>
            
            <div className="grid grid-cols-2 gap-4 mt-6 text-white">
              <div className="bg-slate-950/70 rounded-xl p-3 border border-white/10">
                <div className="text-2xl font-black text-rose-400">{currentIdx}</div>
                <div className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Soal Terjawab</div>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-3 border border-white/10">
                <div className="text-2xl font-black text-amber-400">🔥 x{maxCombo}</div>
                <div className="text-[10px] text-white/50 font-bold tracking-wider uppercase">Combo Maksimal</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <button onClick={startGame} className="w-full btn-arcade-yellow text-xl py-4">
              🔄 COBA KEMBALI
            </button>
            <button onClick={() => navigate('/')} className="w-full btn-arcade bg-slate-800 text-white border-slate-950 shadow-[0_6px_0_#020617] py-3 text-sm">
              🏠 BERANDA
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== VICTORY SCREEN =====
  if (gameState === GameState.VICTORY) {
    const starCount = score >= 1200 ? 3 : score >= 800 ? 2 : 1;
    return (
      <div className="min-h-screen font-kids flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#047857] relative overflow-hidden">
        
        {/* Glow */}
        <div className="absolute inset-0 bg-emerald-950/20 z-0 pointer-events-none"></div>

        <div className="relative z-10 text-center max-w-md w-full animate-pop">
          
          {/* Trophy floating */}
          <div className="text-9xl mb-4 animate-bounce-slow">🏆</div>
          
          {/* Stars */}
          <div className="text-5xl mb-4 tracking-widest drop-shadow">
            {['⭐', '⭐', '⭐'].map((star, i) => (
              <span key={i} className={`inline-block transition-all duration-500 mx-1 ${i < starCount ? 'opacity-100 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]' : 'opacity-20 grayscale'}`}>
                ⭐
              </span>
            ))}
          </div>

          <h1 className="text-5xl font-black text-white drop-shadow mb-2">LUAR BIASA!</h1>
          <p className="text-white/80 text-base font-bold mb-8">Kamu berhasil mengalahkan semua tantangan waktu!</p>
          
          {/* Highscore Card */}
          <div className="card-arcade p-6 border-2 border-yellow-400 neon-glow-yellow mb-8">
            <div className="text-yellow-400 font-mono text-6xl font-black tracking-widest drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] mb-1">
              {score.toLocaleString()}
            </div>
            <div className="text-white/60 text-xs font-black tracking-widest mb-4">SKOR AKHIR TANTANGAN</div>
            
            <div className="grid grid-cols-3 gap-3 text-white">
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-white/10">
                <div className="text-xl font-black text-emerald-400">{questions.length}</div>
                <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Soal</div>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-white/10">
                <div className="text-xl font-black text-rose-400">❤️ {lives}</div>
                <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Sisa Nyawa</div>
              </div>
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-white/10">
                <div className="text-xl font-black text-amber-400">🔥 x{maxCombo}</div>
                <div className="text-[9px] text-white/50 font-bold uppercase tracking-wider">Max Combo</div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <button onClick={startGame} className="w-full btn-arcade-yellow text-xl py-4">
              🔄 MAIN KEMBALI
            </button>
            <button onClick={() => navigate('/map')} className="w-full btn-arcade-purple text-base py-3.5">
              🗺️ KEMBALI KE PETA LEVEL
            </button>
            <button onClick={() => navigate('/')} className="text-white/50 hover:text-white font-bold text-xs uppercase tracking-wider mt-2">
              ← Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== PLAYING / FEEDBACK =====
  const signImg = currentQuestion ? signImages[currentQuestion.level] : null;

  return (
    <div className="min-h-screen font-kids flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#0f071c] via-[#1e1b4b] to-[#090514] laser-grid-container">
      
      {/* Laser Grid Background scrolling */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 laser-grid z-0"></div>

      {/* Floating stars */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[...Array(15)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white opacity-40 animate-pulse"
               style={{
                 width: '2px', height: '2px',
                 top: Math.random() * 60 + '%', left: Math.random() * 100 + '%',
                 animationDuration: Math.random() * 2 + 1 + 's',
               }} />
        ))}
      </div>

      {/* Combo Fire Popup */}
      {showComboPopup && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 text-center animate-pop">
          <div className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white font-black text-3xl px-8 py-3 rounded-2xl border-4 border-orange-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            🔥 COMBO x{combo}!
          </div>
        </div>
      )}

      {/* Main Game Interface */}
      <div className="relative z-10 flex flex-col min-h-screen justify-between p-4">
        
        {/* HUD Top Bar Panel */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
          
          <div className="flex items-center justify-between">
            {/* Lives Heart Icons */}
            <div className="flex items-center gap-1.5 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/10 shadow-lg">
              {[...Array(MAX_LIVES)].map((_, i) => {
                const isAlive = i < lives;
                return (
                  <span 
                    key={i} 
                    className={`text-2xl inline-block transition-all duration-300
                      ${isAlive ? 'animate-float opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'opacity-20 scale-90 grayscale animate-shake'}`}
                    style={isAlive ? { animationDuration: `${2 + i * 0.4}s` } : {}}
                  >
                    ❤️
                  </span>
                );
              })}
            </div>

            {/* LED Digital Score Board */}
            <div className="bg-slate-950 border-2 border-yellow-500/40 px-5 py-2 rounded-xl text-center shadow-lg neon-glow-yellow flex flex-col items-center">
              <span className="text-yellow-400 font-mono text-2xl font-black tracking-widest drop-shadow-[0_0_6px_rgba(250,204,21,0.5)]">
                {score.toLocaleString()}
              </span>
              <span className="text-white/40 text-[9px] font-black tracking-widest -mt-0.5">SKOR TANTANGAN</span>
            </div>

            {/* Fire Combo Counter */}
            <div className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl border transition-all duration-300 shadow-lg
              ${combo >= 3 ? 'bg-orange-500/80 border-orange-400 animate-pulse text-white' : 
                combo >= 2 ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 
                'bg-slate-900/80 border-white/10 text-white/50'}`}>
              <span className="text-xl">🔥</span>
              <span className="font-black text-base">x{combo}</span>
            </div>
          </div>

          {/* Time Counter Bar */}
          <div className="w-full">
            <div className="flex justify-between text-white/80 text-xs font-black mb-1 px-1">
              <span>PERTANYAAN {currentIdx + 1} / {questions.length}</span>
              <span className={timerWarning ? 'text-red-400 animate-pulse font-black scale-110' : 'text-yellow-400 font-bold'}>
                ⏰ TERSISA: {timer}s
              </span>
            </div>
            
            {/* Timer slider */}
            <div className="h-5 bg-slate-950/80 rounded-full overflow-hidden border-2 border-slate-700 relative shadow-inner">
              <div 
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${timerPercent}%`, 
                  background: `linear-gradient(90deg, ${timerColor}, ${timerColor}dd)`,
                  boxShadow: `0 0 10px ${timerColor}80`
                }}
              />
            </div>
          </div>
        </div>

        {/* Display windshield screen */}
        <div className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center py-4">
          
          {/* Question windshield */}
          <div className={`w-full card-arcade border-4 p-5 md:p-6 shadow-2xl animate-slide-in-up relative
            ${gameState === GameState.FEEDBACK && !feedback.isCorrect ? 'border-rose-500 neon-glow-red bg-rose-950/40' : 'border-purple-500/50 neon-glow-purple bg-indigo-950/20'}`}>
            
            <div className="flex items-center gap-5">
              {/* Sign picture */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-xl scale-125"></div>
                {signImg ? (
                  <img 
                    src={signImg} 
                    alt={currentQuestion?.sign_name}
                    className="relative w-24 h-24 object-contain drop-shadow-lg animate-float"
                    style={{ animationDuration: '3.5s' }}
                  />
                ) : (
                  <div className="text-6xl w-24 text-center relative z-10">🚦</div>
                )}
              </div>

              {/* Text area */}
              <div className="flex-1 text-left">
                <span className="bg-purple-500 text-white text-[9px] font-black px-3 py-0.5 rounded-full uppercase tracking-wider shadow inline-block mb-1">
                  {currentQuestion?.sign_category}
                </span>
                <h3 className="text-white font-black text-lg md:text-xl drop-shadow mb-1 leading-tight">
                  {currentQuestion?.sign_name}
                </h3>
                <p className="text-white/80 font-bold text-xs md:text-sm leading-relaxed">
                  {currentQuestion?.question}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Arcade Console Options Panel */}
        <div className="w-full max-w-xl mx-auto flex flex-col gap-4">
          
          {gameState === GameState.PLAYING ? (
            /* Answer Option Buttons */
            <div className="w-full flex flex-col gap-3.5">
              {currentQuestion?.options.map((option, idx) => {
                const btnStyle = idx === 0 ? 'btn-arcade-blue' : 'btn-arcade-yellow';
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option, idx)}
                    className={`w-full py-4 text-sm md:text-base ${btnStyle}`}
                  >
                    <span className="bg-black/20 text-white w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                      {['A', 'B'][idx]}
                    </span>
                    <span className="flex-1 text-left px-2 leading-snug">{option.option_text}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Feedback Overlay Box */
            feedback && (
              <div className={`w-full card-arcade border-4 p-5 animate-pop flex flex-col gap-4
                ${feedback.isCorrect ? 'border-emerald-500 neon-glow-green bg-emerald-950/20' : 'border-rose-500 neon-glow-red bg-rose-950/20'}`}>
                
                <div className="flex items-start gap-3">
                  <span className="text-4xl bg-slate-950 p-2 rounded-2xl border border-white/10">
                    {feedback.isCorrect ? '🎉' : '❌'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white font-black text-lg tracking-wider">
                      {feedback.isCorrect ? 'BENAR!' : 'YAH, KURANG TEPAT!'}
                    </p>
                    <p className="text-white/85 text-xs font-semibold leading-relaxed mt-1">
                      {feedback.message}
                    </p>
                  </div>
                </div>

                {/* Score popups */}
                {feedback.isCorrect && feedback.gained && (
                  <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2 rounded-xl border border-white/5 shadow self-start text-xs">
                    <span className="text-yellow-400 font-black">+{feedback.gained} Poin</span>
                    {feedback.comboBonus > 0 && <span className="text-orange-400 font-black">🔥 Combo +{feedback.comboBonus}</span>}
                    {feedback.timeBonus > 0 && <span className="text-cyan-400 font-black">⚡ Cepat +{feedback.timeBonus}</span>}
                  </div>
                )}

                {lives > 0 && (
                  <button 
                    onClick={handleNext}
                    className={`w-full py-4 text-base ${feedback.isCorrect ? 'btn-arcade-green' : 'btn-arcade-red'}`}
                  >
                    {currentIdx + 1 >= questions.length ? '🏆 LIHAT HASIL AKHIR' : '➡️ SOAL BERIKUTNYA'}
                  </button>
                )}
              </div>
            )
          )}

        </div>

      </div>
    </div>
  );
};

export default ChallengePage;
