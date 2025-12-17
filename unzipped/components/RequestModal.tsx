import React, { useState } from 'react';

interface RequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: {
    requestedDate: string;
    requestedTime: string;
    name: string;
    phone: string;
    address: string;
    windowCount: string;
    curtainStyle: string;
    referencePhoto?: string;
  }) => Promise<void>;
}

const RequestModal: React.FC<RequestModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedHour, setRequestedHour] = useState('09');
  const [requestedMinute, setRequestedMinute] = useState('00');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [windowCount, setWindowCount] = useState('');
  const [curtainStyle, setCurtainStyle] = useState('');
  const [referencePhoto, setReferencePhoto] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hours = Array.from({ length: 15 }, (_, i) => String(8 + i).padStart(2, '0')); // 08:00 to 22:00
  const minutes = ['00', '30'];
  
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
    const requestedTime = `${requestedHour}:${requestedMinute}`;
    if (!requestedDate || !requestedTime || !name || !phone || !address || !windowCount || !curtainStyle) {
      setError('除了參考照片外，所有欄位皆為必填。');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await onConfirm({ 
        requestedDate, 
        requestedTime,
        name, 
        phone, 
        address, 
        windowCount, 
        curtainStyle, 
        referencePhoto 
      });
      // On success, the parent component handles closing the modal
    } catch (err) {
      console.error("Request submission failed:", err);
      setError('請求送出失敗，請檢查網路連線或稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
      // Reset form fields
      setRequestedDate(new Date().toISOString().split('T')[0]);
      setRequestedHour('09');
      setRequestedMinute('00');
      setName('');
      setPhone('');
      setAddress('');
      setWindowCount('');
      setCurtainStyle('');
      setReferencePhoto(undefined);
      setError('');
      setIsSubmitting(false);
      onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">提出丈量時間請求</h3>
                <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="req-date" className="block text-sm font-medium text-gray-700">希望日期</label>
                        <input type="date" id="req-date" value={requestedDate} min={new Date().toISOString().split('T')[0]} onChange={e => setRequestedDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">希望時間</label>
                        <div className="grid grid-cols-2 gap-2 mt-1">
                            <select
                                value={requestedHour}
                                onChange={e => setRequestedHour(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                            >
                                {hours.map(h => <option key={h} value={h}>{h} 時</option>)}
                            </select>
                            <select
                                value={requestedMinute}
                                onChange={e => setRequestedMinute(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                            >
                                {minutes.map(m => <option key={m} value={m}>{m} 分</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                 <div>
                  <label htmlFor="name-req" className="block text-sm font-medium text-gray-700">客戶名稱</label>
                  <input type="text" id="name-req" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
                </div>
                <div>
                  <label htmlFor="phone-req" className="block text-sm font-medium text-gray-700">聯絡電話</label>
                  <input type="tel" id="phone-req" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
                </div>
                <div>
                  <label htmlFor="address-req" className="block text-sm font-medium text-gray-700">丈量地址</label>
                  <input type="text" id="address-req" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" required />
                </div>
                <div>
                  <label htmlFor="windowCount-req" className="block text-sm font-medium text-gray-700">預計窗數</label>
                  <input type="text" id="windowCount-req" value={windowCount} onChange={e => setWindowCount(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" placeholder="例如：3" required />
                </div>
                <div>
                  <label htmlFor="curtainStyle-req" className="block text-sm font-medium text-gray-700">想安裝的窗簾款式</label>
                  <input type="text" id="curtainStyle-req" value={curtainStyle} onChange={e => setCurtainStyle(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" placeholder="例如：調光簾、布簾" required />
                </div>
                 <div>
                  <label htmlFor="photo-req" className="block text-sm font-medium text-gray-700">上傳參考照片 (非必選)</label>
                  <input type="file" id="photo-req" accept="image/*" onChange={handlePhotoUpload} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100" />
                  {referencePhoto && <img src={referencePhoto} alt="照片預覽" className="mt-2 rounded-md max-h-40" />}
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-200">
                  <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">取消</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 disabled:bg-gray-400">
                    {isSubmitting ? '處理中...' : '送出請求'}
                  </button>
                </div>
              </form>
            </div>
      </div>
    </div>
  );
};

export default RequestModal;