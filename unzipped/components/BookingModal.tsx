
import React, { useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: { name: string; phone: string; address: string; windowCount: string; curtainStyle: string; referencePhoto?: string; }) => Promise<void>;
  date: string;
  time: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, onConfirm, date, time }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [windowCount, setWindowCount] = useState('');
  const [curtainStyle, setCurtainStyle] = useState('');
  const [referencePhoto, setReferencePhoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setPhone('');
      setAddress('');
      setWindowCount('');
      setCurtainStyle('');
      setReferencePhoto(undefined);
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        setError('照片檔案大小請勿超過 2MB。');
        e.target.value = ''; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferencePhoto(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !windowCount || !curtainStyle) {
      setError('除了參考照片外，所有欄位皆為必填。');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm({ name, phone, address, windowCount, curtainStyle, referencePhoto });
      // The onConfirm function will handle closing the modal on success.
    } catch (err) {
      console.error("Booking submission failed:", err);
      setError('預約送出失敗，請檢查網路連線或稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">確認預約</h3>
              <p className="text-lg text-orange-600 font-semibold mt-1">{date} at {time}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">客戶名稱</label>
              <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">聯絡電話</label>
              <input type="tel" id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
            </div>
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">丈量地址</label>
              <input type="text" id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
            </div>
            <div>
              <label htmlFor="windowCount" className="block text-sm font-medium text-gray-700">預計窗數</label>
              <input type="text" id="windowCount" value={windowCount} onChange={e => setWindowCount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" placeholder="例如：3" required />
            </div>
            <div>
              <label htmlFor="curtainStyle" className="block text-sm font-medium text-gray-700">想安裝的窗簾款式</label>
              <input type="text" id="curtainStyle" value={curtainStyle} onChange={e => setCurtainStyle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" placeholder="例如：調光簾、布簾" required />
            </div>
             <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700">上傳參考照片 (非必選)</label>
              <input type="file" id="photo" accept="image/*" onChange={handlePhotoUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
              {referencePhoto && <img src={referencePhoto} alt="照片預覽" className="mt-2 rounded-md max-h-40" />}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="pt-4 flex justify-end space-x-3">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">取消</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-gray-400">
                {isSubmitting ? '處理中...' : '確認預約'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;