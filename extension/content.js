let isWarningShown = false;
let userData = null;
let checkoutButton = null;

const CHECKOUT_KEYWORDS = [
  'proceed to checkout',
  'proceed to retail checkout'
];

async function init() {
  console.log("Penny: Initializing on", window.location.href);
  const { user, token } = await chrome.storage.local.get(['user', 'token']);
  if (!token) {
    console.log("Penny: No token found, please login via extension popup.");
    return; 
  }
  userData = user;

  const isAmazon = window.location.hostname.includes('amazon');
  if (isAmazon) {
    console.log("Penny: Amazon detected");
    findCheckoutButton();
    observeMutations();
  }
}

function observeMutations() {
  const observer = new MutationObserver((mutations) => {
    if (!checkoutButton || !document.contains(checkoutButton)) {
      findCheckoutButton();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function findCheckoutButton() {
  let btn = document.querySelector('input[name="proceedToRetailCheckout"]') || 
            document.querySelector('#proceed-to-checkout-desktop') ||
            document.querySelector('form[action*="checkout"] input[type="submit"]') ||
            document.querySelector('.sc-buy-box-group input[type="submit"]');

  if (!btn) {
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.a-button-text'));
    btn = buttons.find(b => {
      const text = (b.innerText || b.value || '').toLowerCase().trim();
      return CHECKOUT_KEYWORDS.some(keyword => text.includes(keyword));
    });
  }

  if (btn && btn !== checkoutButton) {
    console.log("Penny: Checkout button found!", btn);
    checkoutButton = btn;
    setupInterceptor();
  }
}

function setupInterceptor() {
  // Intercept the click to show the warning modal instead
  checkoutButton.addEventListener('click', (e) => {
    if (!isWarningShown) {
      console.log("Penny: Click intercepted, showing warning.");
      e.preventDefault();
      e.stopPropagation();
      showPennyWarning();
      return false;
    }
  }, true);
}

function showPennyWarning() {
  isWarningShown = true;
  console.log("Penny: Showing warning modal");
  
  const price = findTotalPrice();
  const productName = findProductName();
  const hourlyRate = userData ? userData.hourlyRate : 0;
  const timeCost = hourlyRate > 0 ? (price / hourlyRate).toFixed(1) : '?';

  const overlay = document.createElement('div');
  overlay.className = 'penny-overlay';
  
  const mascotUrl = chrome.runtime.getURL('assets/penny-concerned.png');

  overlay.innerHTML = `
    <div class="penny-modal">
      <img src="${mascotUrl}" class="penny-mascot-img" alt="Penny">
      <h2 class="penny-title">Wait a second!</h2>
      <p class="penny-content">
        Penny noticed you're about to spend <strong>${timeCost} hours</strong> of your life on <strong>"${productName}"</strong>.
      </p>
      
      <div id="deals-container" class="penny-stats" style="text-align: left; font-size: 13px;">
        <div class="loading-deals">Searching for better deals...</div>
      </div>

      <div class="penny-stats">
        <div class="penny-stat-row">
          <span>Current Price:</span>
          <span>$${price.toFixed(2)}</span>
        </div>
        <div class="penny-stat-row">
          <span>Your Balance:</span>
          <span>$${userData ? userData.balance.toLocaleString() : '0.00'}</span>
        </div>
      </div>

      <div class="penny-buttons">
        <button id="penny-cancel" class="penny-btn penny-btn-cancel">I'll pass</button>
        <button id="penny-proceed" class="penny-btn penny-btn-proceed">Keep it</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  
  chrome.runtime.sendMessage({
    type: 'FETCH_DEALS',
    query: productName,
    currentPrice: price
  }, (response) => {
    const container = document.getElementById('deals-container');
    if (response && response.success && response.deals.length > 0) {
      container.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; color: #2e7d32; display: flex; align-items: center; gap: 4px;">
          <span>Better deals found!</span> ⚡
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px;">
          ${response.deals.map(deal => `
            <div class="penny-stat-row" style="background: white; padding: 6px; border: 1px solid #ddd; font-size: 11px;">
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${deal.seller || 'Another Store'}</span>
              <a href="${deal.url}" target="_blank" style="color: #455a64; text-decoration: underline; font-weight: 800;">$${deal.price.toFixed(2)}</a>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = `<div style="color: #666;">You've already found the best price!</div>`;
    }
  });

  document.getElementById('penny-cancel').onclick = () => {
    overlay.remove();
    isWarningShown = false;
    window.history.back();
  };

  document.getElementById('penny-proceed').onclick = () => {
    overlay.remove();
    // Allow the next click to proceed
    isWarningShown = true; // Stay true so interceptor doesn't block again
    checkoutButton.click(); // Re-trigger the original click
  };
}

function findProductName() {
  const selectors = [
    '#sc-active-cart .a-list-item a.a-link-normal span.a-size-medium',
    '.sc-product-title .a-truncate-cut', 
    'span#productTitle',
    'h1', 
    '.product-name', 
    '.product-title'
  ];
  
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && el.innerText.trim().length > 5) {
      return el.innerText.trim().split('\n')[0];
    }
  }
  
  try {
    const result = document.evaluate('/html/body/div[1]/div[1]/div[4]/div[6]/div/div[2]/div[1]/div/form/ul/div[3]/div[4]/div/div[3]/ul/li/span/a/span[1]/h4/span/span[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const node = result.singleNodeValue;
    if (node && node.innerText.trim().length > 5) return node.innerText.trim();
  } catch (e) {}

  let title = document.title;
  return title.replace(/checkout|cart|basket|shopping|buy/gi, '').split('|')[0].split('-')[0].trim() || "this item";
}

function findTotalPrice() {
  const totalSelectors = ['#sc-buy-box-ptp-id', '.grand-total-price', '.checkout-total-price', '#priceblock_ourprice', '.a-color-price', '.sc-price'];
  for (const selector of totalSelectors) {
    const el = document.querySelector(selector);
    if (el) {
      const m = el.innerText.match(/\$?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2}))/);
      if (m) return parseFloat(m[1].replace(/,/g, ''));
    }
  }
  const bodyText = document.body.innerText;
  const priceRegex = /\$\s?([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2}))/g;
  let match, prices = [];
  while ((match = priceRegex.exec(bodyText)) !== null) prices.push(parseFloat(match[1].replace(/,/g, '')));
  return prices.length > 0 ? Math.max(...prices) : 0;
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.token || changes.user) init();
});

init();