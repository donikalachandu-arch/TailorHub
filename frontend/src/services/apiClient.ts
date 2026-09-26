/**
 * TailorHub Production API Client
 * Robust, typed HTTP client with error handling, authentication, environment mode routing, and live service endpoints.
 */

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') + '/api';

export class ApiError extends Error {
  statusCode: number;
  data: any;

  constructor(message: string, statusCode: number = 500, data: any = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    token?: string | null;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = 'GET', body, token, timeoutMs = 15000 } = options;
  const currentMode = (localStorage.getItem('tailorhub_mode') || 'LIVE').toUpperCase();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-TailorHub-Mode': currentMode === 'DEMO' ? 'demo' : 'live'
  };

  const storedToken = token || localStorage.getItem('tailorhub_token');
  if (storedToken) {
    headers['Authorization'] = `Bearer ${storedToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let data: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (data && typeof data === 'object' && data.error) ||
        (data && typeof data === 'object' && data.message) ||
        `HTTP Request failed with status ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, data);
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out after ' + timeoutMs + 'ms. Please check your network connection.', 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Unable to connect to TailorHub services. Please try again.', 500);
  }
}

// -------------------------------------------------------------
// Dedicated Typed API Modules
// -------------------------------------------------------------

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: credentials }),

  register: (data: any) =>
    apiRequest('/auth/register', { method: 'POST', body: data }),

  getProfile: () =>
    apiRequest('/auth/profile')
};

export const ordersApi = {
  getOrders: () => apiRequest('/orders'),
  getOrderDetails: (id: string) => apiRequest(`/orders/${id}`),
  createOrder: (orderData: any) => apiRequest('/orders', { method: 'POST', body: orderData }),
  updateOrderStatus: (id: string, status: string, notes?: string) =>
    apiRequest(`/orders/${id}/status`, { method: 'PATCH', body: { status, notes } })
};

export const appointmentsApi = {
  getAppointments: () => apiRequest('/appointments'),
  bookAppointment: (data: any) => apiRequest('/appointments', { method: 'POST', body: data }),
  updateStatus: (id: string, status: string) =>
    apiRequest(`/appointments/${id}/status`, { method: 'PATCH', body: { status } })
};

export const tailorApi = {
  getCustomers: (search?: string) =>
    apiRequest(search ? `/tailor/customers?search=${encodeURIComponent(search)}` : '/tailor/customers'),
  getCustomerDetails: (id: string) =>
    apiRequest(`/tailor/customers/${id}`),
  updateCustomer: (id: string, data: any) =>
    apiRequest(`/tailor/customers/${id}`, { method: 'PATCH', body: data }),
  addManualCustomer: (data: any) =>
    apiRequest('/tailor/customers/manual', { method: 'POST', body: data })
};

export const lensApi = {
  scanDocument: (imageUrl: string, enhancedUrl?: string) =>
    apiRequest('/lens/scan', { method: 'POST', body: { image_url: imageUrl, enhanced_image_url: enhancedUrl } }),
  checkDuplicate: (phone: string, name?: string) =>
    apiRequest('/lens/check-duplicate', { method: 'POST', body: { phone, name } }),
  verifyAndSave: (data: any) =>
    apiRequest('/lens/verify-save', { method: 'POST', body: data }),
  getRecords: () => apiRequest('/lens/records'),
  getRecordById: (id: string) => apiRequest(`/lens/records/${id}`)
};

export const aiApi = {
  getStyleRecommendation: (input: {
    garment: string;
    occasion: string;
    color_preference?: string;
    sleeve_preference?: string;
    neck_preference?: string;
    fit_preference?: string;
    notes?: string;
    order_id?: string;
  }) => apiRequest('/ai/style-recommendation', { method: 'POST', body: input })
};

export const paymentsApi = {
  createPaymentOrder: (orderId: string, amount: number) =>
    apiRequest('/payments/create-order', { method: 'POST', body: { order_id: orderId, amount } }),

  verifyPaymentSignature: (paymentData: {
    order_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    amount: number;
  }) => apiRequest('/payments/verify-signature', { method: 'POST', body: paymentData }),

  recordPayment: (orderId: string, amount: number, paymentMethod: string = 'CASH') =>
    apiRequest('/payments/create', { method: 'POST', body: { order_id: orderId, amount, payment_method: paymentMethod } })
};

export const staffApi = {
  getShopStaff: (tailorId: string) => apiRequest(`/tailors/${tailorId}/staff`),
  addShopStaff: (tailorId: string, staffData: { name: string; phone: string; email?: string; role: string }) =>
    apiRequest(`/tailors/${tailorId}/staff`, { method: 'POST', body: staffData }),
  removeShopStaff: (tailorId: string, staffId: string) =>
    apiRequest(`/tailors/${tailorId}/staff/${staffId}`, { method: 'DELETE' })
};

export const adminApi = {
  getUsers: () => apiRequest('/admin/users'),
  getTailors: () => apiRequest('/admin/tailors'),
  verifyTailor: (id: string) => apiRequest(`/admin/tailors/${id}/verify`, { method: 'PATCH' }),
  getOrders: () => apiRequest('/admin/orders'),
  getAuditLogs: () => apiRequest('/admin/audit-logs'),
  resetDemoData: () => apiRequest('/admin/reset-demo', { method: 'POST' })
};

export const demoApi = {
  resetDemoData: () => apiRequest('/demo/reset', { method: 'POST' })
};

export const analyticsApi = {
  getDashboardMetrics: () => apiRequest('/analytics/dashboard')
};
