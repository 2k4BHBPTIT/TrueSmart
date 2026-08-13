import { MessageCircle, PhoneCall } from 'lucide-react';

const FloatingMenu = () => (
  <div className="fixed bottom-24 right-4 z-[999] flex flex-col gap-3">
    <a
      href="https://zalo.me/0948122666"
      target="_blank"
      rel="noreferrer"
      className="flex h-14 w-14 items-center justify-center rounded-full border border-[#FFD700]/30 bg-[#111827] text-[#FFD700] shadow-[0_12px_30px_rgba(17,24,39,0.25)] transition hover:scale-110"
      title="Chat Zalo"
    >
      <MessageCircle size={22} />
    </a>
    <a
      href="tel:0948122666"
      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#FFD700] to-[#F5C400] text-gray-900 shadow-[0_12px_30px_rgba(245,196,0,0.35)] transition hover:scale-110"
      title="Gọi hotline"
    >
      <PhoneCall size={22} />
    </a>
  </div>
);

export default FloatingMenu;
