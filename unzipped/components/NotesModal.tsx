import React, { useState, useEffect } from 'react';
import { Booking, CustomRequest, User } from '../types';

type CombinedScheduleItem = (Booking & { itemType: 'booking', displayDate: string, displayTime: string }) | 
                            (CustomRequest & { itemType: 'request', displayDate: string, displayTime: string, source: '客戶指定' });

interface NotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CombinedScheduleItem | null;
  currentUser: User;
  onAddNote: (content: string) => void;
}

const NotesModal: React.FC<NotesModalProps> = ({ isOpen, onClose, item, currentUser, onAddNote }) => {
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNewNote('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote('');
    }
  };

  if (!isOpen || !item) return null;
  
  const sortedNotes = item.notes.slice().sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">行程備註</h3>
              <p className="text-md text-gray-600 mt-1">
                {item.displayDate} @ {item.displayTime} - {item.customerName}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <div className="mt-6 space-y-4">
            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 bg-gray-50 p-3 rounded-lg border">
                {sortedNotes.length > 0 ? sortedNotes.map(note => (
                    <div key={note.id} className="text-sm bg-white p-2.5 rounded-md shadow-sm border border-gray-200">
                        <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                        <p className="text-xs text-gray-400 mt-2 text-right">
                           - {note.authorName} 於 {new Date(note.timestamp).toLocaleString('zh-TW')}
                        </p>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500 text-center py-4">尚無備註。</p>
                )}
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="new-note" className="block text-sm font-medium text-gray-700 mb-1">
                新增備註 (操作者: {currentUser.username})
              </label>
              <textarea
                id="new-note"
                rows={4}
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
                placeholder="輸入備註內容..."
              ></textarea>
              <div className="pt-4 flex justify-end">
                <button type="submit" className="px-4 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700">
                  儲存備註
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesModal;