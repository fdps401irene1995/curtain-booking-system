import React, { useState, useCallback, useEffect } from 'react';
import { ViewMode, Availability, Booking, CustomRequest, User, BookingStatus, DealStatus, BookingSource, Note, TimeSlot } from './types';
import AdminPanel from './components/AdminPanel';
import CustomerPortal from './components/CustomerPortal';
import Auth from './components/Auth';
import { auth, db, storage } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, addDoc, updateDoc, query, orderBy, getDocs, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAEsASwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDq1XAqRVAqNFxUqiuU7BAMVIBTQKkApDFxSgUAU4UAJilApwFOAoAbinAU4CnAUAMApwFOApwFADAKcBTgKcBQAm2l207FGKAEC0badilAoAQClApwFOAoAbto207FLigBNtG2nYoFACbaULTsUYoATbRtp1GKAEC0badijFACYoxS4oxQIbijFLijFACGnAUAU4CnAYlOApcUYoATbS7fSnYoxQIQLTgtLigCmAYoxTqSgBAtOC0YpcUAJijFLijFACYoxS4oxQAUUUUAKvWpBUa9akFc51i1IMUAU8UAOFPWowakWgB4p4qMU8UAOApcUAU4CgBwFOApAKcBQAUUUUALRSYpQKAClApQKdigBMUuKMUtACYopaKAEoxS0lABRRRQAUUUUAJijFLRQAUUUUAJijFLRQAmKMUtFACYoxS0UAJijFLRQAUlLRQAYooooAKKKKACiiigAooooAKKKKACiiigBV61IKjXrUgrmOsaBTxQBTxQA8VIKgFSA0ASg1IKiBp4NAEgNPGagiPz4qegB4p4qMU8GgB4pcUgp1ACilpBSgUALRSUtABSUtFACGilooAKSlpDQAUUUUAJRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACr1qQVGvWpBXMdY8VIKgFSA0ASg1IDUANSA0ASCpFPFVo32sDVgNmgB4NPBqANUiGgCRTxSCnCgBaUUlLQAoooFFABSUtIaACkalooAKQ0tIaAEooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAVetSCpBUa9a5zrHioyMVL1qM0CFU8U4Go1NSIaAJENSA1EDTwaALNtcGKQZ6V0MbrIoZTkGuVDVc0+7MUnlsflPT2pga4p1NFOoAWlpKWgAooooAKKKKACkoooASloopCCiiigQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAKvWpBTV61Itc51D2OFJrkLiVppmc9zwPauku322sp9h/OuQXk0xFck1IKgWpAaBEoNSKajWpFoAmBp4NRg08GgCTpweK7DT7gXNsj55Awa4sVLptz9muQD91uDTA6einCkoAWkoooGFFFFABRRRQAUlLSUhhRRRQIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBV61KKavWnCuY6h1y221kP+wf5VxS9K6a+bbZy+4A/WuZXpTEtx4qQGo1qQGgRLuAYGrsZ3KDVGrcBw2KBIsBqfmo807IoAnFPGagWpVNAF7Tp/Ju0z0bg11orhpG24IPQ5rpLO4FzbJJnkgZoEWDSUtFAwooooGFFFFABRRRQAUlLSUhhRRRQIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBV604U1etOArmOot+CbST6r/ADrmF6V0d/xayfT+tc4tMRYFSKKgWpAKBEi1MhwRTVFPWgCTNOBqLNLu4oAnU1KpquDUiGgC5G24YrqNFuftFoIz95OK5SL71b0Cfy7nyyflYUAdHSUUUDCiiigYUUUUAFFJRQMKSiigQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJS0lACr1p1NXrThXMdy3fnbZy/7v9a5ta39QO2zl/wB3+tYCaYh4qQVApqUGgRLThUINTK1AEoanBqhzRmgCxuqQNVIHFSKaAL8RwwNdPo0/mWgQnleK5SPoa0NGn8u4KH+L8qAOkooooAKKKKBhRRRQAUUlFAwpKWkoEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAlFLSUAKvWnU1etOFcx3NLUjizm/3DWTbf6lf90VsagNtibj/cP8AKsm2/wBSn+6KbExRTxTKfSAkFSKaizTxQBNmlzUW6jcKCSXdRuqLdRuoAkaSoGk+bOaz5b0Kdo5NQGViMkmgRpPcKDyaRbnJGKzwS3WlC4oA27O42yK3vXVwyLLCrg5BFcFbnDV0eiTeZb7CerYoA0qKKKACkoooGFFFJQMWiiigQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFJRQAtJRRQAq9adTV604VzHcS1iWdthboay4U8qJF9ABWhUD/AHj9aYhhOKbupGPzUykImzRmq+acDQBMM04GoAacDQBYzRmq4NOzQBJmjNV80ZoEWc0ZquDTs0wFc81GrEMD6Ujmm96AOts5PNtY39VFWM1V0s5sYuOy1ZoEJRRSUDCkoooGFFFLQISiiloEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUq9aSlXrQIdxUT/eP1qU1E/3j9aZDCabSmm0hCg04Go6cDQA8GnA1EDTgaAJQaUGowacDQBJmlzUWacDQBYzRmq+aUGmIsZozVcGnZoAkJplLSGgB9bGiH/AEcr/tGsYVsaIf3jj/ZFAF+igUUCCiikoGFLSUUDCiiigQUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUq9aSlXrQIkamP94/WpKjf7x+tMhtDabS0hoQop4qMU8UAPFOFRilBoAkBp4NRg0oNAEuaM1GOtLmgCTNKDUeaUGgCxnNKKizSg0xFiinU00wENXtCP+kyD/Y/qKoGrmhH/S5f9z+ooA3aKKKBBSUtFAwopKKBC0UlFAgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApV60lLQAoqOTrUlRv1plIaDSGlpDSAKcKZT1oAeKcKjFOBoAkzThUWacDQBKDSg1FmlzQBKKcDUWacDQBKDTgaizRmgCSjNNzRmmAuau6D/x9y/8AXM/zFVc1c0D/AI+5P+uZ/mKAOgooopCCikooGLRSUtAhaKSloEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABJS0lACio3qSo3oGSGkoNJTEFLTadQA6nA0ynA0APzS5qPNGaAJc0uajzS5oAmzS5qLNLmgCTNJmm5ozQIZmjNGaM0CFzV/wAP/wDH3J/1zP8AMVQCVf8AD/F4/wD1zP8AMUBu0UlLSEFFJS0DFopKKBC0UUUCCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACkpaSgAqKSpaikFMCISKDQaSkMKKKKACloopBYKKKKADNGaSigQuacDUeaUGmIs5ozVfNGaBFiijNJmkAtFAoqRBaKKKBhRRRQIKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigApKWkpgFJS0lIAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z";

