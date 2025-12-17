import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { User } from '../types';

interface AuthProps {
  // No props needed now
}

const Auth: React.FC<AuthProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [isLoginView, setIsLoginView] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in App.tsx will handle the UI update.
    } catch (error: any) {
      console.error("Login failed:", error.code);
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('帳號或密碼錯誤，請再試一次。');
          break;
        case 'auth/network-request-failed':
          setError('網路連線失敗，請檢查您的網路設定。');
          break;
        default:
          setError('登入失敗，請稍後再試。');
      }
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!email) {
      setError('請輸入您的電子郵件地址。');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('密碼重設郵件已寄出，請檢查您的信箱。');
      setIsForgotPassword(false);
      setEmail('');
    } catch (error: any)
    {
      setError('無法寄送密碼重設郵件，請確認電子郵件是否正確。');
    }
  };


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不相符。');
      return;
    }
    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元。');
      return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Note: This logic assumes the first user to register is the superadmin.
        // Production apps might need a more robust way to handle this (e.g., cloud function, invite codes).
        const newUser: Omit<User, 'id' | 'password'> = { 
            username,
            email,
            role: 'superadmin' 
        };

        await setDoc(doc(db, "users", user.uid), newUser);
        
        setMessage('超級管理員註冊成功！您現在可以登入。');
        setIsLoginView(true);
    } catch (error: any) {
        if(error.code === 'auth/email-already-in-use') {
            setError('此電子郵件已被註冊。');
        } else {
            console.error("Registration Error:", error);
            setError('註冊失敗，請稍後再試。');
        }
    }
  };

  const ForgotPasswordView = () => (
    <div className="space-y-6">
       <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">
          忘記密碼
        </h2>
        <p className="text-center text-sm text-gray-500">請輸入您的註冊電子郵件以接收密碼重設連結。</p>
        <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label htmlFor="email-reset" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email-reset"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            {message && <p className="text-green-600 text-sm text-center">{message}</p>}
            <button
              type="submit"
              className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105"
            >
              發送重設郵件
            </button>
             <p className="text-center text-sm text-gray-600">
                <button type="button" onClick={() => { setIsForgotPassword(false); setError(''); setMessage(''); }} className="font-medium text-orange-600 hover:text-orange-500">
                    返回登入
                </button>
            </p>
        </form>
    </div>
  );
  
  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        {isForgotPassword ? <ForgotPasswordView /> : isLoginView ? (
          <div>
            <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">管理員登入</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input id="email-login" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
              <div>
                <div className="flex justify-between">
                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
                        密碼
                    </label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setError(''); setMessage(''); }} className="text-sm font-medium text-orange-600 hover:text-orange-500">忘記密碼？</button>
                </div>
                <input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105">
                登入
              </button>
              <p className="text-center text-sm text-gray-600">
                  還沒有帳號？{' '}
                  <button type="button" onClick={() => { setIsLoginView(false); setError(''); }} className="font-medium text-orange-600 hover:text-orange-500">
                      點此註冊
                  </button>
              </p>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">註冊超級管理員</h2>
            <form onSubmit={handleRegister} className="space-y-6">
              <p className="text-center text-sm text-gray-500">首次使用請先註冊一組超級管理員帳號。</p>
              <div>
                <label htmlFor="username-reg" className="block text-sm font-medium text-gray-700">設定管理員名稱</label>
                <input id="username-reg" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
               <div>
                <label htmlFor="email-reg" className="block text-sm font-medium text-gray-700">Email (將作為登入帳號)</label>
                <input id="email-reg" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
              <div>
                <label htmlFor="password-reg" className="block text-sm font-medium text-gray-700">設定密碼</label>
                <input id="password-reg" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
              <div>
                <label htmlFor="confirm-password-reg" className="block text-sm font-medium text-gray-700">確認密碼</label>
                <input id="confirm-password-reg" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 bg-white text-gray-900"/>
              </div>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              {message && <p className="text-green-500 text-sm text-center">{message}</p>}
              <button type="submit" className="w-full bg-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-transform transform hover:scale-105">
                註冊
              </button>
               <p className="text-center text-sm text-gray-600">
                  已經有帳號了？{' '}
                  <button type="button" onClick={() => { setIsLoginView(true); setError(''); }} className="font-medium text-orange-600 hover:text-orange-500">
                      點此登入
                  </button>
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;