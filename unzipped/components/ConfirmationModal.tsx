import React from 'react';
import { Booking, CustomRequest } from '../types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingDetails: Booking | CustomRequest;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, bookingDetails }) => {
  if (!isOpen) return null;

  const isBooking = 'time' in bookingDetails;
  const displayDate = isBooking ? bookingDetails.date : bookingDetails.requestedDate;
  const displayTime = isBooking ? bookingDetails.time : bookingDetails.requestedTime;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6 md:p-8">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-2xl font-bold text-gray-900 mt-4">預約請求已送出！</h3>
            <p className="text-gray-600 mt-2">還差最後一步！請務必完成以下操作以確認您的預約。</p>
          </div>

          <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-lg text-orange-800">您的預約資訊</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>日期:</strong> {displayDate}</p>
              <p><strong>時間:</strong> {displayTime}</p>
              <p><strong>姓名:</strong> {bookingDetails.customerName}</p>
              <p><strong>電話:</strong> {bookingDetails.customerPhone}</p>
            </div>
          </div>
          
          <div className="mt-6 text-center space-y-4">
             <div>
                <p className="font-semibold text-red-600 text-lg">⚠️ 請截圖此預約畫面</p>
                <p className="text-gray-600">並傳送到我們的官方 LINE 帳號進行最終確認。</p>
            </div>
            
            <a 
              href="https://lin.ee/EJC06zW" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-transform transform hover:scale-105"
            >
              點此加入 LINE 好友 (@707efoqx)
            </a>
            
            <p className="text-sm text-gray-500 font-semibold">※ 阿倫回覆後才正式確認預約成功 ※</p>
          </div>
          
          <div className="mt-8 text-center">
            <button onClick={onClose} className="w-full sm:w-auto px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              關閉
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;