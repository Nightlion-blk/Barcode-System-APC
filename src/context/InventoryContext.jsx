import React, { createContext, useState, useContext, useMemo } from 'react';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
    const [inventory, setInventory] = useState([
        { sku: 'SKU-PAPER-A4', name: 'Premium A4 Bond Paper 70gsm', qty: 150, status: 'in_stock' },
        { sku: 'SKU-PAPER-A3', name: 'Standard A3 Copier Paper', qty: 85, status: 'in_stock' }
    ]);
    
    const [livePrintQueue, setLivePrintQueue] = useState([]);

    const dispatchToEncoder = (items) => {
        const itemsWithMeta = items.map(item => ({
            ...item,
            dispatchId: 'DISP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            timestamp: new Date().toLocaleTimeString()
        }));
        setLivePrintQueue(prev => [...prev, ...itemsWithMeta]);
    };

    const removeFromQueue = (dispatchId) => {
        setLivePrintQueue(prev => prev.filter(item => item.dispatchId !== dispatchId));
    };

    // useMemo caches the object so it doesn't get recreated on every keystroke or click
    const value = useMemo(() => ({
        inventory, 
        setInventory, 
        livePrintQueue, 
        setLivePrintQueue,
        dispatchToEncoder, 
        removeFromQueue
    }), [inventory, livePrintQueue]);

    return (
        <InventoryContext.Provider value={value}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventory = () => useContext(InventoryContext);