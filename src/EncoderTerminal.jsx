import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import JsBarcode from 'jsbarcode';

export default function EncoderTerminal() {
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('activeRole') === 'admin';

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activePrintSku, setActivePrintSku] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toast, setToast] = useState(null);
    const barcodeRef = useRef(null);

    const inventoryData = [
        { sku: 'SKU-PAPER-A4', name: 'Premium A4 Bond Paper 70gsm', qty: 150, status: 'in_stock', lastUpdated: 'Today, 08:30 AM' },
        { sku: 'SKU-PAPER-A3', name: 'Standard A3 Copier Paper', qty: 85, status: 'in_stock', lastUpdated: 'Yesterday, 04:15 PM' },
        { sku: 'SKU-GLOSSY-01', name: 'High-Gloss Photo Paper 200gsm', qty: 5, status: 'low_stock', lastUpdated: 'Oct 4, 11:20 AM' },
        { sku: 'SKU-CARD-WHT', name: 'White Cardstock 250gsm', qty: 0, status: 'out_of_stock', lastUpdated: 'Sept 28, 09:00 AM' }
    ];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const filteredData = inventoryData.filter(item => {
        const matchesQuery = searchQuery === '' || item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = statusFilter === 'all' || item.status === statusFilter;
        return matchesQuery && matchesFilter;
    });

    const openPrintModal = (sku) => {
        setActivePrintSku(sku);
        setIsModalOpen(true);
    };

    // Render barcode graphic when modal opens
    useEffect(() => {
        if (isModalOpen && activePrintSku && barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, activePrintSku, {
                    format: "CODE128",
                    lineColor: "#1e293b",
                    width: 2,
                    height: 70,
                    displayValue: true,
                    fontSize: 14,
                    fontOptions: "bold",
                    margin: 5
                });
            } catch (e) {
                console.error("Barcode rendering error:", e);
            }
        }
    }, [isModalOpen, activePrintSku]);

    const confirmPrint = () => {
        setIsModalOpen(false);
        showToast(`Successfully sent barcode label for ${activePrintSku} to thermal printer!`, 'success');
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen p-6 font-sans">
            <div className="max-w-5xl mx-auto">
                
                {/* Header Navigation Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                    <div>
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Factory Floor Terminal</span>
                        <h1 className="text-2xl font-bold text-slate-800 mt-2">Bar Encoder Workspace</h1>
                        <p className="text-slate-500 text-sm">Scan items, verify stock status, and process print queues</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="flex items-center bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-sm shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1.5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                                Back to Admin
                            </button>
                        )}
                        <button onClick={() => { localStorage.removeItem('activeRole'); navigate('/login'); }} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-all">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Workspace */}
                <div className="space-y-6 mb-12">
                    
                    {/* Scanner Terminal */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row gap-3 mb-8">
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Scan barcode or type item name..." 
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-base"
                                autoFocus
                            />
                            
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 text-sm cursor-pointer">
                                <option value="all">All Statuses</option>
                                <option value="in_stock">🟢 In Stock</option>
                                <option value="low_stock">🟠 Low Stock</option>
                                <option value="out_of_stock">🔴 Out of Stock</option>
                            </select>
                        </div>

                        {/* Results Table */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">SKU / Barcode</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Product Name</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Quantity</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600">Status</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No matching inventory found.</td>
                                        </tr>
                                    ) : (
                                        filteredData.map(item => (
                                            <tr key={item.sku} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                <td className="p-4 font-mono text-sm text-slate-600">{item.sku}</td>
                                                <td className="p-4 font-medium text-slate-800">{item.name}</td>
                                                <td className="p-4 font-bold text-slate-700">{item.qty}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'in_stock' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : item.status === 'low_stock' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200'}`}>
                                                        {item.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => openPrintModal(item.sku)} className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-900 transition-all">
                                                        Print Barcode
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Print Queue Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-slate-800">Incoming Print Queue</h2>
                            <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded-full animate-pulse">2 Pending</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {['SKU-GLOSSY-01', 'SKU-PAPER-A3'].map((sku, idx) => (
                                <div key={idx} className="p-4 border border-slate-200 rounded-xl bg-slate-50 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                    <h3 className="font-bold text-sm text-slate-800 font-mono">{sku}</h3>
                                    <p className="text-xs text-slate-500 mt-1 mb-3">Req by: Coordinator</p>
                                    <button onClick={() => openPrintModal(sku)} className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition">
                                        Print & Clear
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Barcode Thermal Label Preview Modal (No QR Code) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
                        <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">Thermal Label Preview</span>
                        <h3 className="text-lg font-bold text-slate-800 mt-2">Barcode Label</h3>
                        <p className="text-xs text-slate-500 font-mono mb-4">{activePrintSku}</p>
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center mb-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Code-128 Barcode</p>
                            {/* Target canvas/svg for JsBarcode */}
                            <svg ref={barcodeRef}></svg>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="w-1/2 bg-slate-100 text-slate-600 font-semibold py-2.5 rounded-xl hover:bg-slate-200 text-sm">
                                Cancel
                            </button>
                            <button onClick={confirmPrint} className="w-1/2 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 text-sm shadow-md">
                                Print Label
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-5 right-5 z-50">
                    <div className="px-5 py-3.5 rounded-xl shadow-lg bg-red-600 text-white text-sm font-semibold">
                        {toast.message}
                    </div>
                </div>
            )}
        </div>
    );
}