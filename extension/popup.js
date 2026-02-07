const API_URL = "http://127.0.0.1:8000/api/v1";

document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('login-view');
  const statusView = document.getElementById('status-view');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Check if logged in
  const { token } = await chrome.storage.local.get('token');
  if (token) {
    showStatusView(token);
  } else {
    showLoginView();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      console.log("Penny: Attempting login to", `${API_URL}/auth/jwt/login`);
      const res = await fetch(`${API_URL}/auth/jwt/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
      });

      console.log("Penny: Login response status:", res.status);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("Penny: Login failed data:", errorData);
        throw new Error("Login failed");
      }
      
      const result = await res.json();
      console.log("Penny: Login successful, token received");
      
      await chrome.storage.local.set({ token: result.access_token });
      await showStatusView(result.access_token);
    } catch (error) {
      console.error("Penny: Login handler error:", error);
      alert(`Login failed: ${error.message}`);
    }
  });

  logoutBtn.addEventListener('click', async () => {
    await chrome.storage.local.remove(['token', 'user']);
    showLoginView();
  });

  async function showLoginView() {
    loginView.classList.remove('hidden');
    statusView.classList.add('hidden');
  }

  async function showStatusView(token) {
    console.log("Penny: Transitioning to status view");
    loginView.classList.add('hidden');
    statusView.classList.remove('hidden');
    
    document.getElementById('user-name').textContent = "Loading...";

    try {
      console.log("Penny: Fetching user data...");
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`User fetch failed (${res.status})`);
      const user = await res.json();
      console.log("Penny: User data received", user);
      
      console.log("Penny: Fetching accounts...");
      const accRes = await fetch(`${API_URL}/accounts/`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!accRes.ok) throw new Error(`Accounts fetch failed (${accRes.status})`);
      const accounts = await accRes.json();
      console.log("Penny: Accounts received", accounts);

      const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

      document.getElementById('user-name').textContent = `Hello, ${user.full_name || 'User'}!`;
      document.getElementById('hourly-rate').textContent = `$${(user.hourly_rate || (user.annual_salary / 2080) || 0).toFixed(2)}`;
      document.getElementById('balance').textContent = `$${totalBalance.toLocaleString()}`;
      
      const userDataObj = {
        fullName: user.full_name,
        hourlyRate: user.hourly_rate || (user.annual_salary / 2080) || 0,
        balance: totalBalance
      };
      console.log("Penny: Storing user data for content script", userDataObj);
      await chrome.storage.local.set({ user: userDataObj });
    } catch (error) {
      console.error("Penny: showStatusView error:", error);
      if (error.message.includes("401")) {
        await chrome.storage.local.remove('token');
        showLoginView();
      } else {
        document.getElementById('user-name').textContent = "Error loading data";
      }
    }
  }
});
