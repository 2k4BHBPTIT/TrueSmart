import { useState, useEffect, useRef } from 'react';
import API from '../../api/axios';
import { Send, User, CheckCheck } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminChat = () => {
  const [inbox, setInbox] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchInbox = async () => {
    try {
      const res = await API.get('/chat/inbox');
      setInbox(res.data);
    } catch (err) {
      console.error('Lỗi lấy inbox:', err);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await API.get(`/chat/${userId}`);
      setMessages(res.data);
      // Cập nhật lại list bên trái cho mất số lượng chưa đọc
      setInbox(prev => prev.map(chat => chat._id === userId ? { ...chat, unreadCount: 0 } : chat));
    } catch (err) {
      console.error('Lỗi lấy tin nhắn:', err);
    }
  };

  useEffect(() => {
    fetchInbox();
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

    // Lắng nghe khi có khách nhắn tin mới
    socketRef.current.on('admin_receive_message', (newMsg) => {
      setInbox(prev => {
        const exist = prev.find(c => c._id === newMsg.userId);
        if (exist) {
          return prev
            .map(c => c._id === newMsg.userId ? { ...c, lastMessage: newMsg.message, lastTime: newMsg.createdAt, unreadCount: c.unreadCount + 1 } : c)
            .sort((a,b) => new Date(b.lastTime) - new Date(a.lastTime));
        } else {
          // Khách mới
          return [{ _id: newMsg.userId, userName: newMsg.userName, lastMessage: newMsg.message, lastTime: newMsg.createdAt, unreadCount: 1 }, ...prev];
        }
      });

      // Nếu đang mở chat với khách đó thì hiển thị luôn
      setMessages(prev => {
        if (prev.length > 0 && prev[0].userId === newMsg.userId) {
          return [...prev, newMsg];
        }
        return prev;
      });
    });

    return () => socketRef.current.disconnect();
  }, []);

  // Cuộn xuống cuối khi có tin mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectChat = (user) => {
    setSelectedUser(user);
    fetchMessages(user._id);
    socketRef.current.emit('join_chat', user._id); // Join room để lấy real-time
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !selectedUser) return;

    // Gửi qua socket
    socketRef.current.emit('admin_reply_message', { userId: selectedUser._id, message: text });

    // Cập nhật UI ngay lập tức
    const newMsg = { _id: Date.now(), userId: selectedUser._id, message: text, isAdmin: true, createdAt: new Date() };
    setMessages([...messages, newMsg]);
    setText('');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[90vh]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase border-l-4 border-red-600 pl-4">Hòm thư khách hàng</h1>
      </div>

      <div className="flex h-[80vh] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* CỘT TRÁI: DANH SÁCH KHÁCH */}
        <div className="w-1/3 border-r bg-gray-50 flex flex-col">
          <div className="p-4 border-b bg-white">
            <h2 className="text-lg font-black uppercase text-gray-800">Hòm thư khách hàng</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {inbox.map(user => (
              <div
                key={user._id}
                onClick={() => selectChat(user)}
                className={`p-4 border-b cursor-pointer transition-colors hover:bg-red-50 ${selectedUser?._id === user._id ? 'bg-red-50 border-l-4 border-l-red-600' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-gray-800">{user.userName}</span>
                  {user.unreadCount > 0 && <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{user.unreadCount}</span>}
                </div>
                <p className="text-sm text-gray-500 truncate">{user.lastMessage}</p>
              </div>
            ))}
            {inbox.length === 0 && <p className="p-4 text-center text-gray-500 font-bold">Chưa có tin nhắn nào.</p>}
          </div>
        </div>

        {/* CỘT PHẢI: KHUNG CHAT */}
        <div className="w-2/3 flex flex-col bg-gray-100">
          {selectedUser ? (
            <>
              <div className="p-4 border-b bg-white flex items-center gap-3 shadow-sm z-10">
                <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center"><User size={20} /></div>
                <h2 className="text-lg font-black text-gray-800">{selectedUser.userName}</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => (
                  <div key={msg._id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${msg.isAdmin ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>
                      <p className="font-medium text-sm">{msg.message}</p>
                      <span className={`text-[10px] mt-1 block ${msg.isAdmin ? 'text-red-200' : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-2">
                <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Nhập tin nhắn hỗ trợ..." className="flex-1 border bg-gray-50 rounded-full px-4 py-2 outline-none focus:border-red-600 transition-colors" />
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-105">
                  <Send size={18} className="ml-1" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 font-bold flex-col">
              <CheckCheck size={64} className="mb-4 opacity-50" />
              <p>Chọn một cuộc hội thoại để bắt đầu hỗ trợ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChat;