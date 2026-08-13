// src/pages/LuckyWheel.jsx
import { useState, useContext, useEffect } from 'react';
import { Gift, Sparkles, XCircle, Ticket, Copy, CheckCircle, Frown } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const PRIZES = [
  { id: 1, text: 'Voucher 5%', color: '#dc2626', type: 'voucher' },
  { id: 2, text: 'Chúc May M?n', color: '#1f2937', type: 'miss' },
  { id: 3, text: 'Voucher 200K', color: '#dc2626', type: 'voucher' },
  { id: 4, text: 'Voucher 50K', color: '#1f2937', type: 'voucher' },
  { id: 5, text: 'Voucher 500K', color: '#dc2626', type: 'voucher' },
  { id: 6, text: 'Chúc May M?n', color: '#1f2937', type: 'miss' },
  { id: 7, text: 'Voucher 10%', color: '#dc2626', type: 'voucher' },
  { id: 8, text: 'Voucher 100K', color: '#1f2937', type: 'voucher' },
];

const LuckyWheel = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [spinsLeft, setSpinsLeft] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [prizeWin, setPrizeWin] = useState(null);
  const [wonCode, setWonCode] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (user) setSpinsLeft(user.luckySpins || 0);
  }, [user]);

  const spinWheel = () => {
    if (!user) {
      alert("Vui lòng dang nh?p d? tham gia vòng quay!");
      navigate('/login');
      return;
    }
    if (spinsLeft <= 0) {
      alert("B?n dã h?t lu?t quay! Mua thêm s?n ph?m d? nh?n lu?t nhé.");
      return;
    }
    if (isSpinning) return;

    setIsSpinning(true);
    setSpinsLeft(prev => prev - 1);
    setPrizeWin(null);
    setIsCopied(false);

    const newDegree = Math.floor(Math.random() * 360) + (360 * 8);
    const totalRotation = rotation + newDegree;
    setRotation(totalRotation);

    setTimeout(async () => {
      const actualDegree = totalRotation % 360;
      const sliceAngle = 360 / PRIZES.length;
      const winningIndex = Math.floor((360 - (actualDegree % 360) + (sliceAngle / 2)) % 360 / sliceAngle);
      const wonPrize = PRIZES[winningIndex];

      try {
        const res = await API.post('/users/claim-prize', { prize: wonPrize });
        setSpinsLeft(res.data.luckySpins);
        if (res.data.voucherCode) {
          setWonCode(res.data.voucherCode);
        }
      } catch (error) {
        console.error("L?i khi luu k?t qu?:", error);
        alert("Vòng quay b? l?i ng?m! Vui lòng ki?m tra l?i Backend.");
      }

      setPrizeWin(wonPrize);
      setIsSpinning(false);
    }, 5000);
  };

  const copyToClipboard = () => {
    if (wonCode) {
      navigator.clipboard.writeText(wonCode);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCloseModal = () => {
    setPrizeWin(null);
    setIsCopied(false);
  };

  return (
    <div className="min-h-[85vh] bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>

      <div className="relative z-10 text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-yellow-400 uppercase drop-shadow-[0_0_15px_rgba(250,204,21,0.8)] flex items-center justify-center gap-3 mb-3">
          <Sparkles size={40} className="animate-pulse" /> Vòng Quay May M?n <Sparkles size={40} className="animate-pulse" />
        </h1>
        <div className="bg-black/50 border border-yellow-500/50 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
          <p className="text-white font-bold text-lg">
            B?n dang có: <span className="text-yellow-400 text-2xl mx-1 font-black">{spinsLeft}</span> lu?t quay
          </p>
        </div>
      </div>

      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-12 h-16 bg-yellow-400" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>

        <div
          className="w-full h-full rounded-full border-8 border-yellow-500 shadow-[0_0_40px_rgba(250,204,21,0.5)] overflow-hidden relative"
          style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 5s cubic-bezier(0.15, 0.8, 0.2, 1)' }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `conic-gradient(from -${360 / PRIZES.length / 2}deg, ${PRIZES.map((prize, i) => {
                const angle = 360 / PRIZES.length;
                return `${prize.color} ${i * angle}deg ${(i + 1) * angle}deg`;
              }).join(', ')})`
            }}
          ></div>

          <div className="absolute inset-0">
            {PRIZES.map((prize, index) => {
              const rotate = index * (360 / PRIZES.length);
              let Icon = Ticket;
              if (prize.type === 'miss') Icon = Frown;
              if (prize.type === 'gift') Icon = Gift;

              return (
                <div
                  key={`content-${prize.id}`}
                  className="absolute w-[80px] h-[90px] flex flex-col items-center justify-start pt-3 z-10"
                  style={{
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) rotate(${rotate}deg) translateY(-100px)`
                  }}
                >
                  <Icon
                    size={32}
                    className={prize.type === 'miss' ? 'text-gray-400' : 'text-yellow-300'}
                    style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.6))' }}
                  />
                  <span
                    className="text-white font-black uppercase text-[11px] md:text-xs text-center mt-1 leading-tight"
                    style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}
                  >
                    {prize.text.replace('Voucher ', '')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={spinWheel}
          disabled={isSpinning}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 rounded-full z-30 font-black uppercase text-red-800 shadow-2xl border-4 border-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 disabled:scale-100 disabled:opacity-80"
        >
          {isSpinning ? '...' : 'QUAY'}
        </button>
      </div>

      {prizeWin && (
        <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(250,204,21,0.4)] transform scale-100 animate-in zoom-in-95">

            <button onClick={handleCloseModal} className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors">
              <XCircle size={28} />
            </button>

            {prizeWin.type === 'miss' && (
              <>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-black text-gray-800 uppercase mb-2">Tru?t m?t r?i!</h3>
                <p className="text-gray-600 font-bold">Hãy th? v?n may ? lu?t quay ti?p theo nhé. Chúc b?n may m?n l?n sau!</p>
              </>
            )}

            {prizeWin.type === 'gift' && (
              <>
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <Gift size={48} className="text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-red-600 uppercase mb-2">Trúng L?n R?i!</h3>
                <p className="text-gray-600 font-bold mb-4">Ph?n quà c?a b?n là:</p>
                <div className="bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-xl py-3 px-4 rounded-xl uppercase shadow-lg">
                  {prizeWin.text}
                </div>
                <p className="text-xs text-gray-500 mt-4 font-bold">* Quà t?ng s? du?c dóng gói và g?i kèm trong don hàng ti?p theo c?a b?n.</p>
              </>
            )}

            {(prizeWin.type === 'voucher' || prizeWin.type === 'vouchert') && (
              <>
                <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket size={48} className="text-yellow-600" />
                </div>
                <h3 className="text-2xl font-black text-yellow-600 uppercase mb-2">Nh?n L?c Li?n Tay!</h3>
                <p className="text-gray-600 font-bold mb-4">B?n v?a nh?n du?c 1 Voucher gi?m giá:</p>

                <div className="relative bg-red-50 border-2 border-dashed border-red-300 rounded-xl p-4 mb-4">
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r-2 border-dashed border-red-300"></div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l-2 border-dashed border-red-300"></div>

                  <div className="font-black text-2xl text-red-600 uppercase mb-1">{prizeWin.text}</div>
                  <div className="text-gray-500 text-xs font-bold mb-3">H?n s? d?ng: 30 ngày</div>

                  {wonCode && (
                    <button
                      onClick={copyToClipboard}
                      className="w-full bg-red-600 hover:bg-black text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      {isCopied ? <><CheckCircle size={18} /> Ðã chép mã</> : <><Copy size={18} /> {wonCode}</>}
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 font-bold">* Voucher dã du?c t? d?ng luu vào <span className="text-red-600">Ví X-Billiard</span> c?a b?n.</p>
              </>
            )}

            <button
              onClick={handleCloseModal}
              className="mt-6 font-bold text-gray-400 hover:text-gray-800 underline transition-colors"
            >
              Ðóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LuckyWheel;
