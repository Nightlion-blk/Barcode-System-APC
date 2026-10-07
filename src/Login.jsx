import React, { useState } from 'react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const handleLogin = (e) => {
        e.preventDefault();
        const trimmedUser = username.toLowerCase().trim();
        setIsLoading(true);

        // Persist active role using localStorage
        localStorage.setItem('activeRole', trimmedUser);

        setTimeout(() => {
            if (trimmedUser === 'admin') {
                window.location.href = '/admin'; 
            } else if (trimmedUser === 'coordinator') {
                window.location.href = '/coordinator';
            } else if (trimmedUser === 'encoder') {
                window.location.href = '/encoder';
            } else {
                setIsLoading(false);
                setToast({ message: 'Access Denied: Invalid username provided.', type: 'error' });
                setUsername('');
                setPassword('');
                
                // Clear the toast after 3 seconds
                setTimeout(() => setToast(null), 3000);
            }
        }, 800);
    };

    return (
        <div className="bg-slate-50 min-h-screen flex items-center justify-center p-6 relative overflow-hidden font-sans">
            
            {/* Decorative Background Blobs */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-rose-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white p-8 relative z-10 transform transition-all hover:shadow-red-200/50">
                
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-600 text-white mb-4 shadow-lg shadow-red-200">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">StockFlow Pro</h1>
                    <p className="text-sm text-slate-500 mt-1">Barcode & Inventory Management</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">System Username</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <input 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                required 
                                autoComplete="off" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm shadow-sm transition-all" 
                                placeholder="Enter your role username..." 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                                className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none text-sm shadow-sm transition-all" 
                                placeholder="••••••••" 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPassword(!showPassword)} 
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-red-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-2">
                        <label className="flex items-center cursor-pointer text-slate-600">
                            <input type="checkbox" className="w-4 h-4 text-red-600 border-slate-300 rounded focus:ring-red-500" />
                            <span className="ml-2 font-medium">Remember me</span>
                        </label>
                        <a href="#" className="text-red-600 font-semibold hover:underline">Forgot password?</a>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className={`w-full text-white font-bold py-3.5 rounded-xl shadow-lg transform transition-all mt-4 flex justify-center items-center ${isLoading ? 'bg-red-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-red-200 active:scale-[0.98]'}`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Secure Login
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 ml-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Toast Notification Container */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 pointer-events-none">
                    <div className="px-5 py-3.5 rounded-xl shadow-lg bg-rose-600 shadow-rose-200/50 flex items-center gap-3 text-sm font-semibold text-white">
                        <svg className="w-5 h-5 text-rose-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}