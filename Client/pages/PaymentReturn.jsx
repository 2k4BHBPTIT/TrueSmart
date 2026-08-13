import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentReturn = ({ provider }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    let status = 'failed';
    let orderId = '';

    if (provider === 'vnpay') {
      const rsp = searchParams.get('vnp_ResponseCode');
      orderId = searchParams.get('vnp_TxnRef') || '';
      status = (rsp === '00' || rsp === '0') ? 'success' : 'failed';
    } else {
      const err = searchParams.get('errorCode');
      orderId = searchParams.get('orderId') || '';
      status = (!err || err === '0') ? 'success' : 'failed';
    }

    const timer = window.setTimeout(() => {
      const query = new URLSearchParams({ payment: status });
      if (orderId) query.set('orderId', orderId);
      navigate(`/profile/orders?${query.toString()}`, { replace: true });
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [provider, searchParams, navigate]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center flex-col gap-4 py-20 italic">
      <CheckCircle size={48} className={provider === 'vnpay' ? 'text-green-600' : 'text-pink-600'} />
      <h2 className="font-black text-2xl uppercase">
        {provider === 'vnpay' ? 'Đang xử lý kết quả thanh toán...' : 'Đang xử lý kết quả MoMo...'}
      </h2>
      <p className="text-gray-500 font-bold">Xin chờ, bạn sẽ được tự động chuyển hướng sau 2 giây.</p>
    </div>
  );
};

export default PaymentReturn;
