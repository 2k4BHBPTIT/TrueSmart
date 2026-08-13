import { Gem, Shield, DollarSign, HeartHandshake } from 'lucide-react';

const badges = [
  { icon: Gem, title: 'CAM KẾT CHẤT LƯỢNG', desc: 'Yên tâm tuyệt đối' },
  { icon: Shield, title: 'BẢO HÀNH SIÊU VIỆT', desc: '100% hài lòng' },
  { icon: DollarSign, title: 'CAM KẾT GIÁ TỐT NHẤT', desc: 'Khỏi mất công so sánh giá' },
  { icon: HeartHandshake, title: 'CHĂM SÓC KHÁCH HÀNG', desc: 'Xem khách hàng như người thân' },
];

const TrustBadges = () => (
  <section className="mb-6 rounded-[24px] border border-yellow-200/70 bg-white/90 p-4 shadow-[0_16px_40px_rgba(17,24,39,0.06)] md:p-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {badges.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-[#FFFDF7] p-3 transition hover:border-[#FFD700] hover:shadow-sm">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#FFF3C4]">
            <Icon size={24} className="text-[#C28A00]" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase leading-tight text-gray-800 md:text-xs">{title}</p>
            <p className="mt-0.5 text-[10px] text-gray-500">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustBadges;
