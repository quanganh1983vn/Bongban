import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Users } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (teamName: string) => void;
  teams: string[];
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, teams }) => {
  const [selectedTeam, setSelectedTeam] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) {
        setError('Vui lòng chọn đội của bạn');
        return;
    }

    // Demo password check
    if (password === '123456') { 
      onLogin(selectedTeam);
      onClose();
      setPassword('');
      setError('');
      setSelectedTeam('');
    } else {
      setError('Mật khẩu không đúng (Mặc định: 123456)');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in transform transition-all scale-100">
        <div className="p-5 border-b flex justify-between items-center bg-slate-900 text-white">
          <h3 className="font-bold flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-400" /> 
            Đăng nhập Đội thi đấu
          </h3>
          <button onClick={onClose} className="hover:bg-slate-700 p-1.5 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center mb-2">
             <p className="text-sm text-gray-500">Đăng nhập để cập nhật kết quả thi đấu.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn Đội</label>
            <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
            >
                <option value="">-- Chọn đội --</option>
                {teams.map(t => (
                    <option key={t} value={t}>{t}</option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu..."
            />
            {error && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1">⚠️ {error}</p>}
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;