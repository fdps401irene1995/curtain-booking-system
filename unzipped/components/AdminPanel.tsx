import React, { useState, useMemo } from 'react';
import { Availability, Booking, CustomRequest, User, BookingStatus, DealStatus, BookingSource } from '../types';
import { TIME_SLOTS } from '../constants';
import QuoteCarousel from './QuoteCarousel';
import Statistics from './Statistics';
import UserManagement from './UserManagement';
import ProfileManagement from './ProfileManagement';
import NotesModal from './NotesModal';

type CombinedScheduleItem = (Booking & { itemType: 'booking', displayDate: string, displayTime: string }) | 
                            (CustomRequest & { itemType: 'request', displayDate: string, displayTime: string, source: '客戶指定' });

interface AdminPanelProps {
  currentUser: User;
  users: User[];
  availability: Availability;
  bookings: Booking[];
  customRequests: CustomRequest[];
  onSetAvailability: (date: string, slots: string[]) => void;
  onUpdateUser: (user: User) => void;
  onUpdateBookingStatus: (id: string, status: BookingStatus) => void;
  onUpdateCustomRequestStatus: (id: string, status: BookingStatus) => void;
  onManualAddBooking: (bookingData: Omit<Booking, 'id' | 'status' | 'dealStatus' | 'notes'>) => void;
  onUpdateBookingDealStatus: (id: string, dealStatus: DealStatus) => void;
  onUpdateCustomRequestDealStatus: (id: string, dealStatus: DealStatus) => void;
  onAddNote: (itemId: string, itemType: 'booking' | 'request', content: string, author: User) => void;
}

const statusColors: { [key in BookingStatus]: string } = {
  '待確認': 'bg-yellow-100 text-yellow-800',
  '已確認': 'bg-green-100 text-green-800',
  '已完成': 'bg-blue-100 text-blue-800',
  '已取消': 'bg-red-100 text-red-800',
};

const dealStatusColors: { [key in DealStatus]: string } = {
  '洽談中': 'bg-gray-100 text-gray-800',
  '已成交': 'bg-teal-100 text-teal-800',
  '未成交': 'bg-pink-100 text-pink-800',
};

const ManualBookingForm: React.FC<{ onManualAddBooking: (data: Omit<Booking, 'id' | 'status' | 'dealStatus' | 'notes'>) => void }> = ({ onManualAddBooking }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [source, setSource] = useState<BookingSource>('阿倫自約');
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!date || !time || !customerName || !customerPhone || !customerAddress){
            alert('請填寫所有欄位');
            return;
        }
        onManualAddBooking({
            date,
            time,
            customerName,
            customerPhone,
            customerAddress,
            source,
            windowCount: 'N/A', // Default values for fields not in this form
            curtainStyle: 'N/A',
            referencePhoto: undefined,
        });
        setMessage('行程已成功新增！');
        // Reset form
        setDate(new Date().toISOString().split('T')[0]);
        setTime('');
        setCustomerName('');
        setCustomerPhone('');
        setCustomerAddress('');
        setTimeout(() => setMessage(''), 3000);
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b pb-3">手動新增行程</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700">行程來源</label>
                    <select value={source} onChange={e => setSource(e.target.value as BookingSource)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900">
                        <option value="阿倫自約">阿倫自約</option>
                        <option value="公司安排">公司安排</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="manual-date" className="block text-sm font-medium text-gray-700">日期</label>
                        <input type="date" id="manual-date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
                    </div>
                    <div>
                        <label htmlFor="manual-time" className="block text-sm font-medium text-gray-700">時間</label>
                        <input type="time" id="manual-time" value={time} onChange={e => setTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
                    </div>
                </div>
                <div>
                    <label htmlFor="manual-name" className="block text-sm font-medium text-gray-700">客戶名稱</label>
                    <input type="text" id="manual-name" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
                </div>
                <div>
                    <label htmlFor="manual-phone" className="block text-sm font-medium text-gray-700">聯絡電話</label>
                    <input type="tel" id="manual-phone" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
                </div>
                 <div>
                    <label htmlFor="manual-address" className="block text-sm font-medium text-gray-700">丈量地址</label>
                    <input type="text" id="manual-address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
                </div>
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    新增行程
                </button>
                {message && <p className="text-green-600 text-center mt-3 text-sm font-semibold">{message}</p>}
            </form>
        </div>
    );
}


