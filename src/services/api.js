// This file acts as the bridge between your React UI and your classmate's backend.

export const fetchInventory = async () => {
    // 1. We wrap the fake data in a Promise to simulate an async database request.
    // 2. We add an 800ms delay to simulate network latency so you can test your loading spinners.
    
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { sku: 'SKU-PAPER-A4', name: 'Premium A4 Bond Paper 70gsm', qty: 150 },
                { sku: 'SKU-GLOSSY-01', name: 'High-Gloss Photo Paper 200gsm', qty: 5 },
                { sku: 'SKU-CARD-WHT', name: 'White Cardstock 250gsm', qty: 0 }
            ]);
        }, 800);
    });
};

/* 
  FUTURE INSTRUCTIONS FOR INTEGRATION:
  When the backend is ready, delete the code above and uncomment the real code below!
  
  export const fetchInventory = async () => {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/inventory`);
      const data = await response.json();
      return data;
  };
*/