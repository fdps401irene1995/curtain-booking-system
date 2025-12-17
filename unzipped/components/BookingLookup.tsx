import React, { useState } from 'react';
import { Booking, CustomRequest, BookingStatus } from '../types';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface BookingLookupProps {
  // No props needed
}

const statusColors: { [key in BookingStatus]: string } = {
  '待確認': 'bg-yellow-100 text-yellow-800',
  '已確認': 'bg-green-100 text-green-800',
  '已完成': 'bg-blue-100 text-blue-800',
  '已取消': 'bg-red-100 text-red-800',
};

const BookingLookup: React.FC<BookingLookupProps> = () => {
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<( (Booking & {type: '預約'}) | (CustomRequest & {type: '請求'}) )[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('請輸入您的手機號碼。');
      return;
    }
    setError('');
    setIsLoading(true);
    setHasSearched(true);
    setSearchResults([]);

    try {
        const phoneQuery = phone.trim();
        
        // Query bookings
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(bookingsRef, where('customerPhone', '==', phoneQuery));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const foundBookings = bookingsSnapshot.docs.map(doc => ({ ...(doc.data() as Booking), id: doc.id, type: '預約' as const }));

        // Query requests
        const requestsRef = collection(db, 'customRequests');
        const requestsQuery = query(requestsRef, where('customerPhone', '==', phoneQuery));
        const requestsSnapshot = await getDocs(requestsQuery);
        const foundRequests = requestsSnapshot.docs.map(doc => ({ ...(doc.data() as CustomRequest), id: doc.id, type: '請求' as const }));
        
        const combined = [...foundBookings, ...foundRequests];
        
        combined.sort((a, b) => {
            const dateA = 'date' in a ? a.date : a.requestedDate;
            const dateB = 'date' in b ? b.date : b.requestedDate;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        setSearchResults(combined);

    } catch (err) {
        console.error("Error searching bookings:", err);
        setError('查詢時發生錯誤，這可能是由於安全規則限制，請聯繫管理員。');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-orange-600 text-center">預約紀錄查詢</h2>
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
              setPhone(e.target.value);
              setHasSearched(false); // Reset search on new input
          }}
          placeholder="請輸入預約手機號碼"
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 w-full sm:w-64 bg-white text-gray-900"
        />
        <button type="submit" disabled={isLoading} className="w-full sm:w-auto px-6 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
          {isLoading ? '查詢中...' : '查詢'}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
      
      {isLoading && (
        <div className="text-center py-8">
            <svg className="animate-spin h-6 w-6 text-orange-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-2 text-gray-500">查詢中，請稍候...</p>
        </div>
      )}

      {!isLoading && hasSearched && (
        <div>
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map(item => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-gray-800">
                        { 'date' in item ? item.date : item.requestedDate } 
                        {' @ '}
                        { 'time' in item ? item.time : item.requestedTime }
                      </p>
                       <p className="text-sm text-gray-500">{item.customerAddress}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
               <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-md font-medium text-gray-900">查無紀錄</h3>
              <p className="mt-1 text-sm text-gray-500">找不到與此手機號碼相關的預約，請確認號碼是否正確。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingLookup;