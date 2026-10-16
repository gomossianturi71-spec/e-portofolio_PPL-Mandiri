import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Toast({
  message,
  type = 'success',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[200] fade-in">
      <div
        className={`flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg ${
          type === 'success' ? 'bg-green-600' : 'bg-red-600'
        } text-white`}
      >
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="hover:opacity-70">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
