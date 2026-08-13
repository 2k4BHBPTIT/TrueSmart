import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return visible ? (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-4 right-4 z-[998] w-10 h-10 bg-ts-yellow rounded flex items-center justify-center shadow-lg hover:bg-ts-yellow-dark transition-colors"
      aria-label="Cuộn lên đầu trang"
    >
      <ChevronUp size={22} className="text-gray-900" />
    </button>
  ) : null;
};

export default ScrollToTop;
