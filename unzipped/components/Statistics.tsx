import React, { useMemo } from 'react';
import { Booking } from '../types';

interface StatisticsProps {
  bookings: Booking[];
}

// FIX: Changed icon type from JSX.Element to React.ReactNode to resolve namespace error.
const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex items-center space-x-4">
    <div className="bg-orange-100 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-orange-600">{value}</p>
    </div>
  </div>
);

const Statistics: React.FC<StatisticsProps> = ({ bookings }) => {
  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Sunday as the first day of the week
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7);

    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    lastDayOfMonth.setHours(23, 59, 59, 999);

    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
    lastDayOfYear.setHours(23, 59, 59, 999);

    let todaysBookings = 0;
    let weeklyBookings = 0;
    let monthlyBookings = 0;
    let yearlyBookings = 0;

    bookings.forEach(b => {
      const bookingDate = new Date(b.date);
      bookingDate.setHours(0,0,0,0); // Normalize time part

      if (bookingDate.getTime() >= today.getTime() && bookingDate.getTime() < tomorrow.getTime()) {
        todaysBookings++;
      }
      if (bookingDate >= firstDayOfWeek && bookingDate < lastDayOfWeek) {
        weeklyBookings++;
      }
      if (bookingDate >= firstDayOfMonth && bookingDate <= lastDayOfMonth) {
        monthlyBookings++;
      }
      if (bookingDate >= firstDayOfYear && bookingDate <= lastDayOfYear) {
        yearlyBookings++;
      }
    });

    return { todaysBookings, weeklyBookings, monthlyBookings, yearlyBookings };
  }, [bookings]);

  return (
    <>
      <div className="lg:col-span-1">
        <StatCard title="今日預約" value={stats.todaysBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
      </div>
      <div className="lg:col-span-1">
        <StatCard title="本週預約" value={stats.weeklyBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>} />
      </div>
      <div className="lg:col-span-1">
        <StatCard title="本月預約" value={stats.monthlyBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>} />
      </div>
      <div className="lg:col-span-1">
        <StatCard title="年度預約" value={stats.yearlyBookings} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>} />
      </div>
    </>
  );
};

export default Statistics;