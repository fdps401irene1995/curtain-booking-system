import React, { useState, useMemo } from 'react';
import { Availability, Booking, CustomRequest } from '../types';
import BookingModal from './BookingModal';
import RequestModal from './RequestModal';
import ConfirmationModal from './ConfirmationModal';
import BookingLookup from './BookingLookup';

interface CustomerPortalProps {
  availability: Availability;
  onNewBooking: (booking: Omit<Booking, 'id' | 'status' | 'source' | 'dealStatus' | 'notes'>) => Promise<Booking>;
  onNewCustomRequest: (request: Omit<CustomRequest, 'id' | 'status' | 'dealStatus' | 'notes'>) => Promise<CustomRequest>;
  uploadPhoto: (base64: string) => Promise<string>;
}

const CustomerPortal: React.FC<CustomerPortalProps> = ({ availability, onNewBooking, onNewCustomRequest, uploadPhoto }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [confirmationData, setConfirmationData] = useState<Booking | CustomRequest | null>(null);

  const availableSlotsForDate = useMemo(() => {
    const sortedSlots = availability[selectedDate]?.filter(slot => !slot.isBooked) || [];
    sortedSlots.sort((a, b) => a.time.localeCompare(b.time));
    return sortedSlots;
  }, [availability, selectedDate]);
  
  const handleSlotClick = (date: string, time: string) => {
    setSelectedDate(date);
    setSelectedSlot(time);
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (customerDetails: { name: string; phone: string; address: string; windowCount: string; curtainStyle: string; referencePhoto?: string; }) => {
    if (!selectedSlot) throw new Error("No time slot selected.");

    let photoUrl = '';
    if(customerDetails.referencePhoto){
      photoUrl = await uploadPhoto(customerDetails.referencePhoto);
    }
    
    const newBooking = await onNewBooking({
      date: selectedDate,
      time: selectedSlot,
      customerName: customerDetails.name,
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,
      windowCount: customerDetails.windowCount,
      curtainStyle: customerDetails.curtainStyle,
      referencePhoto: photoUrl,
    });
    
    setIsModalOpen(false);
    setSelectedSlot(null);
    setConfirmationData(newBooking);
  };
  
  const handleConfirmRequest = async (details: any) => {
      let photoUrl = '';
      if(details.referencePhoto){
        photoUrl = await uploadPhoto(details.referencePhoto);
      }

      const newRequest = await onNewCustomRequest({
        requestedDate: details.requestedDate,
        requestedTime: details.requestedTime,
        customerName: details.name,
        customerPhone: details.phone,
        customerAddress: details.address,
        windowCount: details.windowCount,
        curtainStyle: details.curtainStyle,
        referencePhoto: photoUrl,
      });
      
      setIsRequestModalOpen(false);
      setConfirmationData(newRequest);
  }

  const nextThreeDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 3; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = i === 0 ? '今天' : i === 1 ? '明天' : new Intl.DateTimeFormat('zh-TW', { weekday: 'long' }).format(date);
        
        const slots = availability[dateString]?.filter(slot => !slot.isBooked).sort((a,b) => a.time.localeCompare(b.time)) || [];
        days.push({ dateString, dayName, slots });
    }
    return days;
  }, [availability, today]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-orange-600 text-center">微笑城堡阿倫 - 免費丈量預約</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">近期可預約時段</h3>
            <div className="space-y-4">
              {nextThreeDays.map(({ dateString, dayName, slots }) => (
                <div key={dateString}>
                  <p className="font-bold text-gray-700">{dateString} ({dayName})</p>
                  {slots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                       {slots.map(({ time }) => (
                          <button
                            key={time}
                            onClick={() => handleSlotClick(dateString, time)}
                            className="p-3 bg-green-500 text-white font-bold rounded-lg text-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform transform hover:scale-105 shadow"
                          >
                            {time}
                          </button>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">本日已額滿或未開放</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
             <h3 className="text-xl font-semibold mb-4 text-gray-800">選擇其他日期</h3>
            <div className="flex flex-col md:flex-row items-center justify-start space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <label htmlFor="customer-date-select" className="text-lg font-medium text-gray-700">選擇日期:</label>
              <input
                type="date"
                id="customer-date-select"
                value={selectedDate}
                min={today.toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              />
            </div>
             {availableSlotsForDate.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {availableSlotsForDate.map(({ time }) => (
                  <button
                    key={time}
                    onClick={() => handleSlotClick(selectedDate, time)}
                    className="p-4 bg-orange-500 text-white font-bold rounded-lg text-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105 shadow-md"
                  >
                    {time}
                  </button>
                ))}
              </div>
            ) : (
               <div className="text-center py-8 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 <h3 className="mt-2 text-md font-medium text-gray-900">無可預約時段</h3>
                 <p className="mt-1 text-sm text-gray-500">此日期已額滿或尚未開放，請選擇其他日期。</p>
               </div>
            )}
          </div>
        </div>

        <div className="text-center pt-8 mt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-2">以上時段如果都不行的話？</p>
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="text-orange-600 font-semibold hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-sm"
          >
            點此提出您想要的日期時間
          </button>
        </div>
      </div>
      
      <BookingLookup />

      {selectedSlot && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmBooking}
          date={selectedDate}
          time={selectedSlot}
        />
      )}
      <RequestModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onConfirm={handleConfirmRequest}
      />
      {confirmationData && (
        <ConfirmationModal 
            isOpen={!!confirmationData}
            onClose={() => setConfirmationData(null)}
            bookingDetails={confirmationData}
        />
      )}
    </div>
  );
};

export default CustomerPortal;