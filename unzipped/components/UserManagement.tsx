import React from 'react';
import { User } from '../types';

interface UserManagementProps {
    users: User[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold mb-6 text-orange-800 border-b pb-3">使用者管理</h2>
            <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">現有使用者列表</h3>
                <p className="text-sm text-gray-500 mb-4">新管理員需由超級管理員提供註冊連結進行註冊。</p>
                <div className="overflow-y-auto max-h-80 border rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">帳號</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">角色</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{user.username}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800">{user.email}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'superadmin' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {user.role === 'superadmin' ? '超級管理員' : '管理員'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;