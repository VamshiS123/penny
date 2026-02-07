const API_URL = "http://127.0.0.1:8000/api/v1";
const DEALS_API_KEY = 'pricesapi_fJmNeIJLtihZv48pEuX78M1CZRcluaM';
const DEALS_BASE_URL = 'https://api.pricesapi.io/api/v1';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Penny Companion Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_DEALS') {
    handleFetchDeals(request.query, request.currentPrice)
      .then(deals => sendResponse({ success: true, deals }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
  
  if (request.type === 'CAPTURE_SCREENSHOT') {
    handleCaptureScreenshot(sender.tab.id)
      .then(dataUrl => sendResponse({ success: true, dataUrl }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.type === 'ANALYZE_CART') {
    handleAnalyzeCart(request.imageData)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.type === 'CONFIRM_CART') {
    handleConfirmCart(request.items, request.date)
      .then(transactions => sendResponse({ success: true, transactions }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleCaptureScreenshot(tabId) {
  console.log("Penny Background: Capturing screenshot for tab", tabId);
  
  const dataUrl = await chrome.tabs.captureVisibleTab(null, {
    format: 'png',
    quality: 90
  });
  
  console.log("Penny Background: Screenshot captured, length:", dataUrl.length);
  return dataUrl;
}

async function handleAnalyzeCart(imageDataUrl) {
  console.log("Penny Background: Analyzing cart screenshot");
  
  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    throw new Error("Not logged in");
  }
  
  // Convert data URL to blob
  const response = await fetch(imageDataUrl);
  const blob = await response.blob();
  
  // Create form data
  const formData = new FormData();
  formData.append('file', blob, 'cart_screenshot.png');
  
  // Send to backend
  const result = await fetch(`${API_URL}/transactions/analyze-cart`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  if (!result.ok) {
    const error = await result.text();
    throw new Error(`Analysis failed: ${error}`);
  }
  
  const data = await result.json();
  console.log("Penny Background: Cart analysis complete", data);
  return data;
}

async function handleConfirmCart(items, date) {
  console.log("Penny Background: Confirming cart purchase", items);
  
  const { token } = await chrome.storage.local.get('token');
  if (!token) {
    throw new Error("Not logged in");
  }
  
  const result = await fetch(`${API_URL}/transactions/confirm-cart`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ items, date })
  });
  
  if (!result.ok) {
    const error = await result.text();
    throw new Error(`Confirmation failed: ${error}`);
  }
  
  const transactions = await result.json();
  console.log("Penny Background: Purchase tracked", transactions);
  return transactions;
}

async function handleFetchDeals(query, currentPrice) {
  // Clean the query: remove special chars and extra details that might confuse search
  const cleanQuery = query
    .replace(/[(),]/g, '') // Remove parentheses and commas
    .replace(/US Version|eSIM|Unlocked|Renewed/gi, '') // Remove common filler words
    .split(' ').slice(0, 6).join(' ') // Take first few words
    .trim();

  console.log(`Penny Background: Cleaned query from "${query}" to "${cleanQuery}"`);

  // 1. Search for products
  const url = `${DEALS_BASE_URL}/products/search?q=${encodeURIComponent(cleanQuery)}&limit=5`;
  console.log("Penny Background: Fetching", url);
  
  const searchResponse = await fetch(url, {
    method: 'GET',
    headers: { 
      'x-api-key': DEALS_API_KEY,
      'Accept': 'application/json'
    }
  }).catch(err => {
    console.error("Penny Background: Fetch caught error", err);
    throw new Error(`Network error on search: ${err.message}`);
  });
  
  if (!searchResponse.ok) throw new Error(`Search failed: ${searchResponse.status}`);
  const searchData = await searchResponse.json();
  
  if (!searchData.data || searchData.data.results.length === 0) return [];

  // 2. Get offers for the top product result
  const productId = searchData.data.results[0].id;
  const offersResponse = await fetch(`${DEALS_BASE_URL}/products/${productId}/offers`, {
    headers: { 'x-api-key': DEALS_API_KEY }
  });
  
  if (!offersResponse.ok) throw new Error(`Offers failed: ${offersResponse.status}`);
  const offersData = await offersResponse.json();
  
  if (!offersData.data || !offersData.data.offers) return [];

  // 3. Filter for better deals
  return offersData.data.offers
    .filter(offer => offer.price > 0 && offer.price < currentPrice)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);
}