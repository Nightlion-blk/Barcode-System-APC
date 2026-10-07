import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users');
    const [logs, setLogs] = useState([]);
    const [toast, setToast] = useState(null);
    const [editingUser, setEditingUser] = useState(null);
    
    // Default users state
    const [users, setUsers] = useState([
        { id: 1, firstName: 'Arth', lastName: 'Mendoza', username: 'arth_m', role: 'Admin' },
        { id: 2, firstName: 'John', lastName: 'Doe', username: 'jdoe_enc', role: 'Bar Encoder' }
    ]);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', username: '', tempPassword: '', role: 'encoder'
    });

    const handleLogout = () => {
        localStorage.removeItem('activeRole');
        navigate('/login');
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const logAuditAction = (user, actionType, details) => {
        let existingLogs = JSON.parse(localStorage.getItem('stockflow_audit_logs')) || [
            { timestamp: 'Oct 02, 2026 13:15:00', user: 'arth_m (Admin)', actionType: 'CREATE_USER', details: 'Created new account for jdoe_enc' }
        ];
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString();
        
        existingLogs.unshift({ timestamp, user, actionType, details });
        localStorage.setItem('stockflow_audit_logs', JSON.stringify(existingLogs));
        setLogs(existingLogs);
    };

    // Load logs automatically when the audit tab is clicked
    useEffect(() => {
        if (activeTab === 'audit') {
            const storedLogs = JSON.parse(localStorage.getItem('stockflow_audit_logs')) || [
                { timestamp: 'Oct 02, 2026 13:15:00', user: 'arth_m (Admin)', actionType: 'CREATE_USER', details: 'Created new account for jdoe_enc' }
            ];
            setLogs(storedLogs);
        }
    }, [activeTab]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const roleText = formData.role === 'admin' ? 'Admin' : formData.role === 'coordinator' ? 'Coordinator' : 'Bar Encoder';

        if (editingUser) {
            setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData, role: roleText } : u));
            logAuditAction('arth_m (Admin)', 'UPDATE_USER', `Updated account credentials for ${formData.username}`);
            showToast(`Account updated for ${formData.firstName} ${formData.lastName}!`, 'success');
            setEditingUser(null);
        } else {
            const newUser = { id: Date.now(), ...formData, role: roleText };
            setUsers([newUser, ...users]);
            logAuditAction('arth_m (Admin)', 'CREATE_USER', `Created new account for ${formData.username} (${roleText})`);
            showToast(`Account created for ${formData.firstName} ${formData.lastName}!`, 'success');
        }
        setFormData({ firstName: '', lastName: '', username: '', tempPassword: '', role: 'encoder' });
    };

    const handleEdit = (user) => {
        setFormData({ firstName: user.firstName, lastName: user.lastName, username: user.username, tempPassword: '', role: user.role.toLowerCase().replace(' ', '') });
        setEditingUser(user);
        showToast('User data loaded into form for editing.', 'info');
    };

    const handleDelete = (id, username) => {
        setUsers(users.filter(u => u.id !== id));
        logAuditAction('arth_m (Admin)', 'DELETE_USER', `Revoked account access for ${username}`);
        showToast('User account revoked.', 'error');
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setFormData({ firstName: '', lastName: '', username: '', tempPassword: '', role: 'encoder' });
        showToast('Editing cancelled.', 'info');
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen p-8 font-sans">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col items-start mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-5">
                    <div>
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Superuser</span>
                        <h1 className="text-2xl font-bold text-slate-800 mt-2">Admin Command Center</h1>
                        <p className="text-slate-500 text-sm">Manage Accounts, Permissions & System Logs</p>
                    </div>
                    
                    <div className="w-full flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-inner">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 hidden sm:inline-block self-center">Workspaces:</span>

                        <nav aria-label="Workspaces" className="flex flex-1 flex-wrap items-center gap-2">
                            <button onClick={() => navigate('/coordinator')} className="flex min-w-[10rem] flex-1 items-center justify-center bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-sm transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1.5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                                Coordinator Dashboard
                            </button>

                            <button onClick={() => navigate('/encoder')} className="flex min-w-[10rem] flex-1 items-center justify-center bg-white text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-sm transition-all shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1.5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
                                </svg>
                                Encoder Terminal
                            </button>
                        </nav>

                        <div className="h-6 w-[1px] bg-slate-300 mx-1 hidden md:block"></div>

                        <button onClick={handleLogout} className="flex w-full items-center justify-center bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-xl hover:bg-rose-50 font-semibold text-sm transition-all shadow-sm sm:w-auto">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-6 border-b border-slate-200 pb-2">
                    <button onClick={() => setActiveTab('users')} className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'users' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                        User Management
                    </button>
                    <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 font-bold text-sm rounded-xl transition-all ${activeTab === 'audit' ? 'bg-red-600 text-white shadow-md shadow-red-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'}`}>
                        System Audit Logs
                    </button>
                </div>

                {/* SECTION 1: User Management */}
                {activeTab === 'users' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                        {/* Form */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 col-span-1 h-fit">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">{editingUser ? "Edit Account" : "Create New Account"}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">First Name</label>
                                        <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Last Name</label>
                                        <input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleFormChange} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Temp Password</label>
                                    <input type="password" name="tempPassword" value={formData.tempPassword} onChange={handleFormChange} required={!editingUser} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Assign Role</label>
                                    <select name="role" value={formData.role} onChange={handleFormChange} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500 text-slate-700">
                                        <option value="encoder">Bar Encoder</option>
                                        <option value="coordinator">Coordinator</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                    <button type="submit" className={`w-full text-white font-semibold py-2.5 rounded-xl shadow-md transition-all text-sm ${editingUser ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-red-600 hover:bg-red-700 shadow-red-200'}`}>
                                        {editingUser ? "Update Account" : "Register User"}
                                    </button>
                                    {editingUser && (
                                        <button type="button" onClick={cancelEdit} className="bg-slate-200 text-slate-700 font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-300 transition-all text-sm">
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {/* Table */}
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 col-span-2">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Active Employees</h2>
                            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="p-4 font-bold text-xs uppercase text-slate-600">Name</th>
                                            <th className="p-4 font-bold text-xs uppercase text-slate-600">Username</th>
                                            <th className="p-4 font-bold text-xs uppercase text-slate-600">Role</th>
                                            <th className="p-4 font-bold text-xs uppercase text-slate-600">Status</th>
                                            <th className="p-4 font-bold text-xs uppercase text-slate-600 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4 text-sm font-medium text-slate-800">{user.firstName} {user.lastName}</td>
                                                <td className="p-4 text-sm text-slate-600 font-mono">{user.username}</td>
                                                <td className="p-4 text-sm text-slate-600">{user.role}</td>
                                                <td className="p-4 text-sm"><span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">ACTIVE</span></td>
                                                <td className="p-4 text-sm text-center">
                                                    <button onClick={() => handleEdit(user)} className="text-red-600 hover:underline font-semibold text-xs mr-3">Edit</button>
                                                    {user.username !== 'arth_m' && (
                                                        <button onClick={() => handleDelete(user.id, user.username)} className="text-rose-600 hover:underline font-semibold text-xs">Delete</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION 2: System Audit Logs */}
                {activeTab === 'audit' && (
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Live System Activity Logs</h2>
                            <button onClick={() => showToast('Audit log export initiated...', 'success')} className="text-sm font-semibold text-red-600 hover:text-red-800 flex items-center transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                Download CSV
                            </button>
                        </div>
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Timestamp</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">User</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Action Type</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                            <td className="p-4 text-sm text-slate-500 font-mono">{log.timestamp}</td>
                                            <td className="p-4 text-sm font-medium text-slate-800">{log.user}</td>
                                            <td className="p-4 text-sm"><span className="px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-bold">{log.actionType}</span></td>
                                            <td className="p-4 text-sm text-slate-600">{log.details}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast Notification Container */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 flex flex-col gap-3">
                    <div className={`px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-rose-600 shadow-rose-200/50' : 'bg-red-600 shadow-red-200/50'}`}>
                        <svg className={`w-5 h-5 ${toast.type === 'error' ? 'text-rose-100' : 'text-red-100'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}