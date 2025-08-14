// API configuration and utility functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

// API request wrapper with error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(errorData.error || `HTTP ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Authentication API calls
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getProfile: () => apiRequest('/auth/profile'),
  
  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
}

// Energy usage API calls
export const energyAPI = {
  getUsage: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/energy/usage${queryString ? `?${queryString}` : ''}`)
  },
  
  addUsage: (usageData) => apiRequest('/energy/usage', {
    method: 'POST',
    body: JSON.stringify(usageData),
  }),
  
  getMonthlyUsage: (year, month) => apiRequest(`/energy/monthly/${year}/${month}`),
  
  getCurrentMonth: () => apiRequest('/energy/current-month'),
}

// Points API calls
export const pointsAPI = {
  getBalance: () => apiRequest('/points/balance'),
  
  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/points/history${queryString ? `?${queryString}` : ''}`)
  },
  
  redeemPoints: (rewardData) => apiRequest('/points/redeem', {
    method: 'POST',
    body: JSON.stringify(rewardData),
  }),
  
  getRewards: () => apiRequest('/points/rewards'),
}

// Ranking API calls
export const rankingAPI = {
  getIndividualRanking: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/ranking/individual${queryString ? `?${queryString}` : ''}`)
  },
  
  getDepartmentRanking: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/ranking/department${queryString ? `?${queryString}` : ''}`)
  },
  
  getMyPosition: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/ranking/my-position${queryString ? `?${queryString}` : ''}`)
  },
  
  getAchievements: () => apiRequest('/ranking/achievements'),
}

// File upload API calls
export const uploadAPI = {
  uploadDocument: (file) => {
    const formData = new FormData()
    formData.append('document', file)
    
    return apiRequest('/upload/document', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    })
  },
  
  getUploadHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/upload/history${queryString ? `?${queryString}` : ''}`)
  },
  
  getUploadStatus: (fileId) => apiRequest(`/upload/status/${fileId}`),
}

// AI Analysis API calls
export const aiAPI = {
  analyze: () => apiRequest('/ai/analyze', { method: 'POST' }),
  
  getLatest: () => apiRequest('/ai/latest'),
  
  getHistory: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiRequest(`/ai/history${queryString ? `?${queryString}` : ''}`)
  },
  
  getComment: (actionData) => apiRequest('/ai/comment', {
    method: 'POST',
    body: JSON.stringify(actionData),
  }),
}

// Utility functions
export const setAuthToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authToken', token)
  }
}

export const removeAuthToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authToken')
  }
}

export const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken')
  }
  return null
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}