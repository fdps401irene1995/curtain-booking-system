import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../firebaseConfig';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface ProfileManagementProps {
    currentUser: User;
    onUpdateUser: (user: User) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ currentUser, onUpdateUser }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [email, setEmail] = useState(currentUser.email || '');
    const [phone, setPhone] = useState(currentUser.phone || '');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        setEmail(currentUser.email || '');
        setPhone(currentUser.phone || '');
    }, [currentUser]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Update non-password fields first
        const updatedUserPayload = { ...currentUser, email, phone };
        onUpdateUser(updatedUserPayload);

        // Handle password change if a new password is provided
        if (password) {
            if (password.length < 6) {
                setError('新密碼長度至少需要 6 個字元。');
                return;
            }

            if (password !== confirmPassword) {
                setError('兩次輸入的新密碼不相符。');
                return;
            }
            
            if (!currentPassword) {
                setError('如要變更密碼，請輸入目前密碼。');
                return;
            }
            
            const user = auth.currentUser;
            if (user && user.email) {
                const credential = EmailAuthProvider.credential(user.email, currentPassword);
                try {
                    // Re-authenticate user before changing password for security
                    await reauthenticateWithCredential(user, credential);
                    await updatePassword(user, password);
                } catch (error) {
                    setError('目前密碼不正確，無法更新密碼。');
                    return; // Stop execution if re-authentication fails
                }
            } else {
                 setError('無法驗證使用者身份，請重新登入再試。');
                 return;
            }
        }
        
        setMessage('個人資料已成功更新！');
        setPassword('');
        setConfirmPassword('');
        setCurrentPassword('');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b pb-3">個人資料管理</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">帳號 (Username)</label>
                    <p className="mt-1 text-gray-600 font-semibold">{currentUser.username}</p>
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (登入用)</label>
                    <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">聯絡電話</label>
                    <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" />
                </div>
                 <div>
                    <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">目前密碼 (如需變更密碼請填寫)</label>
                    <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">新密碼 (留空表示不變更)</label>
                    <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" />
                </div>
                <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">確認新密碼</label>
                    <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900" />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {message && <p className="text-green-600 text-sm">{message}</p>}
                <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    儲存變更
                </button>
            </form>
        </div>
    );
};

export default ProfileManagement;