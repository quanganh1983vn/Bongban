import React, { useState, useMemo, useEffect } from 'react';
import { Athlete, Match, TeamStats, Rank } from './types';
import AthleteCard from './components/AthleteCard';
import RankBadge from './components/RankBadge';
import LoginModal from './components/LoginModal';
import { analyzeMatchup } from './services/geminiService';
import { 
  Trophy, 
  Users, 
  PlusCircle, 
  Search, 
  Activity, 
  LayoutDashboard, 
  Swords, 
  Medal,
  BrainCircuit,
  Save,
  Trash2,
  Lock,
  LogOut,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

// --- Helper Functions ---
const getRankFromPoints = (points: number): Rank => {
  if (points >= 1000) return 'A';
  if (points >= 900) return 'B';
  if (points >= 700) return 'C';
  if (points >= 600) return 'D';
  if (points >= 500) return 'E';
  if (points >= 400) return 'F';
  if (points >= 300) return 'G';
  return 'H';
};

const getRangeFromRank = (rank: Rank): string => {
    switch (rank) {
      case 'A': return '1000+';
      case 'B': return '900-999';
      case 'C': return '700-899';
      case 'D': return '600-699';
      case 'E': return '500-599';
      case 'F': return '400-499';
      case 'G': return '300-399';
      case 'H': return '200-299';
      default: return '';
    }
}

// --- Mock Data ---
const INITIAL_ATHLETES: Athlete[] = [
  { id: '1', name: 'Nguyễn Văn A', team: 'CLB Hà Nội', points: 1050, avatarUrl: 'https://picsum.photos/seed/1/200/200', gender: 'Nam', matchesPlayed: 20, wins: 18 },
  { id: '2', name: 'Trần Thị B', team: 'Hỏa Châu', points: 750, avatarUrl: 'https://picsum.photos/seed/2/200/200', gender: 'Nữ', matchesPlayed: 15, wins: 10 },
  { id: '3', name: 'Lê Văn C', team: 'CLB Hà Nội', points: 550, avatarUrl: 'https://picsum.photos/seed/3/200/200', gender: 'Nam', matchesPlayed: 12, wins: 6 },
  { id: '4', name: 'Phạm Văn D', team: 'Bóng Bàn Việt', points: 320, avatarUrl: 'https://picsum.photos/seed/4/200/200', gender: 'Nam', matchesPlayed: 5, wins: 1 },
  { id: '5', name: 'Hoàng Long', team: 'Hỏa Châu', points: 920, avatarUrl: 'https://picsum.photos/seed/5/200/200', gender: 'Nam', matchesPlayed: 22, wins: 15 },
  { id: '6', name: 'Đặng Mai', team: 'Bóng Bàn Việt', points: 610, avatarUrl: 'https://picsum.photos/seed/6/200/200', gender: 'Nữ', matchesPlayed: 10, wins: 5 },
];

const INITIAL_MATCHES: Match[] = [
  { id: 'm1', date: '2023-10-01', type: 'Don', team1Ids: ['1'], team2Ids: ['5'], score1: 3, score2: 1, winnerTeam: 1 },
  { id: 'm2', date: '2023-10-02', type: 'Doi', team1Ids: ['2', '6'], team2Ids: ['3', '4'], score1: 2, score2: 3, winnerTeam: 2 },
];

// --- Main App Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'athletes' | 'matches' | 'register'>('dashboard');
  const [athletes, setAthletes] = useState<Athlete[]>(INITIAL_ATHLETES);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auth State
  const [currentTeam, setCurrentTeam] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Derived State: Top Athlete
  const topAthlete = useMemo(() => {
    return [...athletes].sort((a, b) => b.points - a.points)[0];
  }, [athletes]);

  // Derived State: Team Stats & List
  const { teamStats, uniqueTeams } = useMemo(() => {
    const stats: Record<string, TeamStats> = {};
    const teamsSet = new Set<string>();
    
    athletes.forEach(a => {
      teamsSet.add(a.team);
      if (!stats[a.team]) {
        stats[a.team] = { name: a.team, totalPoints: 0, memberCount: 0 };
      }
      stats[a.team].totalPoints += a.points;
      stats[a.team].memberCount += 1;
    });
    return {
        teamStats: Object.values(stats).sort((a, b) => b.totalPoints - a.totalPoints),
        uniqueTeams: Array.from(teamsSet).sort()
    };
  }, [athletes]);

  // --- Handlers ---
  const handleAddAthlete = (newAthlete: Omit<Athlete, 'id' | 'matchesPlayed' | 'wins'>) => {
    const athlete: Athlete = {
      ...newAthlete,
      id: Date.now().toString(),
      matchesPlayed: 0,
      wins: 0
    };
    setAthletes([...athletes, athlete]);
    setActiveTab('athletes');
  };

  const handleAddMatch = (matchData: Omit<Match, 'id'>) => {
    const newMatch: Match = { ...matchData, id: Date.now().toString() };
    setMatches([newMatch, ...matches]);

    // Simple Point Update Logic
    const winners = matchData.winnerTeam === 1 ? matchData.team1Ids : matchData.team2Ids;
    const losers = matchData.winnerTeam === 1 ? matchData.team2Ids : matchData.team1Ids;

    const updatedAthletes = athletes.map(a => {
      if (winners.includes(a.id)) {
        return { ...a, points: a.points + 15, matchesPlayed: a.matchesPlayed + 1, wins: a.wins + 1 };
      }
      if (losers.includes(a.id)) {
        return { ...a, points: Math.max(0, a.points - 10), matchesPlayed: a.matchesPlayed + 1 };
      }
      return a;
    });

    setAthletes(updatedAthletes);
    setActiveTab('matches');
  };

  const handleLogin = (teamName: string) => {
    setCurrentTeam(teamName);
  };

  const handleLogout = () => {
    setCurrentTeam(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 md:pb-0">
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLogin={handleLogin}
        teams={uniqueTeams}
      />

      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white fixed h-full z-10">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Swords className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">PingPong Pro</h1>
              {currentTeam && (
                <div className="text-xs text-blue-300 font-medium mt-1 truncate max-w-[150px]">
                    Hi, {currentTeam}
                </div>
              )}
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<LayoutDashboard />} 
            label="Tổng quan" 
          />
          <NavButton 
            active={activeTab === 'athletes'} 
            onClick={() => setActiveTab('athletes')} 
            icon={<Users />} 
            label="Vận động viên" 
          />
          <NavButton 
            active={activeTab === 'matches'} 
            onClick={() => setActiveTab('matches')} 
            icon={<Trophy />} 
            label="Thi đấu & Kết quả" 
          />
          <NavButton 
            active={activeTab === 'register'} 
            onClick={() => setActiveTab('register')} 
            icon={<PlusCircle />} 
            label="Đăng ký mới" 
          />
        </nav>
        
        {/* Team Login/Logout Section Desktop */}
        <div className="p-4 border-t border-slate-800">
          {!currentTeam ? (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-200"
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Đăng nhập Đội</span>
            </button>
          ) : (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 w-full p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          )}
          <div className="mt-4 text-xs text-center text-slate-600">
            © 2024 PingPong Pro
          </div>
        </div>
      </aside>

      {/* Mobile Header (Top) */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-20 flex justify-between items-center p-4 shadow-md">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">PingPong Pro</span>
            {currentTeam && <span className="text-xs bg-blue-600 px-2 py-0.5 rounded text-white truncate max-w-[100px]">{currentTeam}</span>}
          </div>
          <div>
             {!currentTeam ? (
                <button onClick={() => setIsLoginModalOpen(true)} className="flex items-center gap-2 text-sm bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors">
                  <Lock className="w-4 h-4" />
                  <span>Login</span>
                </button>
             ) : (
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm text-red-400 bg-red-900/20 px-3 py-1.5 rounded-full">
                   <LogOut className="w-4 h-4" />
                   <span>Thoát</span>
                </button>
             )}
          </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-30 flex justify-between items-center px-6 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <LayoutDashboard className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Tổng quan</span>
        </button>
        <button 
            onClick={() => setActiveTab('athletes')} 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'athletes' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">VĐV</span>
        </button>
        <button 
            onClick={() => setActiveTab('matches')} 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${activeTab === 'matches' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <Trophy className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Thi đấu</span>
        </button>
        <button 
            onClick={() => setActiveTab('register')} 
            className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${activeTab === 'register' ? 'text-blue-600' : 'text-gray-400'}`}
        >
            <PlusCircle className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">Đăng ký</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 mt-16 md:mt-0 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardView 
            topAthlete={topAthlete} 
            teamStats={teamStats} 
            recentMatches={matches.slice(0, 5)} 
            athletes={athletes}
          />
        )}
        {activeTab === 'athletes' && (
          <AthletesView 
            athletes={athletes} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm} 
          />
        )}
        {activeTab === 'register' && (
          <RegistrationView 
            onRegister={handleAddAthlete} 
          />
        )}
        {activeTab === 'matches' && (
          <MatchesView 
            matches={matches} 
            athletes={athletes} 
            onAddMatch={handleAddMatch}
            currentTeam={currentTeam}
            teams={uniqueTeams}
          />
        )}
      </main>
    </div>
  );
}

// --- Sub-Components (Views) ---

const NavButton = ({ active, onClick, icon, label, locked }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full p-3 rounded-lg transition-all duration-200 group ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`}
  >
    <div className="flex items-center">
      <span className={`mr-3 ${active ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </div>
    {locked && <Lock className="w-3 h-3 text-slate-600 group-hover:text-slate-500" />}
  </button>
);

const DashboardView = ({ topAthlete, teamStats, recentMatches, athletes }: any) => (
  <div className="space-y-8 animate-fade-in">
    <header>
      <h2 className="text-3xl font-bold text-gray-900">Bảng điều khiển</h2>
      <p className="text-gray-500 mt-1">Tổng quan giải đấu và thống kê.</p>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Top Athlete Spotlight */}
      {topAthlete && (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden md:col-span-1 transform hover:scale-[1.02] transition-transform">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Trophy className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Medal className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider text-sm">VĐV Tiêu Biểu</span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <img 
                src={topAthlete.avatarUrl} 
                alt={topAthlete.name} 
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover" 
              />
              <div>
                <h3 className="text-2xl font-bold">{topAthlete.name}</h3>
                <p className="text-white/90">{topAthlete.team}</p>
                <div className="mt-2 bg-white/20 inline-block px-3 py-1 rounded-full text-sm font-semibold">
                  {topAthlete.points} Điểm (Hạng {getRankFromPoints(topAthlete.points)})
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="md:col-span-2 grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-gray-500 font-medium">Tổng VĐV</div>
          <div className="text-4xl font-bold text-slate-800">{athletes.length}</div>
          <div className="text-sm text-green-600 flex items-center mt-2">
            <Activity className="w-4 h-4 mr-1" /> Đang hoạt động
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="text-gray-500 font-medium">Đội mạnh nhất</div>
          <div className="text-2xl font-bold text-slate-800 truncate">
             {teamStats[0]?.name || 'Chưa có'}
          </div>
          <div className="text-sm text-blue-600 mt-2">
            {teamStats[0]?.totalPoints || 0} tổng điểm
          </div>
        </div>
      </div>
    </div>

    {/* Team Leaderboard */}
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-800">Xếp hạng Đội</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4 text-left">Hạng</th>
              <th className="px-6 py-4 text-left">Tên đội</th>
              <th className="px-6 py-4 text-center">Số thành viên</th>
              <th className="px-6 py-4 text-right">Tổng điểm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {teamStats.map((team: TeamStats, index: number) => (
              <tr key={team.name} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="px-6 py-4 font-medium text-gray-900">{team.name}</td>
                <td className="px-6 py-4 text-center text-gray-600">{team.memberCount}</td>
                <td className="px-6 py-4 text-right font-bold text-indigo-600">{team.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

const AthletesView = ({ athletes, searchTerm, setSearchTerm }: any) => {
  const filteredAthletes = athletes.filter((a: Athlete) => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh sách Vận động viên</h2>
          <p className="text-gray-500 text-sm">Quản lý hồ sơ và xếp hạng</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc đội..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAthletes.map((athlete: Athlete) => (
          <AthleteCard 
            key={athlete.id} 
            athlete={athlete} 
            rank={getRankFromPoints(athlete.points)} 
          />
        ))}
      </div>
      
      {filteredAthletes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          Không tìm thấy vận động viên nào phù hợp.
        </div>
      )}
    </div>
  );
};

const RegistrationView = ({ onRegister }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    team: '',
    points: 200,
    gender: 'Nam',
    avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`
  });

  // No longer checking for isAdmin here

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(formData);
    // Reset form mostly, keep generic values
    setFormData({
      name: '',
      team: '',
      points: 200,
      gender: 'Nam',
      avatarUrl: `https://picsum.photos/seed/${Date.now() + 1}/200/200`
    });
  };

  const rankPreview = getRankFromPoints(formData.points);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">Đăng ký Vận động viên</h2>
                <p className="text-gray-500 mt-1">Đăng ký thành viên tự do.</p>
             </div>
             <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">MỞ CÔNG KHAI</div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và Tên</label>
            <input
              required
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ví dụ: Nguyễn Văn A"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Đội / CLB</label>
            <input
              required
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Ví dụ: CLB Hà Nội"
              value={formData.team}
              onChange={e => setFormData({...formData, team: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính</label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.gender}
              onChange={e => setFormData({...formData, gender: e.target.value})}
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm khởi tạo (Hạng {rankPreview})
            </label>
            <input
              required
              type="number"
              min="0"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.points}
              onChange={e => setFormData({...formData, points: parseInt(e.target.value) || 0})}
            />
            <p className="text-xs text-gray-500 mt-1">
              Phạm vi: H(200-299), G(300-399)... A(1000+)
            </p>
          </div>
        </div>
        
        {/* Visual Preview */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center gap-4 border border-gray-200">
            <img src={formData.avatarUrl} className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" alt="Avatar Preview" />
            <div>
                <p className="font-semibold">{formData.name || 'Tên VĐV'}</p>
                <div className="flex items-center gap-2 mt-1">
                    <RankBadge rank={rankPreview} />
                    <span className="text-sm text-gray-600">{getRangeFromRank(rankPreview)} điểm</span>
                </div>
            </div>
            <button 
                type="button" 
                onClick={() => setFormData({...formData, avatarUrl: `https://picsum.photos/seed/${Date.now()}/200/200`})}
                className="ml-auto text-sm text-blue-600 hover:text-blue-800"
            >
                Đổi ảnh
            </button>
        </div>

        <div className="pt-4">
            <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all flex justify-center items-center gap-2"
            >
            <Save className="w-5 h-5" />
            Lưu hồ sơ
            </button>
        </div>
      </form>
    </div>
  );
};

const MatchesView = ({ matches, athletes, onAddMatch, currentTeam, teams }: any) => {
  const [isEntryMode, setIsEntryMode] = useState(false);
  const [matchType, setMatchType] = useState<'Don' | 'Doi'>('Don');
  const [selectedTeam1, setSelectedTeam1] = useState<string[]>([]);
  const [selectedTeam2, setSelectedTeam2] = useState<string[]>([]);
  const [scores, setScores] = useState({ s1: 0, s2: 0 });
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Verification State
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [guestPassword, setGuestPassword] = useState('');
  const [guestError, setGuestError] = useState('');
  const [guestTeamName, setGuestTeamName] = useState('');

  // Helper to get athlete object
  const getAthlete = (id: string) => athletes.find((a: Athlete) => a.id === id);

  // Check team logic for entry
  const canEnterResult = !!currentTeam;

  const handleStartEntry = () => {
    if (!canEnterResult) {
        alert("Vui lòng đăng nhập bằng tài khoản Đội để nhập kết quả.");
        return;
    }
    setIsEntryMode(!isEntryMode);
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validations
    if (scores.s1 === scores.s2) {
        alert("Bóng bàn không có hòa! Hãy nhập lại tỉ số.");
        return;
    }
    
    // Get Team Names
    const t1Athletes = selectedTeam1.map(id => getAthlete(id));
    const t2Athletes = selectedTeam2.map(id => getAthlete(id));
    
    const t1TeamName = t1Athletes[0]?.team;
    const t2TeamName = t2Athletes[0]?.team;

    // Validate if logged in user is part of Team 1
    if (t1TeamName !== currentTeam) {
        alert(`Bạn đang đăng nhập là "${currentTeam}". Bạn chỉ có thể nhập kết quả cho đội nhà là "${currentTeam}".`);
        return;
    }

    if (!t2TeamName) {
        alert("Vui lòng chọn đội khách hợp lệ.");
        return;
    }

    // Open Verification Modal for Team 2
    setGuestTeamName(t2TeamName);
    setVerificationModalOpen(true);
    setGuestPassword('');
    setGuestError('');
  };

  const handleFinalSubmit = () => {
      if (guestPassword === '123456') {
        onAddMatch({
            date: new Date().toISOString().split('T')[0],
            type: matchType,
            team1Ids: selectedTeam1,
            team2Ids: selectedTeam2,
            score1: scores.s1,
            score2: scores.s2,
            winnerTeam: scores.s1 > scores.s2 ? 1 : 2
        });
        setVerificationModalOpen(false);
        setIsEntryMode(false);
        resetForm();
      } else {
          setGuestError("Mật khẩu xác nhận không đúng (Mặc định: 123456)");
      }
  };

  const resetForm = () => {
    setSelectedTeam1([]);
    setSelectedTeam2([]);
    setScores({ s1: 0, s2: 0 });
    setAiAnalysis('');
  };

  const handleAiAnalyze = async () => {
    if (selectedTeam1.length === 0 || selectedTeam2.length === 0) return;
    
    setIsAnalyzing(true);
    setAiAnalysis('');
    
    const team1Data = selectedTeam1.map(id => getAthlete(id)).filter(Boolean) as Athlete[];
    const team2Data = selectedTeam2.map(id => getAthlete(id)).filter(Boolean) as Athlete[];

    const result = await analyzeMatchup(team1Data, team2Data, matches);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
        {/* Verification Modal */}
        {verificationModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in">
                    <div className="p-5 border-b bg-green-700 text-white flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 text-lg">
                            <ShieldCheck className="w-5 h-5" /> 
                            Xác thực Đội Khách
                        </h3>
                        <button onClick={() => setVerificationModalOpen(false)} className="hover:bg-green-800 p-1 rounded-full"><Trash2 className="w-4 h-4"/></button>
                    </div>
                    <div className="p-6 space-y-4">
                        <p className="text-gray-600 text-sm">
                            Đội <strong>{guestTeamName}</strong> vui lòng nhập mật khẩu để xác nhận kết quả này là chính xác.
                        </p>
                        <input 
                            type="password"
                            placeholder="Mật khẩu đội khách..."
                            className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                            value={guestPassword}
                            onChange={(e) => setGuestPassword(e.target.value)}
                        />
                        {guestError && <p className="text-red-500 text-xs">{guestError}</p>}
                        <button 
                            onClick={handleFinalSubmit}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg"
                        >
                            Xác nhận & Lưu
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Thi đấu</h2>
            <button 
                onClick={handleStartEntry}
                className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-colors ${isEntryMode ? 'bg-gray-200 text-gray-800' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
                {isEntryMode ? 'Hủy nhập' : '+ Nhập kết quả'}
            </button>
        </div>

        {!currentTeam && !isEntryMode && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-center gap-3 text-yellow-800 text-sm">
                <Lock className="w-4 h-4" />
                <span>Bạn cần đăng nhập tài khoản Đội để nhập kết quả thi đấu.</span>
            </div>
        )}

        {isEntryMode && (
            <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg">Nhập kết quả (Đội nhà: {currentTeam})</h3>
                    <div className="flex bg-indigo-800 rounded-lg p-1">
                        <button 
                            onClick={() => { setMatchType('Don'); setSelectedTeam1([]); setSelectedTeam2([]); }}
                            className={`px-3 py-1 rounded-md text-sm ${matchType === 'Don' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200'}`}
                        >
                            Đánh Đơn
                        </button>
                        <button 
                            onClick={() => { setMatchType('Doi'); setSelectedTeam1([]); setSelectedTeam2([]); }}
                            className={`px-3 py-1 rounded-md text-sm ${matchType === 'Doi' ? 'bg-white text-indigo-900 shadow' : 'text-indigo-200'}`}
                        >
                            Đánh Đôi
                        </button>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Team 1 Selection */}
                    <div className="md:col-span-5 space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Đội 1 (Chủ nhà: {currentTeam})</label>
                        <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-600 mb-2">Chỉ hiển thị VĐV thuộc đội {currentTeam}</div>
                        <select 
                            className="w-full p-2 border rounded"
                            onChange={(e) => {
                                const val = e.target.value;
                                if(val && !selectedTeam1.includes(val)) {
                                    if(matchType === 'Don' && selectedTeam1.length >= 1) return;
                                    if(matchType === 'Doi' && selectedTeam1.length >= 2) return;
                                    setSelectedTeam1([...selectedTeam1, val]);
                                }
                            }}
                            value=""
                        >
                            <option value="">-- Chọn VĐV đội nhà --</option>
                            {athletes.filter((a: Athlete) => 
                                a.team === currentTeam && // Strict Filter for Home Team
                                !selectedTeam1.includes(a.id)
                            ).map((a: Athlete) => (
                                <option key={a.id} value={a.id}>{a.name} ({a.points})</option>
                            ))}
                        </select>
                        <div className="space-y-2">
                            {selectedTeam1.map(id => {
                                const a = getAthlete(id);
                                return a ? (
                                    <div key={id} className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100">
                                        <img src={a.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{a.name}</p>
                                        </div>
                                        <button onClick={() => setSelectedTeam1(selectedTeam1.filter(pid => pid !== id))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>

                    {/* VS & Score */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center space-y-4 pt-8">
                        <div className="text-2xl font-black text-gray-300">VS</div>
                        <div className="flex gap-2">
                            <input 
                                type="number" 
                                min="0" 
                                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none" 
                                value={scores.s1}
                                onChange={e => setScores({...scores, s1: parseInt(e.target.value) || 0})}
                            />
                            <span className="text-2xl pt-4">:</span>
                            <input 
                                type="number" 
                                min="0" 
                                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 outline-none" 
                                value={scores.s2}
                                onChange={e => setScores({...scores, s2: parseInt(e.target.value) || 0})}
                            />
                        </div>
                    </div>

                    {/* Team 2 Selection */}
                    <div className="md:col-span-5 space-y-4">
                        <label className="block text-sm font-bold text-gray-700">Đội 2 (Khách)</label>
                        <select 
                             className="w-full p-2 border rounded"
                             onChange={(e) => {
                                 const val = e.target.value;
                                 if(val && !selectedTeam2.includes(val)) {
                                    if(matchType === 'Don' && selectedTeam2.length >= 1) return;
                                    if(matchType === 'Doi' && selectedTeam2.length >= 2) return;
                                     setSelectedTeam2([...selectedTeam2, val]);
                                 }
                             }}
                             value=""
                        >
                            <option value="">-- Chọn VĐV đội khách --</option>
                            {athletes.filter((a: Athlete) => 
                                a.team !== currentTeam && // Cannot play against own team in this simplified logic
                                !selectedTeam2.includes(a.id)
                            ).map((a: Athlete) => (
                                <option key={a.id} value={a.id}>[{a.team}] {a.name} ({a.points})</option>
                            ))}
                        </select>
                        <div className="space-y-2">
                            {selectedTeam2.map(id => {
                                const a = getAthlete(id);
                                return a ? (
                                    <div key={id} className="flex items-center gap-2 bg-red-50 p-2 rounded border border-red-100">
                                        <img src={a.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{a.name}</p>
                                            <p className="text-xs text-gray-500">{a.team}</p>
                                        </div>
                                        <button onClick={() => setSelectedTeam2(selectedTeam2.filter(pid => pid !== id))} className="text-red-500"><Trash2 className="w-4 h-4"/></button>
                                    </div>
                                ) : null;
                            })}
                        </div>
                    </div>
                </div>

                {/* AI & Actions */}
                <div className="bg-gray-50 p-4 border-t flex flex-col gap-4">
                    {aiAnalysis && (
                        <div className="bg-white p-4 rounded-lg border border-purple-200 shadow-sm text-sm text-gray-700">
                            <div className="flex items-center gap-2 text-purple-700 font-bold mb-2">
                                <BrainCircuit className="w-5 h-5" />
                                <span>Phân tích từ Huấn Luyện Viên AI</span>
                            </div>
                            <p className="whitespace-pre-line">{aiAnalysis}</p>
                        </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                         <button 
                            type="button"
                            onClick={handleAiAnalyze}
                            disabled={isAnalyzing || selectedTeam1.length === 0 || selectedTeam2.length === 0}
                            className={`flex items-center gap-2 text-purple-600 font-medium hover:bg-purple-50 px-4 py-2 rounded-lg transition-colors ${isAnalyzing || selectedTeam1.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isAnalyzing ? <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"/> : <BrainCircuit className="w-5 h-5" />}
                            Dự đoán & Chiến thuật
                        </button>

                        <button 
                            onClick={handlePreSubmit}
                            disabled={selectedTeam1.length === 0 || selectedTeam2.length === 0}
                            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Tiếp tục (Xác minh)
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Match History List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h3 className="font-bold text-lg text-gray-800">Lịch sử đấu</h3>
            </div>
            <div className="divide-y divide-gray-100">
                {matches.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">Chưa có trận đấu nào.</div>
                ) : matches.map((match: Match) => {
                    const t1 = match.team1Ids.map(id => getAthlete(id)).filter(Boolean) as Athlete[];
                    const t2 = match.team2Ids.map(id => getAthlete(id)).filter(Boolean) as Athlete[];
                    
                    return (
                        <div key={match.id} className="p-4 hover:bg-gray-50 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="text-xs text-gray-400 w-24 text-center md:text-left">{match.date}</div>
                            
                            <div className="flex-1 flex items-center justify-end gap-3">
                                <div className="text-right">
                                    {t1.map(p => <div key={p.id} className={`text-sm ${match.winnerTeam === 1 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{p.name}</div>)}
                                </div>
                                <div className="flex -space-x-2">
                                     {t1.map(p => <img key={p.id} src={p.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white" alt="" />)}
                                </div>
                            </div>

                            <div className="px-6 flex items-center gap-3">
                                <span className={`text-2xl font-bold ${match.winnerTeam === 1 ? 'text-blue-600' : 'text-gray-300'}`}>{match.score1}</span>
                                <span className="text-gray-300">-</span>
                                <span className={`text-2xl font-bold ${match.winnerTeam === 2 ? 'text-red-600' : 'text-gray-300'}`}>{match.score2}</span>
                            </div>

                            <div className="flex-1 flex items-center justify-start gap-3">
                                <div className="flex -space-x-2">
                                     {t2.map(p => <img key={p.id} src={p.avatarUrl} className="w-8 h-8 rounded-full border-2 border-white" alt="" />)}
                                </div>
                                <div className="text-left">
                                    {t2.map(p => <div key={p.id} className={`text-sm ${match.winnerTeam === 2 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{p.name}</div>)}
                                </div>
                            </div>
                            
                            <div className="w-20 text-center">
                                <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                                    {match.type}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};