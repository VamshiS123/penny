const API_KEY = 'pricesapi_fJmNeIJLtihZv48pEuX78M1CZRcluaM';
const BASE_URL = 'https://api.pricesapi.io/api/v1';

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
});

async function handleFetchDeals(query, currentPrice) {
  // Clean the query: remove special chars and extra details that might confuse search
  const cleanQuery = query
    .replace(/[(),]/g, '') // Remove parentheses and commas
    .replace(/US Version|eSIM|Unlocked|Renewed/gi, '') // Remove common filler words
    .split(' ').slice(0, 6).join(' ') // Take first few words
    .trim();

  console.log(`Penny Background: Cleaned query from "${query}" to "${cleanQuery}"`);

  // 1. Search for products
  const url = `${BASE_URL}/products/search?q=${encodeURIComponent(cleanQuery)}&limit=5`;
  console.log("Penny Background: Fetching", url);
  
  const searchResponse = await fetch(url, {
    method: 'GET',
    headers: { 
      'x-api-key': API_KEY,
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
  const offersResponse = await fetch(`${BASE_URL}/products/${productId}/offers`, {
    headers: { 'x-api-key': API_KEY }
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