const AdminPanel: React.FC<AdminPanelProps> = ({ 
  currentUser, users, availability, bookings, customRequests, 
  onSetAvailability, onUpdateUser, onUpdateBookingStatus, onUpdateCustomRequestStatus,
  onManualAddBooking, onUpdateBookingDealStatus, onUpdateCustomRequestDealStatus, onAddNote
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [specialTime, setSpecialTime] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [selectedItemForNotes, setSelectedItemForNotes] = useState<CombinedScheduleItem | null>(null);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    const existingSlots = availability[newDate]?.filter(s => !s.isBooked).map(s => s.time) || [];
    setSelectedSlots(new Set(existingSlots));
  };
  
  const handleSlotToggle = (slot: string) => {
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slot)) {
        newSet.delete(slot);
      } else {
        newSet.add(slot);
      }
      return newSet;
    });
  };

  const handleAddSpecialTime = () => {
    if (specialTime && /^\d{2}:\d{2}$/.test(specialTime)) {
      handleSlotToggle(specialTime);
      setSpecialTime('');
    } else {
      alert('請輸入有效的時間格式 (HH:MM)，例如：13:45。');
    }
  };

  const handleSaveAvailability = () => {
    onSetAvailability(selectedDate, Array.from(selectedSlots).sort());
    setMessage(`已成功更新 ${selectedDate} 的可預約時段！`);
    setTimeout(() => setMessage(''), 3000);
  };
  
  const isSlotBooked = (date: string, time: string): boolean => {
      return !!availability[date]?.find(s => s.time === time && s.isBooked);
  };
  
  const combinedSchedule: CombinedScheduleItem[] = useMemo(() => {
    const formattedBookings = bookings.map(b => ({
      ...b,
      itemType: 'booking' as const,
      displayDate: b.date,
      displayTime: b.time,
    }));
    
    const formattedRequests = customRequests.map(r => ({
      ...r,
      itemType: 'request' as const,
      displayDate: r.requestedDate,
      displayTime: r.requestedTime,
      source: '客戶指定' as const, // Assign a source for display purposes
    }));
    
    return [...formattedBookings, ...formattedRequests].sort((a, b) => 
        new Date(`${a.displayDate}T${a.displayTime || '00:00'}`).getTime() - 
        new Date(`${b.displayDate}T${b.displayTime || '00:00'}`).getTime()
    );
  }, [bookings, customRequests]);
  
  const handleOpenNotesModal = (item: CombinedScheduleItem) => {
    setSelectedItemForNotes(item);
    setNotesModalOpen(true);
  };

  const handleAddNoteSubmit = (content: string) => {
    if (selectedItemForNotes) {
        onAddNote(selectedItemForNotes.id, selectedItemForNotes.itemType, content, currentUser);
    }
  };


  return (
    <div className="space-y-8">
      <QuoteCarousel />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Statistics bookings={bookings} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b pb-3">設定可預約時段</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="date-select" className="block text-sm font-medium text-gray-700 mb-1">選擇日期</label>
                  <input
                    type="date"
                    id="date-select"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleDateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                  />
                </div>
                 <div>
                    <label htmlFor="special-time" className="block text-sm font-medium text-gray-700 mb-1">新增特殊時間</label>
                    <div className="flex space-x-2">
                        <input
                            type="time"
                            id="special-time"
                            value={specialTime}
                            onChange={(e) => setSpecialTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                            placeholder="例如：13:45"
                        />
                        <button onClick={handleAddSpecialTime} className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm">
                            新增
                        </button>
                    </div>
                </div>
                <div>
                  <p className="block text-sm font-medium text-gray-700 mb-2">選擇時段</p>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-2">
                    {TIME_SLOTS.map(slot => {
                        const booked = isSlotBooked(selectedDate, slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => handleSlotToggle(slot)}
                            disabled={booked}
                            className={`p-3 text-sm rounded-md transition-all text-center ${
                                booked 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : selectedSlots.has(slot) 
                                  ? 'bg-orange-600 text-white shadow-md transform hover:scale-105'
                                  : 'bg-gray-100 text-gray-800 hover:bg-orange-100'
                            }`}
                          >
                            {slot} {booked && "(已訂)"}
                          </button>
                        );
                    })}
                  </div>
                </div>
                <button
                  onClick={handleSaveAvailability}
                  className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
                >
                  儲存設定
                </button>
                {message && <p className="text-green-600 text-center mt-3 text-sm font-semibold">{message}</p>}
              </div>
            </div>
            <ManualBookingForm onManualAddBooking={onManualAddBooking} />
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b pb-3">總行程列表</h2>
            <div className="overflow-x-auto max-h-[90vh]">
              {combinedSchedule.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">預約狀態</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成交狀態</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期 & 時間</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客戶</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">來源</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {combinedSchedule.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <select 
                            value={item.status}
                            onChange={(e) => {
                                const newStatus = e.target.value as BookingStatus;
                                if(item.itemType === 'booking') onUpdateBookingStatus(item.id, newStatus);
                                else onUpdateCustomRequestStatus(item.id, newStatus);
                            }}
                            className={`p-1.5 rounded-md text-xs border-gray-300 focus:outline-none focus:ring-orange-500 focus:border-orange-500 ${statusColors[item.status]}`}
                          >
                            <option>待確認</option>
                            <option>已確認</option>
                            <option>已完成</option>
                            <option>已取消</option>
                          </select>
                        </td>
                         <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <select 
                            value={item.dealStatus}
                            onChange={(e) => {
                                const newDealStatus = e.target.value as DealStatus;
                                if(item.itemType === 'booking') onUpdateBookingDealStatus(item.id, newDealStatus);
                                else onUpdateCustomRequestDealStatus(item.id, newDealStatus);
                            }}
                            className={`p-1.5 rounded-md text-xs border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${dealStatusColors[item.dealStatus]}`}
                          >
                            <option>洽談中</option>
                            <option>已成交</option>
                            <option>未成交</option>
                          </select>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="font-semibold text-gray-900">{item.displayDate}</div>
                            <div className="text-gray-500">{item.displayTime}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="font-semibold text-gray-900">{item.customerName}</div>
                            <div className="text-gray-500">{item.customerPhone}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{item.source}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button onClick={() => handleOpenNotesModal(item)} className="text-orange-600 hover:text-orange-900 font-medium">備註</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-12"><p className="text-gray-500">尚無任何行程</p></div>
              )}
            </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProfileManagement currentUser={currentUser} onUpdateUser={onUpdateUser} />
        {currentUser.role === 'superadmin' && (
          <UserManagement users={users} />
        )}
      </div>

      {selectedItemForNotes && (
        <NotesModal
            isOpen={notesModalOpen}
            onClose={() => setNotesModalOpen(false)}
            item={selectedItemForNotes}
            currentUser={currentUser}
            onAddNote={handleAddNoteSubmit}
        />
      )}
    </div>
  );
};

export default AdminPanel;