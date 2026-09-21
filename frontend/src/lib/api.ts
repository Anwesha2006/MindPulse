import { Entry, CheckinResult, TrendData } from "./schemas";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class APIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options?.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorMessage = "An unexpected error occurred.";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch {
      // Failed to parse JSON error, fall back to default message
    }
    throw new APIError(errorMessage);
  }

  return response.json();
}

export const api = {
  health: () => fetchAPI<{ status: string }>("/api/health"),
  
  questions: () => fetchAPI<{ questions: string[] }>("/api/questions"),
  
  createUser: (name: string) => 
    fetchAPI<{ user_id: number }>("/api/users", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
    
  checkin: (user_id: number, text: string) =>
    fetchAPI<CheckinResult>("/api/checkin", {
      method: "POST",
      body: JSON.stringify({ user_id, text }),
    }),
    
  getEntries: (user_id: number, limit: number = 30) =>
    fetchAPI<Entry[]>(`/api/entries?user_id=${user_id}&limit=${limit}`),
    
  getTrends: (user_id: number, days: number = 7) =>
    fetchAPI<TrendData>(`/api/trends?user_id=${user_id}&days=${days}`),
};
