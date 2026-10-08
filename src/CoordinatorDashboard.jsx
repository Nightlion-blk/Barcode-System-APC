import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchInventory } from './services/api'; // <-- 1. Importing your new API service
import { useInventory } from '../context/InventoryContext';

export default function CoordinatorDashboard() {
    const navigate = useNavigate();
    const isAdmin = localStorage.getItem('activeRole') === 'admin';

    // State Management
    const [inventory, setInventory] = useState([]); // <-- 2. Starts completely empty now!
    const [isLoading, setIsLoading] = useState(true); // <-- 3. Loading state added
    
    const [archived, setArchived] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [printQueue, setPrintQueue] = useState([]);
    const [filterStatus, setFilterStatus] = useState('all');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ sku: '', name: '', qty: 0 });
    const [toast, setToast] = useState(null);

    // <-- 4. The useEffect hook automatically fetches data when the component loads
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchInventory();
                setInventory(data);
            } catch (error) {
                showToast("Failed to connect to database.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const logAuditAction = (user, actionType, details) => {
        let logs = JSON.parse(localStorage.getItem('stockflow_audit_logs')) || [];
        const now = new Date();
        const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + now.toLocaleTimeString();
        logs.unshift({ timestamp, user, actionType, details });
        localStorage.setItem('stockflow_audit_logs', JSON.stringify(logs));
    };

    const handleLogout = () => {
        localStorage.removeItem('activeRole');
        navigate('/login');
    };

    const getStatus = (qty) => {
        if (qty >= 50) return { label: 'IN STOCK', type: 'instock', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
        if (qty > 0) return { label: 'LOW STOCK', type: 'lowstock', color: 'text-amber-700 bg-amber-50 border-amber-200' };
        return { label: 'OUT OF STOCK', type: 'outofstock', color: 'text-rose-700 bg-rose-50 border-rose-200' };
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.sku.toLowerCase().includes(searchQuery.toLowerCase()) || item.name.toLowerCase().includes(searchQuery.toLowerCase());
        const itemStatus = getStatus(item.qty).type;
        const matchesFilter = filterStatus === 'all' || itemStatus === filterStatus;
        return matchesSearch && matchesFilter;
    });

    // --- Pagination Logic ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5; // Change this to 10 or 20 for production!

    // Reset to page 1 if the user types in the search bar or changes the filter
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    // Calculate which items to show on the current page
    const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

    const openModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData(item);
        } else {
            setEditingItem(null);
            setFormData({ sku: '', name: '', qty: 0 });
        }
        setIsAddModalOpen(true);
    };

    const generateRandomSku = () => {
        // Generates a random 5-digit number (e.g., 84729)
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const generatedSku = `SKU-${randomNum}`;
        
        // Safety check: Make sure this random SKU isn't magically already in use
        if (inventory.some(item => item.sku === generatedSku)) {
            return generateRandomSku(); // If it exists, try again
        }

        setFormData({ ...formData, sku: generatedSku });
        showToast("Auto-generated unique SKU!", "info");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const qtyNum = parseInt(formData.qty, 10);
        
        // --- NEW: DUPLICATE SKU VALIDATION ---
        // If we are creating a new item, check if the SKU is already in the active inventory
        if (!editingItem) {
            const isDuplicate = inventory.some(
                item => item.sku.toLowerCase() === formData.sku.trim().toLowerCase()
            );
            
            if (isDuplicate) {
                showToast(`Action Denied: SKU "${formData.sku}" already exists!`, "error");
                return; // This stops the function immediately so the duplicate is never added
            }
        }
        
        if (editingItem) {
            setInventory(inventory.map(i => i.sku === formData.sku ? { ...formData, qty: qtyNum } : i));
            logAuditAction('coord_1 (Coordinator)', 'ADJUST_STOCK', `Updated quantity for ${formData.sku} to ${qtyNum}`);
            showToast(`Inventory updated for ${formData.sku}!`, "success");
        } else {
            // Force SKU to be uppercase and trimmed before saving
            const cleanSku = formData.sku.trim().toUpperCase();
            setInventory([{ ...formData, sku: cleanSku, qty: qtyNum }, ...inventory]);
            logAuditAction('coord_1 (Coordinator)', 'ADD_STOCK', `Added new item SKU: ${cleanSku} (${formData.name})`);
            showToast(`${formData.name} added to inventory!`, "success");
        }
        setIsAddModalOpen(false);
    };

    const handleArchive = (item) => {
        setInventory(inventory.filter(i => i.sku !== item.sku));
        setArchived([item, ...archived]);
        logAuditAction('coord_1 (Coordinator)', 'ARCHIVE_ITEM', `Safely archived item SKU: ${item.sku}`);
        showToast(`${item.sku} securely moved to Archive Vault.`, "info");
    };

    const handleRestore = (item) => {
        setArchived(archived.filter(i => i.sku !== item.sku));
        setInventory([item, ...inventory]);
        logAuditAction('coord_1 (Coordinator)', 'RESTORE_ITEM', `Restored item SKU: ${item.sku} from archive vault`);
        showToast(`${item.sku} restored to active floor!`, "success");
    };

    // --- Bulk Print Queue Functions ---
    const addToPrintQueue = (item) => {
        if (!printQueue.some(q => q.sku === item.sku)) {
            setPrintQueue([...printQueue, item]);
            showToast(`${item.sku} added to print staging area.`, 'info');
        } else {
            showToast(`${item.sku} is already in the queue.`, 'error');
        }
    };

    const removeFromPrintQueue = (sku) => {
        setPrintQueue(printQueue.filter(q => q.sku !== sku));
    };

    const dispatchBulkPrint = () => {
        if (printQueue.length === 0) return;
        const skus = printQueue.map(q => q.sku).join(', ');
        logAuditAction('coord_1 (Coordinator)', 'DISPATCH_BULK_PRINT', `Dispatched batch print for: ${skus}`);
        showToast(`Successfully dispatched ${printQueue.length} items to the Factory Floor!`, 'success');
        setPrintQueue([]); 
    };

    const addAllToPrintQueue = () => {
        const newItems = filteredInventory.filter((item) => !printQueue.some((q) => q.sku === item.sku));
        if (newItems.length === 0) {
            showToast('All visible items are already in the queue.', 'info');
            return;
        }
        setPrintQueue([...printQueue, ...newItems]);
        showToast(`Added ${newItems.length} items to the print queue.`, 'success');
    };

    const clearPrintQueue = () => {
        if (printQueue.length === 0) return;
        setPrintQueue([]);
        showToast('Print queue cleared.', 'info');
    };

    return (
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 min-h-screen p-8 font-sans relative">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 gap-4">
                    <div>
                        <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Inventory Control</span>
                        <h1 className="text-2xl font-bold text-slate-800 mt-2">Coordinator Dashboard</h1>
                        <p className="text-slate-500 text-sm">Manage stock quantities and dispatch print tasks to the factory floor</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isAdmin && (
                            <button onClick={() => navigate('/admin')} className="flex items-center bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 font-semibold text-sm shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 mr-1.5 text-red-600">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                                </svg>
                                Back to Admin
                            </button>
                        )}
                        <button onClick={handleLogout} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 font-semibold text-sm transition-all">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                    <button onClick={() => openModal()} className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 font-semibold shadow-md shadow-red-200 transition-all flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                        Add New Item
                    </button>
                    <button onClick={() => { logAuditAction('coord_1', 'GENERATE_REPORT', 'Exported inventory pdf'); showToast("Generating inventory PDF report...", "success"); }} className="bg-slate-800 text-white px-5 py-2.5 rounded-xl hover:bg-slate-900 font-semibold shadow-md shadow-slate-200 transition-all flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                        Generate Report
                    </button>
                    <button onClick={() => setIsArchiveModalOpen(true)} className="ml-auto bg-white text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-50 font-semibold border border-slate-200 shadow-sm transition-all flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.25v10.5A2.25 2.25 0 0118 21H6a2.25 2.25 0 01-2.25-2.25V8.25M4.5 5.25h15m-15 0a2.25 2.25 0 012.25-2.25h10.5a2.25 2.25 0 012.25 2.25m-15 0v3m15-3v3m-12 3h9" /></svg>
                        View Archived Records
                    </button>
                </div>

                {/* Print Dispatch Queue UI */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-slate-800">Print Dispatch Queue</h2>
                                {printQueue.length > 0 && (
                                    <button onClick={clearPrintQueue} className="text-[10px] uppercase tracking-wider font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-md transition-colors">
                                        Clear All
                                    </button>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">Stage multiple items here to send them to the barcode encoder all at once.</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <button onClick={addAllToPrintQueue} className="flex-1 md:flex-none px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded-xl font-semibold text-sm transition-all shadow-sm">
                                + Add All Visible
                            </button>
                            
                            <button 
                                onClick={dispatchBulkPrint}
                                disabled={printQueue.length === 0}
                                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center text-sm ${printQueue.length > 0 ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 mr-2"><path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0v3.396c0 .69.558 1.25 1.25 1.25h8c.692 0 1.25-.56 1.25-1.25v-3.396z" /></svg>
                                Dispatch ({printQueue.length})
                            </button>
                        </div>
                    </div>

                    {printQueue.length === 0 ? (
                        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-sm font-medium">
                            No items staged for printing. Click "Queue Print" on inventory items below to add them here.
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {printQueue.map(q => (
                                <div key={q.sku} className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg gap-4 shadow-sm animate-fade-in">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-700">{q.sku}</span>
                                        <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{q.name}</span>
                                    </div>
                                    <button onClick={() => removeFromPrintQueue(q.sku)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Inventory Table with Loading State */}
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                        <h2 className="text-lg font-bold text-slate-800">Active Inventory List</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-white border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-red-500 p-2 outline-none shadow-sm w-full sm:w-64" placeholder="Search SKU or Name..." />
                            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-slate-200 text-slate-700 text-sm rounded-xl p-2 outline-none cursor-pointer shadow-sm">
                                <option value="all">Show All Status</option>
                                <option value="instock">🟢 In Stock</option>
                                <option value="lowstock">🟠 Low Stock</option>
                                <option value="outofstock">🔴 Out of Stock</option>
                            </select>
                        </div>
                    </div>

                    {/* 5. We show a spinner while fetching, and the table when done */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-slate-200 rounded-xl">
                            <svg className="animate-spin h-8 w-8 text-red-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="text-slate-500 text-sm font-semibold animate-pulse">Syncing with database...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto border border-slate-200 rounded-xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-600">SKU</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-600">Product Name</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-600">Quantity</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-600">Status</th>
                                        <th className="p-4 font-bold text-xs uppercase tracking-wider text-slate-600 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No items found matching your criteria.</td>
                                        </tr>
                                    ) : (
                                        currentItems.map(item => {
                                            const status = getStatus(item.qty);
                                            return (
                                                <tr key={item.sku} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                                    <td className="p-4 font-mono text-sm text-slate-600">{item.sku}</td>
                                                    <td className="p-4 font-medium text-slate-800">{item.name}</td>
                                                    <td className={`p-4 font-bold ${item.qty === 0 ? 'text-rose-600' : 'text-slate-700'}`}>{item.qty}</td>
                                                    <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.color}`}>{status.label}</span></td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button onClick={() => openModal(item)} className="text-red-600 hover:text-red-800 font-semibold text-sm">Edit</button>
                                                            <span className="text-slate-200">|</span>
                                                            <button onClick={() => handleArchive(item)} className="text-slate-500 hover:text-slate-700 font-semibold text-sm">Archive</button>
                                                            <span className="text-slate-200">|</span>
                                                            <button onClick={() => addToPrintQueue(item)} className="text-slate-600 hover:text-indigo-600 font-semibold text-sm transition-colors">Queue Print</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                                    <span className="text-xs text-slate-500 font-semibold">
                                        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredInventory.length)} of {filteredInventory.length} Entries
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={handlePrevPage} 
                                            disabled={currentPage === 1}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currentPage === 1 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'}`}
                                        >
                                            Previous
                                        </button>
                                        <span className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <button 
                                            onClick={handleNextPage} 
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm'}`}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}  
                        </div>
                    )}
                </div>
            </div>

            {/* Modals & Toasts */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
                        <h2 className="text-xl font-bold text-slate-800 mb-4">{editingItem ? "Update Item" : "Add New Item"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-xs font-bold uppercase text-slate-600">SKU</label>
                                    {!editingItem && (
                                        <button 
                                            type="button" 
                                            onClick={generateRandomSku} 
                                            className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
                                        >
                                            ⚡ Auto-Generate
                                        </button>
                                    )}
                                </div>
                                <input 
                                    type="text" 
                                    value={formData.sku} 
                                    onChange={e => setFormData({...formData, sku: e.target.value})} 
                                    required 
                                    readOnly={!!editingItem} 
                                    placeholder="Type manually or auto-generate..."
                                    className={`w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none text-sm transition-colors ${editingItem ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-slate-50 focus:ring-2 focus:ring-red-500'}`} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Name</label>
                                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Quantity</label>
                                <input type="number" min="0" value={formData.qty} onChange={e => setFormData({...formData, qty: e.target.value})} required className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm focus:ring-2 focus:ring-red-500" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 font-semibold text-sm">Cancel</button>
                                <button type="submit" className="bg-red-600 text-white px-5 py-2 rounded-xl font-semibold shadow-md text-sm">Save Item</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isArchiveModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                            <h2 className="text-xl font-bold text-slate-800">Archived Records Vault</h2>
                            <button onClick={() => setIsArchiveModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-xl border border-slate-200">✕</button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 border-b border-slate-200">
                                        <th className="p-4 font-bold text-xs uppercase text-slate-500">SKU</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-500">Name</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-500">Last Qty</th>
                                        <th className="p-4 font-bold text-xs uppercase text-slate-500 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {archived.length === 0 ? (
                                        <tr><td colSpan="4" className="p-12 text-center text-slate-400 font-medium text-sm border-2 border-dashed border-slate-200 rounded-xl">Vault is empty.</td></tr>
                                    ) : (
                                        archived.map(item => (
                                            <tr key={item.sku} className="border-b border-slate-100 bg-slate-50">
                                                <td className="p-4 font-mono text-sm text-slate-500">{item.sku}</td>
                                                <td className="p-4 font-medium text-slate-600">{item.name}</td>
                                                <td className="p-4 font-bold text-slate-500">{item.qty}</td>
                                                <td className="p-4 text-center">
                                                    <button onClick={() => handleRestore(item)} className="text-emerald-600 font-semibold text-sm">Restore</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {toast && (
                <div className="fixed top-5 right-5 z-[70] flex flex-col gap-3">
                    <div className={`px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-3 text-sm font-semibold text-white ${toast.type === 'error' ? 'bg-rose-600' : toast.type === 'info' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
                        <span>{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}