import { useState, useEffect, useRef, useContext } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import API from '../api/axios';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext'; // 1. IMPORT AUTH CONTEXT

const LiveChat = () => {
  const { user } = useContext(AuthContext); // 2. LẤY THÔNG TIN USER ĐANG ĐĂNG NHẬP
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // 3. HÀM ĐỊNH DANH THÔNG MINH (Ưu tiên tài khoản thật > Khách vãng lai)
  const getChatIdentity = () => {
    if (user && user._id) {
      return { id: user._id, name: user.name };
    }
    
    // Nếu chưa đăng nhập, tạo/lấy Guest ID
    let guestId = localStorage.getItem('chat_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chat_guest_id', guestId);
    }
    return { id: guestId, name: 'Khách vãng lai' };
  };

  const chatUser = getChatIdentity();

  // 4. LẮNG NGHE SỰ THAY ĐỔI CỦA TÀI KHOẢN
  useEffect(() => {
    // Tải lịch sử chat của riêng người này
    const fetchHistory = async () => {
      try {
        const res = await API.get(`/chat/${chatUser.id}`);
        setMessages(res.data);
      } catch (err) { 
        console.error("Lỗi tải chat", err); 
        setMessages([]); // Làm sạch khung chat nếu lỗi
      }
    };
    
    // Nếu mở khung chat hoặc có user mới thì tải lịch sử
    fetchHistory();

    // Khởi tạo và tham gia đúng phòng Socket
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('join_chat', chatUser.id);

    // Lắng nghe tin nhắn mới trả về đúng phòng này
    socketRef.current.on('receive_message', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    // CLEANUP: Dọn dẹp kết nối khi tài khoản đăng xuất hoặc đổi tài khoản
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [chatUser.id]); // QUAN TRỌNG: Hook này sẽ chạy lại mỗi khi chatUser.id thay đổi

  // Cuộn xuống tin nhắn cuối
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    // Gửi lên server kèm đúng ID và Tên của người dùng hiện tại
    socketRef.current.emit('send_chat_message', { 
      userId: chatUser.id, 
      userName: chatUser.name, 
      message: text 
    });
    setText('');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 italic">
      {/* Nút bật/tắt Chat */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)} 
          className="bg-red-600 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all animate-bounce"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[500px]">
          <div className="bg-gray-900 p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-black">XB</div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div>
                <h3 className="text-white font-black text-sm">TrueSmart Assistant</h3>
                <p className="text-gray-400 text-[10px] font-bold">
                  {user ? `Xin chào, ${user.name}` : 'Tư vấn sản phẩm 24/7'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 text-xs font-bold my-4">
                {user ? 'Bạn có thể hỏi về sản phẩm, giá, bảo hành hoặc cần đề xuất phù hợp với nhu cầu.' : 'Đăng nhập để lưu lịch sử chat tốt hơn nhé!'}
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${!msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${!msg.isAdmin ? 'bg-red-600 text-white rounded-br-none' : 'bg-white text-gray-800 border rounded-bl-none'}`}>
                  <p className="text-sm font-medium">{msg.message}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-white border-t flex gap-2">
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ví dụ: Tôi cần loa bluetooth giá tốt..." className="flex-1 border bg-gray-50 rounded-full px-4 text-sm font-medium outline-none focus:border-red-600" />
            <button type="submit" className="bg-gray-900 hover:bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors">
              <Send size={16} className="ml-1" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveChat;