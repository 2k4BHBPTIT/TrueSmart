import { Package, Truck, CheckCircle, CreditCard, XCircle } from 'lucide-react';

const OrderTracker = ({ status }) => {
  // Danh sách các bước cố định
  const steps = [
    { id: 'Chờ xác nhận', icon: Package, label: 'Chờ xác nhận' },
    { id: 'Đã thanh toán', icon: CreditCard, label: 'Đã thanh toán' },
    { id: 'Đang giao hàng', icon: Truck, label: 'Đang giao' },
    { id: 'Hoàn thành', icon: CheckCircle, label: 'Đã nhận hàng' }
  ];

  // Tính toán bước hiện tại
  const currentStepIndex = steps.findIndex(step => step.id === status);
  const isCancelled = status === 'Đã hủy';

  if (isCancelled) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border border-red-200">
        <XCircle size={24} /> ĐƠN HÀNG ĐÃ BỊ HỦY
      </div>
    );
  }

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center relative">
        {/* Thanh kết nối mờ (Nền) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0"></div>
        
        {/* Thanh tiến trình chạy màu Đỏ */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 z-0 transition-all duration-500 ease-in-out"
          style={{ width: currentStepIndex > 0 ? `${(currentStepIndex / (steps.length - 1)) * 100}%` : '0%' }}
        ></div>

        {/* Các mốc trạng thái */}
        {steps.map((step, index) => {
          const isCompleted = currentStepIndex >= index;
          const isCurrent = currentStepIndex === index;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Vòng tròn Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-md border-4 border-white ${
                isCompleted ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-400'
              } ${isCurrent ? 'ring-4 ring-red-100 scale-110' : ''}`}>
                <Icon size={18} />
              </div>
              
              {/* Chữ mô tả trạng thái */}
              <span className={`text-xs md:text-sm font-bold mt-2 absolute top-12 whitespace-nowrap ${
                isCompleted ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;