import { useState, useEffect, useContext } from 'react';
import { Trophy, Users, Medal, Award, Clock, MapPin, Star, CalendarDays } from 'lucide-react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const TournamentPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTournament, setActiveTournament] = useState(null);
  const isVisible = true;

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const res = await api.get('/tournaments');
      const data = res.data;
      // Build list even if wrapper key differs
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.tournaments)
          ? data.tournaments
          : [];
      setTournaments(list);
    } catch (err) {
      console.error("Lỗi tải giải đấu:", err);
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e, tournamentId) => {
    e.stopPropagation();
    if (!user) {
      alert('Vui lòng đăng nhập để đăng ký giải đấu');
      navigate('/login');
      return;
    }

    try {
      await api.post(`/tournaments/${tournamentId}/register`);
      alert('Đăng ký giải đấu thành công!');
      fetchTournaments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Đăng ký thất bại');
    }
  };

  const handleUnregister = async (e, tournamentId) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc muốn hủy đăng ký?')) return;

    try {
      await api.post(`/tournaments/${tournamentId}/unregister`);
      alert('Hủy đăng ký thành công');
      fetchTournaments();
    } catch (err) {
      alert(err.response?.data?.msg || 'Hủy đăng ký thất bại');
    }
  };

  const isRegistered = (tournament) => {
    if (!user || !tournament.players) return false;
    return tournament.players.some(p => p.user && p.user._id === user.id);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrize = (prize) => {
    if (!prize && prize !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(prize) + 'đ';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <Trophy size={48} className="text-red-600 animate-spin mx-auto mb-4" />
          <p className="text-xl font-bold">Đang tải danh sách giải đấu...</p>
        </div>
      </div>
    );
  }

  const displayList = tournaments;

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* === HERO SECTION === */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/30 via-gray-950 to-gray-950"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.4), transparent 50%),
                           radial-gradient(circle at 80% 20%, rgba(220, 38, 38, 0.3), transparent 50%),
                           radial-gradient(circle at 60% 80%, rgba(220, 38, 38, 0.2), transparent 50%)`
        }}></div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-500/50 px-6 py-2 rounded-full mb-8 animate-pulse">
              <Star size={18} className="text-red-500" />
              <span className="text-red-400 font-black text-sm uppercase tracking-widest">Giải đấu chính thức 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-red-500">
                GIẢI ĐẤU
              </span>
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700">
                  BILLIARD
                </span>
                <span className="absolute -right-4 -top-2 animate-bounce">
                  <Trophy size={48} className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" />
                </span>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-300 font-bold max-w-3xl mx-auto mb-10 leading-relaxed">
              Tổ chức các giải đấu cấp cao dành cho cơ thủ hạng H & I, tổng giải thưởng lên đến
              <span className="text-red-500 font-black text-2xl md:text-3xl mx-2 animate-pulse">10 TRIỆU ĐỒNG</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <a href="#tournaments" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]">
                Xem giải đấu
              </a>
              <a href="#register" className="border-2 border-white/30 hover:border-white text-white px-10 py-4 rounded-full font-black uppercase tracking-wide transition-all duration-300 hover:bg-white hover:text-gray-900">
                Đăng ký ngay
              </a>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent"></div>
      </div>

      {/* === STATS BAR === */}
      <div className="relative z-20 -mt-12 max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-red-500 mb-2">
                {displayList.length}+
              </div>
              <div className="text-sm text-gray-400 font-bold">Giải đấu đang mở</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-yellow-500 mb-2">10M</div>
              <div className="text-sm text-gray-400 font-bold">Giải thưởng max</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-white mb-2">
                {displayList.reduce((sum, t) => sum + (t.players?.length || 0), 0)}+
              </div>
              <div className="text-sm text-gray-400 font-bold">Cơ thủ đã đăng ký</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-5xl font-black text-red-500 mb-2">H,I</div>
              <div className="text-sm text-gray-400 font-bold">Hạng thi đấu</div>
            </div>
          </div>
        </div>
      </div>

      {/* === MAIN CONTENT === */}
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-24">

        {/* === THÔNG TIN GIẢI ĐẤU === */}
        <section id="tournaments" className="scroll-mt-24">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-500">GIẢI ĐẤU SẮP DIỄN RA</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
            <p className="text-gray-400 font-bold mt-4 max-w-2xl mx-auto">
              Tham gia các giải đấu chuyên nghiệp, cơ hội đua tranh giải thưởng khổng lồ
            </p>
          </div>

          {displayList.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
              <Trophy size={48} className="text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-lg">Chưa có giải đấu nào được tạo.</p>
              <p className="text-gray-500 font-bold mt-2">Vui lòng liên hệ Admin để tạo giải đấu mới.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {displayList.map((tournament) => {
                const registeredCount = tournament.players?.length || 0;
                const alreadyRegistered = isRegistered(tournament);

                return (
                  <div
                    key={tournament._id}
                    onClick={() => setActiveTournament(tournament)}
                    className={`group relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer
                      ${activeTournament?._id === tournament._id
                        ? 'border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.4)] scale-[1.02]'
                        : 'border-gray-700 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:-translate-y-1'}`}
                  >
                    {/* Glow effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    {/* Header */}
                    <div className="bg-black/40 p-6 border-b border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full mb-3 border text-xs font-black ${
                            tournament.status === 'registering'
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : tournament.status === 'upcoming'
                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          }`}>
                            {tournament.status === 'registering' ? 'Đang đăng ký' :
                             tournament.status === 'upcoming' ? 'Sắp diễn ra' : tournament.status}
                          </span>
                          <h3 className="text-xl font-black text-white group-hover:text-red-400 transition-colors">
                            {tournament.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-red-500 font-black text-lg">{formatPrize(tournament.prize)}</div>
                          <div className="text-xs text-gray-500 font-bold">GIẢI THƯỞNG</div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <CalendarDays size={18} className="text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-300 font-bold">{formatDate(tournament.date)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin size={18} className="text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-300 font-bold">{tournament.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Award size={18} className="text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-300 font-bold">{tournament.class}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Trophy size={18} className="text-red-500 flex-shrink-0" />
                          <span className="text-sm text-gray-300 font-bold">{tournament.format}</span>
                        </div>
                      </div>

                      {/* Players list preview */}
                      {tournament.players && tournament.players.length > 0 && (
                        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                          <div className="text-xs text-gray-500 font-bold mb-2">CƠ THỦ ĐÃ ĐĂNG KÝ:</div>
                          <div className="flex flex-wrap gap-2">
                            {tournament.players.slice(0, 6).map((p, idx) => (
                              <span key={idx} className="bg-red-600/20 text-red-300 text-xs font-bold px-2 py-1 rounded-full border border-red-500/20">
                                {p.user?.name || 'Cơ thủ #' + (idx + 1)}
                              </span>
                            ))}
                            {tournament.players.length > 6 && (
                              <span className="bg-gray-700 text-gray-300 text-xs font-bold px-2 py-1 rounded-full">
                                +{tournament.players.length - 6} nữa
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                        <div>
                          <div className="text-xs text-gray-500 font-bold mb-1">Đăng ký</div>
                          <div className="text-white font-black">
                            {registeredCount}/{tournament.maxPlayers}
                            <span className="text-xs text-gray-500 font-normal ml-1">người</span>
                          </div>
                          <div className="w-32 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full"
                              style={{ width: `${Math.min((registeredCount / tournament.maxPlayers) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {alreadyRegistered ? (
                            <button
                              onClick={(e) => handleUnregister(e, tournament._id)}
                              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-5 py-2 rounded-full font-black text-sm transition-all hover:scale-105"
                            >
                              Hủy đăng ký
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleRegister(e, tournament._id)}
                              disabled={registeredCount >= tournament.maxPlayers}
                              className={`px-5 py-2 rounded-full font-black text-sm transition-all hover:scale-105 ${
                                registeredCount >= tournament.maxPlayers
                                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                  : 'bg-red-600 hover:bg-red-500 text-white'
                              }`}
                            >
                              {registeredCount >= tournament.maxPlayers ? 'Hết chỗ' : 'Đăng ký'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* === THÔNG TIN THI ĐẤU === */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-500">THÔNG TIN THI ĐẤU</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-red-400 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Trophy size={24} className="text-red-600" />, title: 'Giải đấu chính thức', desc: 'Cơ thủ hạng H & I thi đấu theo luật pool 8 bi tiêu chuẩn quốc tế.' },
              { icon: <Medal size={24} className="text-red-600" />, title: 'Giải thưởng khổng lồ', desc: `Tổng giải thưởng lên đến ${new Intl.NumberFormat('vi-VN').format(10000000)}đ cho nhà vô địch.` },
              { icon: <Users size={24} className="text-red-600" />, title: 'Cộng đồng cơ thủ', desc: 'Kết nối, giao lưu cùng những tay cơ đình đám khắp cả nước.' },
              { icon: <Award size={24} className="text-red-600" />, title: 'Cơ thủ Hạng H & I', desc: 'Đối tượng: cơ thủ đã thi đấu giải VĐQG hoặc hạng cao từ Hạng I trở lên.' },
            ].map((rule, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-red-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(220,38,38,0.2)] relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-600/20 to-red-900/30 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                  {rule.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-2 group-hover:text-red-400 transition-colors">
                  {rule.title}
                </h3>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* === ĐĂNG KÝ === */}
        <section id="register" className="scroll-mt-24">
          <div className="bg-gradient-to-br from-red-900/20 via-gray-900 to-red-900/20 rounded-3xl border border-red-500/20 p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `radial-gradient(circle at 30% 50%, rgba(220, 38, 38, 0.5), transparent 60%),
                               radial-gradient(circle at 70% 50%, rgba(220, 38, 38, 0.5), transparent 60%)`
            }}></div>

            <div className="relative z-10">
              <Trophy size={64} className="text-red-500 mx-auto mb-6 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-black uppercase mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-red-500">
                  Sẵn sàng thi đấu?
                </span>
              </h2>
              <p className="text-gray-300 font-bold mb-4 max-w-2xl mx-auto text-lg">
                Đăng ký ngay hôm nay để giành cơ hội vô địch và nhận giải thưởng lên đến 10 triệu đồng.
              </p>

              <div className="bg-black/40 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto mb-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Users size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-gray-300 font-bold">Đối tượng: Cơ thủ hạng H & I đã thi đấu VĐQG</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-gray-300 font-bold">Thời gian đăng ký: Đến 7 ngày trước giải đấu</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-red-500 flex-shrink-0" />
                  <span className="text-gray-300 font-bold">Địa điểm: CLB Billiard X-Billiard / Livestream</span>
                </div>
              </div>

              <a
                href="tel:0836204777"
                className="inline-flex items-center gap-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
              >
                Đăng ký ngay: 0836 204 777
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* === FOOTER DECORATION === */}
      <div className="h-24 bg-gradient-to-t from-gray-950 to-transparent"></div>
    </div>
  );
};

export default TournamentPage;
