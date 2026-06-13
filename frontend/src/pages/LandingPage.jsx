import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import polisiImg from '../assets/characters/polisi1.png';
import polisi2Img from '../assets/characters/polisi2.png';
import motorImg from '../assets/characters/asetmotor.png';

const SAFETY_TIPS = [
  "Halo teman-teman! Selalu gunakan helm saat berkendara ya! 🪖",
  "Patuhi rambu lalu lintas, karena keselamatan adalah yang utama! 🚦",
  "Sebelum menyeberang jalan lewat zebra cross, tengok kanan-kiri dulu ya! 👀",
  "Rambu Larangan berwarna merah artinya tidak boleh dilakukan demi keselamatan! 🛑",
  "Rambu Peringatan berwarna kuning mengingatkan kita akan kondisi jalan yang berbahaya! ⚠️",
  "Jangan menggunakan handphone saat berjalan atau bersepeda di jalan raya! 📱",
  "Sabar mengalah di jalan sempit adalah ciri pengguna jalan yang bijak! 🤝",
  "Batas kecepatan dipasang agar kita punya cukup waktu mengerem jika ada bahaya! 🐢"
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentTip, setCurrentTip] = useState(SAFETY_TIPS[0]);
  const [activePolisi, setActivePolisi] = useState(1);

  // Ganti tips secara otomatis setiap 5 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIdx = Math.floor(Math.random() * SAFETY_TIPS.length);
      setCurrentTip(SAFETY_TIPS[randomIdx]);
      setActivePolisi(prev => (prev === 1 ? 2 : 1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStartGame = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/progress/start');
      localStorage.setItem('sessionId', response.data.session_id);
      // Reset progress lokal
      localStorage.setItem('unlockedLevels', JSON.stringify([1]));
      localStorage.setItem('completedLevels', JSON.stringify([]));
      navigate('/map');
    } catch (error) {
      console.error("Gagal memulai game:", error);
      // Fallback lokal
      localStorage.setItem('unlockedLevels', JSON.stringify([1]));
      localStorage.setItem('completedLevels', JSON.stringify([]));
      navigate('/map');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChallenge = () => {
    navigate('/challenge');
  };

  const changeTipManual = (polisiNum) => {
    setActivePolisi(polisiNum);
    const randomIdx = Math.floor(Math.random() * SAFETY_TIPS.length);
    setCurrentTip(SAFETY_TIPS[randomIdx]);
  };

  const features = [
    { icon: '🚦', title: '12 Rambu Utama', desc: 'Pelajari rambu prioritas pencegah risiko di jalan raya.', color: 'from-amber-400 to-yellow-500' },
    { icon: '🗺️', title: 'Peta 2 Stage', desc: 'Selesaikan Stage Peringatan dan Stage Larangan.', color: 'from-emerald-400 to-green-500' },
    { icon: '⚡', title: 'Mode Tantangan', desc: 'Uji refleks dan pengetahuanmu melawan detik waktu!', color: 'from-purple-500 to-pink-500' },
    { icon: '💡', title: 'Adulting 101', desc: 'Bekal kecakapan hidup keselamatan jalan sejak dini.', color: 'from-sky-400 to-blue-500' },
  ];

  return (
    <div className="min-h-screen font-kids flex flex-col justify-between overflow-hidden relative bg-gradient-to-b from-[#0b0f19] via-[#111827] to-[#1e293b]">
      
      {/* Stars Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 50 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: Math.random() * 3 + 2 + 's',
            }}
          />
        ))}
        {/* Clouds */}
        <div className="absolute top-12 left-0 w-full flex justify-between px-20 opacity-20">
          <span className="text-8xl animate-float" style={{ animationDuration: '6s' }}>☁️</span>
          <span className="text-6xl animate-float" style={{ animationDuration: '8s', animationDelay: '1s' }}>☁️</span>
        </div>
      </div>

      {/* Floating Moon */}
      <div className="absolute top-8 right-12 text-6xl drop-shadow-[0_0_20px_rgba(253,224,71,0.3)] animate-float" style={{ animationDuration: '5s' }}>🌙</div>

      {/* Title & Speech Bubble Section */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 pt-10 flex flex-col items-center">
        
        {/* Title Group with Outer Glow */}
        <div className="text-center mb-8 relative">
          {/* Neon outer circle glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
          
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-yellow-300 tracking-wider drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: '2px #0f172a' }}>
            TRAFFIC SIGN
          </h1>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 tracking-wide mt-1 drop-shadow-[0_8px_12px_rgba(0,0,0,0.8)]"
              style={{ WebkitTextStroke: '2px #0f172a' }}>
            ADVENTURE
          </h1>
          <p className="text-white/80 font-black text-sm md:text-base tracking-widest mt-3 bg-slate-900/60 px-6 py-1.5 rounded-full border border-white/10 shadow-lg inline-block">
            🚨 12 RAMBU PRIORITAS, PRIORITASKAN KESELAMATAN!
          </p>
        </div>

        {/* Mascot & Speech Bubble */}
        <div className="w-full max-w-2xl flex flex-col items-center mb-8">
          
          {/* Speech Bubble */}
          <div className="relative bg-white text-slate-800 font-bold p-5 rounded-3xl border-4 border-slate-900 shadow-[0_10px_0_#0f172a] max-w-xl text-center mb-6 animate-pop">
            {/* Arrow */}
            <div className="absolute bottom-[-18px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[15px] border-t-slate-900"></div>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white"></div>
            
            <p className="text-sm md:text-base leading-relaxed">
              {currentTip}
            </p>
          </div>

          {/* Maskot Polisi - Interactive hover */}
          <div className="flex justify-center gap-12">
            <div 
              onClick={() => changeTipManual(1)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activePolisi === 1 ? 'scale-110 drop-shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-95'}`}
            >
              <img src={polisiImg} alt="Polisi Regina" className="h-24 md:h-32 object-contain animate-float" style={{ animationDuration: '4s' }} />
              <span className="text-xs bg-sky-500 text-white font-black px-3 py-1 rounded-full border border-sky-600 shadow-md mt-2">
                👮 Regina (Concept Lead)
              </span>
            </div>
            
            <div 
              onClick={() => changeTipManual(2)}
              className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${activePolisi === 2 ? 'scale-110 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]' : 'scale-90 opacity-60 hover:opacity-100 hover:scale-95'}`}
            >
              <img src={polisi2Img} alt="Polisi Fatur" className="h-24 md:h-32 object-contain animate-float" style={{ animationDuration: '4s', animationDelay: '0.5s' }} />
              <span className="text-xs bg-pink-500 text-white font-black px-3 py-1 rounded-full border border-pink-600 shadow-md mt-2">
                👮 Fatur (Design Planner)
              </span>
            </div>
          </div>
        </div>

        {/* Main Arcade Control Panel */}
        <div className="w-full max-w-xl card-arcade p-8 border border-white/20 shadow-2xl relative mb-10">
          
          <div className="text-center mb-6">
            <h3 className="text-yellow-400 text-lg font-black tracking-widest">PILIH MODE PERMAINAN</h3>
            <div className="w-32 h-1 bg-yellow-400 mx-auto mt-1 rounded-full"></div>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button 
              onClick={handleStartGame}
              disabled={isLoading}
              className="flex-1 btn-arcade-yellow text-xl py-4 px-8"
            >
              🎮 {isLoading ? 'MEMULAI...' : 'PETUALANGAN'}
            </button>
            <button 
              onClick={handleChallenge}
              className="flex-1 btn-arcade-purple text-xl py-4 px-8"
            >
              ⚡ TANTANGAN
            </button>
          </div>
          
          <p className="text-center text-white/50 text-xs font-semibold mt-4 tracking-wider">
            Tema: Adulting 101: The Junior Edition (Untuk SMP Usia 12-15 Tahun)
          </p>
        </div>

      </div>

      {/* Parallax road city loop */}
      <div className="relative w-full z-10">
        
        {/* Asphalt Road */}
        <div className="h-24 bg-gradient-to-b from-[#2e3745] to-[#1e232b] relative overflow-hidden border-t-4 border-slate-700 shadow-inner">
          
          {/* Animated road stripes */}
          <div className="absolute top-1/2 left-0 w-[200%] h-3 -translate-y-1/2 flex gap-10" 
               style={{ animation: 'road-move 2s linear infinite' }}>
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-full w-20 bg-yellow-400 opacity-80 rounded flex-shrink-0"></div>
            ))}
          </div>
          
          {/* Side barrier stripes */}
          <div className="absolute top-0 left-0 w-full h-1 bg-white opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white opacity-40"></div>

          {/* Scrolling Vehicles */}
          <div className="absolute bottom-5 text-4xl" style={{ animation: 'car-move 6s linear infinite' }}>🚗</div>
          <div className="absolute bottom-5 text-3xl" style={{ animation: 'car-move 9s linear 2s infinite' }}>🚙</div>
          <div className="absolute bottom-5 text-4xl" style={{ animation: 'car-move 7s linear 4.5s infinite' }}>🚒</div>
        </div>

        {/* Sidewalk */}
        <div className="h-4 bg-gradient-to-r from-stone-400 via-stone-300 to-stone-400 border-t-2 border-stone-500 shadow-md"></div>
      </div>

      {/* Feature cards section */}
      <div className="relative z-10 px-4 py-8 bg-[#0b0f19]/80 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {features.map((feat, idx) => (
              <div 
                key={idx}
                className="card-arcade p-5 border border-white/5 hover:border-white/20 hover:scale-105 transition-all duration-300 flex flex-col items-center text-center shadow-lg relative group overflow-hidden"
              >
                {/* Glow Overlay */}
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="text-5xl mb-3 animate-float" style={{ animationDuration: `${3.5 + idx * 0.5}s` }}>
                  {feat.icon}
                </div>
                <h4 className="text-white font-black text-base tracking-wide mb-1">{feat.title}</h4>
                <p className="text-white/60 text-xs font-semibold leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>

          {/* Motor animatif dan footer */}
          <div className="flex flex-col items-center mt-10">
            <img 
              src={motorImg} 
              alt="Motor" 
              className="h-28 md:h-36 drop-shadow-[0_15px_20px_rgba(0,0,0,0.6)] animate-bounce-slow"
            />
            <p className="text-white/40 text-xs mt-6 text-center font-bold tracking-widest">
              PRODI TEKNOLOGI INFORMASI • FAKULTAS TEKNIK • UNIVERSITAS MUHAMMADIYAH YOGYAKARTA © 2026
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;