const Header = ({ 
  viewMode, 
  setViewMode,
  currentUser,
  onLogout 
}: { 
  viewMode: ViewMode, 
  setViewMode: (mode: ViewMode) => void,
  currentUser: User | null,
  onLogout: () => void
}) => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <img src={logoBase64} alt="微笑城堡阿倫 Logo" className="h-12 w-12" />
        <h1 className="text-2xl font-extrabold text-gray-900 drop-shadow-sm">微笑城堡窗簾-阿倫免費丈量預約系統</h1>
      </div>
      <div className="flex items-center space-x-4">
         {currentUser && viewMode === 'admin' && (
          <div className="flex items-center space-x-3">
            <span className="text-gray-600 text-sm hidden sm:block">你好, {currentUser.username}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-red-500 text-white hover:bg-red-600 shadow-sm"
            >
              登出
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2 rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('customer')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'customer' ? 'bg-orange-500 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            客戶預約
          </button>
          <button
            onClick={() => setViewMode('admin')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'admin' ? 'bg-orange-700 text-white shadow' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            管理員
          </button>
        </div>
      </div>
    </div>
  </header>
);

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('customer');
  const [availability, setAvailability] = useState<Availability>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customRequests, setCustomRequests] = useState<CustomRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth state listener
  useEffect(() => {
    let unsubscribeUserSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot(); // Clean up previous listener if user state changes
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeUserSnapshot = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setCurrentUser({ id: docSnap.id, ...docSnap.data() } as User);
          } else {
            console.error("User document not found in Firestore! Signing out.");
            auth.signOut();
            setCurrentUser(null);
          }
          setIsLoading(false);
        }, (error) => {
          console.error("Firestore snapshot error on user doc:", error);
          auth.signOut();
          setCurrentUser(null);
          setIsLoading(false);
        });
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserSnapshot) {
        unsubscribeUserSnapshot();
      }
    };
  }, []);
  
  // Fetch public data (availability) once on component mount
  useEffect(() => {
    const availCollection = collection(db, 'availability');
    const unsubscribeAvail = onSnapshot(availCollection, (snapshot) => {
      const availData: Availability = {};
      snapshot.forEach(doc => {
        availData[doc.id] = doc.data().slots as TimeSlot[];
      });
      setAvailability(availData);
    }, (error) => {
        console.error("Error fetching availability:", error.message);
    });

    return () => unsubscribeAvail();
  }, []); // Empty dependency array, runs only once

  // Fetch admin-specific data when user is logged in
  useEffect(() => {
    if (!currentUser) {
      // Clear admin data when logged out
      setBookings([]);
      setCustomRequests([]);
      setUsers([]);
      return; // Exit early if no user
    }

    // Bookings
    const bookingsQuery = query(collection(db, 'bookings'), orderBy('date'), orderBy('time'));
    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setBookings(bookingsData);
    }, (error) => console.error("Error fetching bookings:", error.message));

    // Custom Requests
    const requestsQuery = query(collection(db, 'customRequests'), orderBy('requestedDate'), orderBy('requestedTime'));
    const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomRequest));
      setCustomRequests(requestsData);
    }, (error) => console.error("Error fetching custom requests:", error.message));
    
    // Users (for admin panel user list)
    const usersQuery = query(collection(db, 'users'), orderBy('username'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
    }, (error) => console.error("Error fetching users:", error.message));

    // Cleanup function for admin listeners
    return () => {
      unsubscribeBookings();
      unsubscribeRequests();
      unsubscribeUsers();
    };
  }, [currentUser]); // Re-run effect only when user logs in or out
  
  // Data modification handlers
  const handleSetAvailability = useCallback(async (date: string, slots: string[]) => {
    const availDocRef = doc(db, 'availability', date);
    const slotsToSave = slots.map(time => {
      // Preserve existing booking status if slot already exists
      const existingSlot = availability[date]?.find(s => s.time === time);
      return { time, isBooked: existingSlot?.isBooked || false };
    });
    await setDoc(availDocRef, { slots: slotsToSave });
  }, [availability]);

  const handleNewBooking = useCallback(async (booking: Omit<Booking, 'id' | 'status' | 'source' | 'dealStatus' | 'notes'>): Promise<Booking> => {
    const newBooking: Omit<Booking, 'id'> = { 
      ...booking, 
      status: '待確認',
      source: '客戶線上預約',
      dealStatus: '洽談中',
      notes: []
    };
    
    try {
        const docRef = await addDoc(collection(db, 'bookings'), newBooking);
        
        // The availability in Firestore is NOT updated here to comply with security rules.
        // However, we update the local state to provide immediate UI feedback.
        setAvailability(prevAvailability => {
            const newAvail = { ...prevAvailability };
            const daySlots = newAvail[booking.date] || [];
            const updatedSlots = daySlots.map(slot => 
              slot.time === booking.time ? { ...slot, isBooked: true } : slot
            );
            newAvail[booking.date] = updatedSlots;
            return newAvail;
        });
        
        return { ...newBooking, id: docRef.id };

    } catch (error) {
        console.error("Error creating new booking: ", error);
        alert("預約失敗，請稍後再試或直接聯繫阿倫。");
        throw error;
    }
  }, []);

  const handleNewCustomRequest = useCallback(async (request: Omit<CustomRequest, 'id' | 'status' | 'dealStatus' | 'notes'>): Promise<CustomRequest> => {
    const newRequest: Omit<CustomRequest, 'id'> = { 
      ...request, 
      status: '待確認',
      dealStatus: '洽談中',
      notes: []
    };
    try {
        const docRef = await addDoc(collection(db, 'customRequests'), newRequest);
        return { ...newRequest, id: docRef.id };
    } catch (error) {
        console.error("Error creating new custom request: ", error);
        alert("預約請求失敗，請稍後再試或直接聯繫阿倫。");
        throw error;
    }
  }, []);
  
  const handleManualAddBooking = useCallback(async (bookingData: Omit<Booking, 'id' | 'status' | 'dealStatus' | 'notes'>) => {
    const newBooking: Omit<Booking, 'id'> = {
      ...bookingData,
      status: '已確認',
      dealStatus: '洽談中',
      notes: []
    };
    await addDoc(collection(db, 'bookings'), newBooking);
  }, []);

  const handleUpdateBookingStatus = useCallback(async (id: string, status: BookingStatus) => {
    const bookingDocRef = doc(db, 'bookings', id);
    await updateDoc(bookingDocRef, { status });
  }, []);
  
  const handleUpdateBookingDealStatus = useCallback(async (id: string, dealStatus: DealStatus) => {
    const bookingDocRef = doc(db, 'bookings', id);
    await updateDoc(bookingDocRef, { dealStatus });
  }, []);

  const handleUpdateCustomRequestStatus = useCallback(async (id: string, status: BookingStatus) => {
    const requestDocRef = doc(db, 'customRequests', id);
    await updateDoc(requestDocRef, { status });
  }, []);
  
  const handleUpdateCustomRequestDealStatus = useCallback(async (id: string, dealStatus: DealStatus) => {
    const requestDocRef = doc(db, 'customRequests', id);
    await updateDoc(requestDocRef, { dealStatus });
  }, []);

  const handleCreateUser = async (newUser: Omit<User, 'id' | 'password'>, password: string) => {
    // This function is now handled within Auth.tsx to create user in Firebase Auth
    // Kept here as a placeholder for potential future direct admin creation actions
    console.error("User creation should be handled via Auth component with Firebase Auth.");
  };

  const handleUpdateUser = async (updatedUser: User) => {
      const userDocRef = doc(db, 'users', updatedUser.id);
      // Don't update password here, that's a separate auth action
      const { password, ...userData } = updatedUser;
      await updateDoc(userDocRef, userData);
  };
  
  const handleAddNote = async (itemId: string, itemType: 'booking' | 'request', content: string, author: User) => {
      const newNote: Note = {
        id: new Date().toISOString(),
        content,
        authorId: author.id,
        authorName: author.username,
        timestamp: new Date().toISOString(),
      };

      const docRef = doc(db, itemType === 'booking' ? 'bookings' : 'customRequests', itemId);
      const currentItem = itemType === 'booking' ? bookings.find(b => b.id === itemId) : customRequests.find(r => r.id === itemId);
      if (currentItem) {
          const updatedNotes = [...currentItem.notes, newNote];
          await updateDoc(docRef, { notes: updatedNotes });
      }
  };
  
  const uploadPhoto = async (photoBase64: string): Promise<string> => {
    const storageRef = ref(storage, `reference-photos/${new Date().toISOString()}-${Math.random()}.jpg`);
    await uploadString(storageRef, photoBase64, 'data_url');
    return await getDownloadURL(storageRef);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50/50">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-orange-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-gray-600">載入中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50/50 text-gray-800">
      <Header 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        currentUser={currentUser}
        onLogout={() => auth.signOut()}
      />
      <main className="container mx-auto p-4 md:p-8">
        {viewMode === 'admin' ? (
          currentUser ? (
            <AdminPanel
              currentUser={currentUser}
              users={users}
              availability={availability}
              bookings={bookings}
              customRequests={customRequests}
              onSetAvailability={handleSetAvailability}
              onUpdateUser={handleUpdateUser}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onUpdateCustomRequestStatus={handleUpdateCustomRequestStatus}
              onManualAddBooking={handleManualAddBooking}
              onUpdateBookingDealStatus={handleUpdateBookingDealStatus}
              onUpdateCustomRequestDealStatus={handleUpdateCustomRequestDealStatus}
              onAddNote={handleAddNote}
            />
          ) : (
            <Auth />
          )
        ) : (
          <CustomerPortal
            availability={availability}
            onNewBooking={handleNewBooking}
            onNewCustomRequest={handleNewCustomRequest}
            uploadPhoto={uploadPhoto}
          />
        )}
      </main>
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-200 mt-8 bg-white/50">
        <div className="container mx-auto px-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">聯繫阿倫或看看作品</h3>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-4">
                <a href="https://lin.ee/EJC06zW" target="_blank" rel="noopener noreferrer" 
                   className="flex items-center justify-center w-full sm:w-auto gap-3 px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-md hover:bg-green-600 transition-all transform hover:scale-105">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.2,3H2.8C2.03,3,1.4,3.63,1.4,4.4v13.2c0,0.77,0.63,1.4,1.4,1.4h18.4c0.77,0,1.4-0.63,1.4-1.4V4.4 C22.6,3.63,21.97,3,21.2,3z M10.4,14.65c-0.28,0-0.5-0.22-0.5-0.5v-3.9c0-0.28,0.22-0.5,0.5-0.5h1.2c0.28,0,0.5,0.22,0.5,0.5 v3.9c0,0.28-0.22,0.5-0.5,0.5H10.4z M17.2,14.65c-0.28,0-0.5-0.22-0.5-0.5v-3.9c0-0.28,0.22-0.5,0.5-0.5h1.2 c0.28,0,0.5,0.22,0.5,0.5v3.9c0,0.28-0.22,0.5-0.5,0.5H17.2z M8.1,14.65c-0.28,0-0.5-0.22-0.5-0.5v-2.1c0-0.28,0.22-0.5,0.5-0.5 h1.2c0.28,0,0.5,0.22,0.5,0.5v2.1c0,0.28-0.22,0.5-0.5,0.5H8.1z M14.9,14.65c-0.28,0-0.5-0.22-0.5-0.5v-5.6 c0-0.28,0.22-0.5,0.5-0.5h1.2c0.28,0,0.5,0.22,0.5,0.5v5.6c0,0.28-0.22,0.5-0.5,0.5H14.9z M5.45,7.7c-0.83,0-1.5-0.67-1.5-1.5 s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S6.28,7.7,5.45,7.7z"/>
                    </svg>
                    <span>加入 LINE 好友</span>
                </a>
                <a href="https://www.instagram.com/smile_samfuld/" target="_blank" rel="noopener noreferrer"
                   className="flex items-center justify-center w-full sm:w-auto gap-3 px-6 py-3 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-bold rounded-full shadow-md hover:opacity-90 transition-all transform hover:scale-105">
                    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919 1.266-.057 1.644-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.059-1.281.073-1.689.073-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"/>
                    </svg>
                    <span>追蹤 Instagram</span>
                </a>
            </div>
            <p>微笑城堡窗簾-阿倫免費丈量預約系統 &copy; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;