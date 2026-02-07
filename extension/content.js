let isWarningShown = false;
let userData = null;
let checkoutButton = null;
let currentCartData = null;

// Expanded checkout keywords for universal detection
const CHECKOUT_KEYWORDS = [
  'proceed to checkout',
  'proceed to retail checkout',
  'checkout',
  'check out',
  'place order',
  'place your order',
  'complete purchase',
  'complete order',
  'confirm order',
  'buy now',
  'pay now',
  'submit order',
  'continue to payment'
];

// Checkout page URL patterns
const CHECKOUT_URL_PATTERNS = [
  /checkout/i,
  /cart/i,
  /basket/i,
  /payment/i,
  /order/i
];

async function init() {
  console.log("Penny: Initializing on", window.location.href);
  const { user, token } = await chrome.storage.local.get(['user', 'token']);
  if (!token) {
    console.log("Penny: No token found, please login via extension popup.");
    return;
  }
  userData = user;

  // Check if this looks like a shopping/checkout page
  const isShoppingPage = isLikelyShoppingPage();
  if (isShoppingPage) {
    console.log("Penny: Potential shopping page detected");
    findCheckoutButton();
    observeMutations();
  }
}

function isLikelyShoppingPage() {
  const url = window.location.href.toLowerCase();
  const hostname = window.location.hostname.toLowerCase();

  // Check URL patterns
  if (CHECKOUT_URL_PATTERNS.some(pattern => pattern.test(url))) {
    return true;
  }

  // Common e-commerce domains
  const ecommerceDomains = [
    'amazon', 'walmart', 'target', 'bestbuy', 'ebay', 'etsy',
    'shopify', 'shop', 'store', 'cart', 'checkout'
  ];

  if (ecommerceDomains.some(domain => hostname.includes(domain))) {
    return true;
  }

  // Check for cart/checkout elements on page
  const cartIndicators = document.querySelectorAll(
    '[class*="cart"], [class*="checkout"], [id*="cart"], [id*="checkout"], [data-cart], [data-checkout]'
  );

  return cartIndicators.length > 0;
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
  // Amazon-specific selectors first
  let btn = document.querySelector('input[name="proceedToRetailCheckout"]') ||
    document.querySelector('#proceed-to-checkout-desktop') ||
    document.querySelector('form[action*="checkout"] input[type="submit"]') ||
    document.querySelector('.sc-buy-box-group input[type="submit"]');

  // Generic checkout button detection
  if (!btn) {
    const buttons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.a-button-text, a[role="button"], [role="button"]'));
    btn = buttons.find(b => {
      const text = (b.innerText || b.value || b.getAttribute('aria-label') || '').toLowerCase().trim();
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
  checkoutButton.addEventListener('click', (e) => {
    if (!isWarningShown) {
      console.log("Penny: Click intercepted, capturing screenshot and showing modal.");
      e.preventDefault();
      e.stopPropagation();
      showAnalyzingModal();
      return false;
    }
  }, true);
}

function showAnalyzingModal() {
  isWarningShown = true;
  console.log("Penny: Showing analyzing modal");

  const overlay = document.createElement('div');
  overlay.className = 'penny-overlay';
  overlay.id = 'penny-overlay';

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');

  overlay.innerHTML = `
    <div class="penny-modal">
      <img src="${mascotUrl}" class="penny-mascot-img penny-bob" alt="Penny">
      <h2 class="penny-title">Analyzing your cart...</h2>
      <p class="penny-content">
        Penny is checking what you're about to buy.
      </p>
      <div class="penny-loader">
        <div class="penny-loader-bar"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Capture screenshot and analyze
  captureAndAnalyze();
}

async function captureAndAnalyze() {
  try {
    // Request screenshot from background
    const screenshotResponse = await chrome.runtime.sendMessage({ type: 'CAPTURE_SCREENSHOT' });

    if (!screenshotResponse.success) {
      throw new Error(screenshotResponse.error || 'Screenshot failed');
    }

    console.log("Penny: Screenshot captured, analyzing...");

    // Send to backend for analysis
    const analysisResponse = await chrome.runtime.sendMessage({
      type: 'ANALYZE_CART',
      imageData: screenshotResponse.dataUrl
    });

    if (!analysisResponse.success) {
      throw new Error(analysisResponse.error || 'Analysis failed');
    }

    console.log("Penny: Analysis complete", analysisResponse.result);
    currentCartData = analysisResponse.result;

    // Show results
    showResultsModal(analysisResponse.result);

  } catch (error) {
    console.error("Penny: Analysis error", error);
    showErrorModal(error.message);
  }
}

function showResultsModal(data) {
  const overlay = document.getElementById('penny-overlay');
  if (!overlay) return;

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');
  const hourlyRate = userData ? userData.hourlyRate : 0;
  const timeCost = data.time_cost_hours || (hourlyRate > 0 ? (data.total_amount / hourlyRate).toFixed(1) : '?');

  const itemsHtml = data.raw_items.map(item => `
    <div class="penny-item-row">
      <span class="penny-item-name">${item.item_name}</span>
      <span class="penny-item-price">$${item.amount.toFixed(2)}</span>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="penny-modal penny-modal-wide">
      <img src="${mascotUrl}" class="penny-mascot-img" alt="Penny">
      <h2 class="penny-title">Wait a second!</h2>
      <p class="penny-content">
        Penny noticed you're about to spend <strong>${timeCost} hours</strong> of your life at <strong>${data.merchant}</strong>.
      </p>
      
      <div class="penny-stats">
        <div class="penny-stat-row">
          <span>Total:</span>
          <span class="penny-total">$${data.total_amount.toFixed(2)}</span>
        </div>
        <div class="penny-stat-row">
          <span>Your Balance:</span>
          <span>$${userData ? userData.balance.toLocaleString() : '0.00'}</span>
        </div>
      </div>

      <div class="penny-items-container">
        <div class="penny-items-header">Items in cart (${data.raw_items.length})</div>
        <div class="penny-items-list">
          ${itemsHtml}
        </div>
      </div>

      <div class="penny-buttons">
        <button id="penny-cancel" class="penny-btn penny-btn-cancel">I'll pass</button>
        <button id="penny-proceed" class="penny-btn penny-btn-proceed">Yes, I'm sure</button>
      </div>
    </div>
  `;

  document.getElementById('penny-cancel').onclick = () => {
    overlay.remove();
    isWarningShown = false;
    currentCartData = null;
  };

  document.getElementById('penny-proceed').onclick = () => {
    showConfirmTrackingModal();
  };
}

function showConfirmTrackingModal() {
  const overlay = document.getElementById('penny-overlay');
  if (!overlay || !currentCartData) return;

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');

  const categorySummary = currentCartData.splits.map(split => `
    <div class="penny-category-row">
      <span class="penny-category-name">${split.category}</span>
      <span class="penny-category-amount">$${split.amount.toFixed(2)}</span>
    </div>
  `).join('');

  overlay.innerHTML = `
    <div class="penny-modal penny-modal-wide">
      <img src="${mascotUrl}" class="penny-mascot-img" alt="Penny">
      <h2 class="penny-title">Track this purchase?</h2>
      <p class="penny-content">
        Would you like Penny to add these items to your budget tracker?
      </p>
      
      <div class="penny-stats">
        <div class="penny-stat-row penny-stat-header">
          <span>Category</span>
          <span>Amount</span>
        </div>
        ${categorySummary}
        <div class="penny-stat-row penny-stat-total">
          <span>Total</span>
          <span>$${currentCartData.total_amount.toFixed(2)}</span>
        </div>
      </div>

      <div class="penny-buttons">
        <button id="penny-skip-track" class="penny-btn penny-btn-cancel">Skip tracking</button>
        <button id="penny-confirm-track" class="penny-btn penny-btn-proceed">Track & Continue</button>
      </div>
    </div>
  `;

  document.getElementById('penny-skip-track').onclick = () => {
    proceedWithCheckout();
  };

  document.getElementById('penny-confirm-track').onclick = () => {
    confirmAndTrack();
  };
}

async function confirmAndTrack() {
  const overlay = document.getElementById('penny-overlay');
  if (!overlay || !currentCartData) return;

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');

  // Show loading state
  overlay.innerHTML = `
    <div class="penny-modal">
      <img src="${mascotUrl}" class="penny-mascot-img penny-bob" alt="Penny">
      <h2 class="penny-title">Tracking purchase...</h2>
      <div class="penny-loader">
        <div class="penny-loader-bar"></div>
      </div>
    </div>
  `;

  try {
    // Send to backend to confirm tracking
    const items = currentCartData.raw_items.map(item => ({
      merchant: item.merchant,
      category: item.category,
      amount: item.amount,
      item_name: item.item_name
    }));

    const response = await chrome.runtime.sendMessage({
      type: 'CONFIRM_CART',
      items: items,
      date: currentCartData.date
    });

    if (!response.success) {
      throw new Error(response.error || 'Tracking failed');
    }

    console.log("Penny: Purchase tracked successfully", response.transactions);
    showSuccessModal(response.transactions.length);

  } catch (error) {
    console.error("Penny: Tracking error", error);
    showErrorModal(error.message);
  }
}

function showSuccessModal(itemCount) {
  const overlay = document.getElementById('penny-overlay');
  if (!overlay) return;

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');

  overlay.innerHTML = `
    <div class="penny-modal">
      <img src="${mascotUrl}" class="penny-mascot-img" alt="Penny">
      <h2 class="penny-title penny-success">Purchase tracked! ✓</h2>
      <p class="penny-content">
        ${itemCount} item${itemCount !== 1 ? 's' : ''} added to your budget tracker at <strong>${currentCartData.merchant}</strong>.
      </p>
      <p class="penny-content penny-muted">
        Total: $${currentCartData.total_amount.toFixed(2)}
      </p>
      <div class="penny-buttons">
        <button id="penny-continue" class="penny-btn penny-btn-proceed penny-btn-full">Continue to checkout</button>
      </div>
    </div>
  `;

  document.getElementById('penny-continue').onclick = () => {
    proceedWithCheckout();
  };
}

function showErrorModal(message) {
  const overlay = document.getElementById('penny-overlay');
  if (!overlay) return;

  const mascotUrl = chrome.runtime.getURL('assets/penny.png');

  overlay.innerHTML = `
    <div class="penny-modal">
      <img src="${mascotUrl}" class="penny-mascot-img" alt="Penny">
      <h2 class="penny-title penny-error">Oops!</h2>
      <p class="penny-content">
        Something went wrong: ${message}
      </p>
      <p class="penny-content penny-muted">
        You can still continue with your checkout.
      </p>
      <div class="penny-buttons">
        <button id="penny-retry" class="penny-btn penny-btn-cancel">Try again</button>
        <button id="penny-continue-anyway" class="penny-btn penny-btn-proceed">Continue anyway</button>
      </div>
    </div>
  `;

  document.getElementById('penny-retry').onclick = () => {
    overlay.remove();
    isWarningShown = false;
    currentCartData = null;
    showAnalyzingModal();
  };

  document.getElementById('penny-continue-anyway').onclick = () => {
    proceedWithCheckout();
  };
}

function proceedWithCheckout() {
  const overlay = document.getElementById('penny-overlay');
  if (overlay) overlay.remove();

  currentCartData = null;
  // isWarningShown stays true so interceptor doesn't block again
  isWarningShown = true;

  // Re-trigger the original click
  if (checkoutButton) {
    checkoutButton.click();
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (changes.token || changes.user) init();
});

init();