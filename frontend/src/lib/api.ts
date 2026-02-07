const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

function getAuthHeader() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

export async function login(data: any) {
  const formData = new URLSearchParams();
  formData.append("username", data.email);
  formData.append("password", data.password);

  const res = await fetch(`${API_URL}/auth/jwt/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });
  if (!res.ok) throw new Error("Login failed");
  const result = await res.json();
  localStorage.setItem("token", result.access_token);
  return result;
}

export async function register(data: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let errorMessage = "Registration failed";
    try {
      const errorData = await res.json();
      console.log("Registration error response:", errorData);
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        // FastAPI validation errors can be a list or a string
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => {
            const field = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : (err.loc?.[1] || 'field');
            return `${field}: ${err.msg || 'Invalid value'}`;
          }).join(', ');
        } else {
          errorMessage = String(errorData.detail);
        }
      } else if (errorData.message) {
        errorMessage = String(errorData.message);
      } else {
        errorMessage = `Registration failed: ${JSON.stringify(errorData)}`;
      }
    } catch (e) {
      console.error("Error parsing error response:", e);
      errorMessage = `Registration failed: ${res.status} ${res.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return res.json();
}

export function logout() {
  localStorage.removeItem("token");
}

export async function fetchUser() {
  const res = await fetch(`${API_URL}/users/me`, {
    headers: { ...getAuthHeader() },
  });
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
}

export async function uploadCSV(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/uploads/csv`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload CSV");
  return res.json();
}

export async function updateUser(data: any) {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader() 
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function fetchExpenses() {
  const res = await fetch(`${API_URL}/expenses/`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch expenses");
  return res.json();
}

export async function createExpense(data: any) {
  const res = await fetch(`${API_URL}/expenses/`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create expense");
  return res.json();
}

export async function updateExpense(id: string, data: any) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "PUT",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update expense");
  return res.json();
}

export async function deleteExpense(id: string) {
  const res = await fetch(`${API_URL}/expenses/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to delete expense");
  return res.json();
}

export async function fetchGoals() {
  const res = await fetch(`${API_URL}/goals/`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch goals");
  return res.json();
}

export async function createGoal(data: any) {
  const res = await fetch(`${API_URL}/goals/`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create goal");
  return res.json();
}

export async function updateGoal(id: string, data: any) {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: "PUT",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update goal");
  return res.json();
}

export async function deleteGoal(id: string) {
  const res = await fetch(`${API_URL}/goals/${id}`, {
    method: "DELETE",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to delete goal");
  return res.json();
}

export async function fetchTransactions() {
  const res = await fetch(`${API_URL}/transactions/`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function fetchAccounts() {
  const res = await fetch(`${API_URL}/accounts/`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch accounts");
  return res.json();
}

export async function createTransaction(data: any) {
  const res = await fetch(`${API_URL}/transactions/`, {
    method: "POST",
    headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader()
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create transaction");
  return res.json();
}

export async function fetchAchievements() {
  const res = await fetch(`${API_URL}/gamification/achievements`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch achievements");
  return res.json();
}

export async function seedAchievements() {
    const res = await fetch(`${API_URL}/gamification/achievements/seed`, {
        method: "POST",
        headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to seed achievements");
    return res.json();
}

export async function unlockAchievement(id: string) {
  const res = await fetch(`${API_URL}/gamification/achievements/${id}/unlock`, {
    method: "POST",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to unlock achievement");
  return res.json();
}

export async function fetchShopItems() {
  const res = await fetch(`${API_URL}/gamification/shop`, {
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to fetch shop items");
  return res.json();
}

export async function seedShopItems() {
    const res = await fetch(`${API_URL}/gamification/shop/seed`, {
        method: "POST",
        headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error("Failed to seed shop items");
    return res.json();
}

export async function purchaseItem(id: string) {
  const res = await fetch(`${API_URL}/gamification/shop/${id}/purchase`, {
    method: "POST",
    headers: { ...getAuthHeader() },
  });
  if (!res.ok) throw new Error("Failed to purchase item");
  return res.json();
}

export async function equipItem(id: string) {

  const res = await fetch(`${API_URL}/gamification/shop/${id}/equip`, {

    method: "POST",

    headers: { ...getAuthHeader() },

  });

  if (!res.ok) throw new Error("Failed to equip item");

  return res.json();

}



export async function analyzeReceipt(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/transactions/analyze`, {
    method: "POST",
    headers: { ...getAuthHeader() },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to analyze receipt");
  return res.json();
}

export async function chatWithPenny(message: string, history: { role: string, content: string }[] = []) {

  const res = await fetch(`${API_URL}/chat/`, {

    method: "POST",

    headers: { 

        "Content-Type": "application/json",

        ...getAuthHeader()

    },

    body: JSON.stringify({ message, history }),

  });

  if (!res.ok) throw new Error("Failed to chat with Penny");

  return res.json();

}
