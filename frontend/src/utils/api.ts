// API Service for backend integration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Get token from localStorage (checks multiple possible locations)
const getAuthToken = (): string | null => {
  try {
    // First try the direct auth_token (set by login page)
    const directToken = localStorage.getItem('auth_token');
    if (directToken) {
      return directToken;
    }
    
    // Then try the Zustand persist store
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      if (parsed.state?.accessToken) {
        return parsed.state.accessToken;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

// ================================
// AUTH API
// ================================

export interface SignupData {
  username: string;
  email: string;
  password: string;
  phone_no: string;
  business_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OtpVerifyData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  message: string;
  access?: string;
  refresh?: string;
  error?: string;
  otp_sent?: boolean;
  debug_otp?: string;  // Only available in development mode
}

export const authApi = {
  // Signup - creates user and sends OTP
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/signup/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || result.username?.[0] || result.email?.[0] || 'Signup failed');
    }
    return result;
  },

  // Verify signup OTP
  verifySignupOtp: async (data: OtpVerifyData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/verify-signup-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'OTP verification failed');
    }
    return result;
  },

  // Login - sends OTP to email
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Login failed');
    }
    return result;
  },

  // Verify login OTP - returns tokens
  verifyLoginOtp: async (data: OtpVerifyData): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/verify-login-otp/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'OTP verification failed');
    }
    return result;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<{ access: string }> => {
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Token refresh failed');
    }
    return result;
  },
};

// Generic fetch wrapper with auth
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  return response;
};

// Error handling helper
const handleApiError = async (response: Response): Promise<never> => {
  let errorMessage = 'An error occurred';
  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch {
    errorMessage = response.statusText || errorMessage;
  }
  throw new Error(errorMessage);
};

// ================================
// PARTY API
// ================================

export interface ApiPartyData {
  Category_type: 'Customer' | 'Supplier';
  is_active?: boolean;
  photo?: string | null;
  // Customer fields
  name: string;
  email?: string;
  phone_no?: string;
  Customer_code?: string;
  address?: string;
  open_balance?: number;
  credit_limmit?: number;
  preferred_payment_method?: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI';
  loyalty_points?: number;
  referred_by?: string;
  notes?: string;
  // Supplier fields
  code?: string;
}

export interface ApiPartyResponse {
  message: string;
  party: {
    id: number;
    Category_type: string;
    is_active: boolean;
    is_updated_at: string;
    photo?: string | null;
  };
  customer?: {
    id: number;
    party: number;
    name: string;
    email: string | null;
    phone_no: string | null;
    Customer_code: string | null;
    address: string | null;
    open_balance: string;
    credit_limmit: string;
    preferred_payment_method: string | null;
    loyalty_points: number;
    referred_by: string | null;
    notes: string | null;
  };
  supplier?: {
    id: number;
    party: number;
    name: string;
    code: string;
  };
}

export interface ApiPartiesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    Category_type: string;
    is_active: boolean;
    is_updated_at: string;
    photo?: string | null;
  }>;
}

export const partyApi = {
  // Get all parties
  getAll: async (categoryType?: 'Customer' | 'Supplier'): Promise<ApiPartiesListResponse> => {
    let url = '/parties/';
    if (categoryType) {
      url += `?category_type=${categoryType}`;
    }
    const response = await fetchWithAuth(url);
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Get single party by ID
  getById: async (id: number): Promise<ApiPartyResponse> => {
    const response = await fetchWithAuth(`/parties/?id=${id}`);
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Create new party (customer or supplier)
  create: async (data: ApiPartyData): Promise<ApiPartyResponse> => {
    const response = await fetchWithAuth('/parties/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Update party
  update: async (id: number, data: Partial<ApiPartyData>): Promise<ApiPartyResponse> => {
    const response = await fetchWithAuth(`/parties/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Delete party
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`/parties/?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
};

// ================================
// EXPENSE API
// ================================

export interface ApiExpenseData {
  category: 'Rent' | 'Utilities' | 'Salary' | 'Inventory' | 'Transport' | 'Food' | 'Office Supplies' | 'Phone' | 'Marketing' | 'Other';
  amount: number;
  description?: string;
  date: string; // YYYY-MM-DD format
  is_necessary?: boolean;
}

export interface ApiExpenseResponse {
  message: string;
  expense: {
    id: number;
    user: number;
    category: string;
    amount: string;
    description: string | null;
    date: string;
    is_necessary: boolean;
  };
}

export interface ApiExpensesListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    user: number;
    category: string;
    amount: string;
    description: string | null;
    date: string;
    is_necessary: boolean;
  }>;
}

export const expenseApi = {
  // Get all expenses
  getAll: async (): Promise<ApiExpensesListResponse> => {
    const response = await fetchWithAuth('/expenses/');
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Create new expense
  create: async (data: ApiExpenseData): Promise<ApiExpenseResponse> => {
    const response = await fetchWithAuth('/expenses/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Update expense
  update: async (id: number, data: Partial<ApiExpenseData>): Promise<ApiExpenseResponse> => {
    const response = await fetchWithAuth(`/expenses/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Delete expense
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`/expenses/?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
};

// ================================
// AUTH API (for storing tokens)
// ================================

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      parsed.state = {
        ...parsed.state,
        accessToken,
        refreshToken,
      };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    } else {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          accessToken,
          refreshToken,
          isAuthenticated: true,
        },
        version: 0,
      }));
    }
  } catch {
    // ignore
  }
};

export const clearAuthTokens = () => {
  try {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      delete parsed.state?.accessToken;
      delete parsed.state?.refreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
};

// ================================
// PRODUCT API
// ================================

export interface ProductData {
  product_name: string;
  category: number; // Category ID
  sku?: string;
  product_Img?: string;
  unit_price: number;
  quantity: number;
  description?: string;
}

export interface ProductResponse {
  message: string;
  product: {
    id: number;
    user: number;
    product_name: string;
    category: number;
    sku: string;
    product_Img: string | null;
    unit_price: string;
    quantity: number;
    description: string | null;
  };
}

export interface ProductsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    user: number;
    product_name: string;
    category: number;
    sku: string;
    product_Img: string | null;
    unit_price: string;
    quantity: number;
    description: string | null;
  }>;
}

export const productApi = {
  // Get all products
  getAll: async (): Promise<ProductsListResponse> => {
    const response = await fetchWithAuth('/products/');
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Get single product by ID
  getById: async (id: number): Promise<ProductResponse> => {
    const response = await fetchWithAuth(`/products/${id}`);
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Create new product
  create: async (data: ProductData): Promise<ProductResponse> => {
    const response = await fetchWithAuth('/products/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Update product
  update: async (id: number, data: Partial<ProductData>): Promise<ProductResponse> => {
    const response = await fetchWithAuth(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Delete product
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`/products/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
};

// ================================
// BILLING API
// ================================

export interface BillingItemData {
  item: number; // Product ID
  quantity: number;
  rate: number;
  discount_percentage?: number;
  tax_percentage?: number;
  total_price: number;
}

export interface BillingData {
  invoice_number: string;
  invoice_date?: string;
  due_date?: string;
  payment_method?: 'Cash' | 'Credit Card' | 'Bank Transfer' | 'UPI';
  invoice_status?: 'Paid' | 'Unpaid' | 'Pending' | 'Draft';
  party?: number;
  phone?: string;
  VAt_number?: string;
  address?: string;
  notes?: string;
  paid_amount?: number;
  due_amount?: number;
  total_amount?: number;
  discount?: number;
  tax?: number;
  sub_total?: number;
  items: BillingItemData[];
}

export interface BillingResponse {
  message: string;
  billing: {
    id: number;
    user: number;
    invoice_number: string;
    invoice_date: string | null;
    due_date: string | null;
    payment_method: string | null;
    invoice_status: string;
    party: number | null;
    phone: string | null;
    VAt_number: string | null;
    address: string | null;
    notes: string | null;
    paid_amount: string;
    due_amount: string;
    total_amount: string;
    discount: string;
    tax: string;
    sub_total: string;
  };
}

export interface BillingListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    id: number;
    user: number;
    invoice_number: string;
    invoice_date: string | null;
    due_date: string | null;
    payment_method: string | null;
    invoice_status: string;
    party: number | null;
    phone: string | null;
    VAt_number: string | null;
    address: string | null;
    notes: string | null;
    paid_amount: string;
    due_amount: string;
    total_amount: string;
    discount: string;
    tax: string;
    sub_total: string;
  }>;
}

export const billingApi = {
  // Get all billings
  getAll: async (): Promise<BillingListResponse> => {
    const response = await fetchWithAuth('/billing/');
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Get single billing by ID
  getById: async (id: number): Promise<BillingResponse> => {
    const response = await fetchWithAuth(`/billing/?id=${id}`);
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Create new billing/invoice
  create: async (data: BillingData): Promise<BillingResponse> => {
    const response = await fetchWithAuth('/billing/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Update billing
  update: async (id: number, data: Partial<BillingData>): Promise<BillingResponse> => {
    const response = await fetchWithAuth(`/billing/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },

  // Delete billing
  delete: async (id: number): Promise<{ message: string }> => {
    const response = await fetchWithAuth(`/billing/?id=${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
};

// ================================
// SETTINGS API
// ================================

export interface GeneralSettingsPayload {
  appearance?: 'light' | 'classic' | 'dark';
  language?: 'en' | 'np';
  currency?: 'NPR' | 'INR' | 'USD';
  currencyPosition?: 'start' | 'end';
  calendarType?: 'AD' | 'BS';
  dateFormat?: 'YYYY-MM-DD' | 'DD-MM-YYYY' | 'MM-DD-YYYY' | 'BS';
  timeFormat?: '12h' | '24h';
  numberFormat?: 'international' | 'indian';
  privacyMode?: boolean;
  appLock?: boolean;
  appLockPin?: string;
}

export interface BankAccountPayload {
  id?: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branch?: string;
  isPrimary: boolean;
}

export interface BusinessProfilePayload {
  businessName?: string;
  businessContactNumber?: string;
  businessEmail?: string;
  businessCategory?: string;
  businessType?: string;
  province?: string;
  district?: string;
  municipality?: string;
  streetAddress?: string;
  registrationNumber?: string;
  bankAccounts?: BankAccountPayload[];
  businessLogo?: string | null;
}

export interface FeatureSettingsPayload {
  parties?: {
    partyCategory?: boolean;
    uploadPartyImage?: boolean;
  };
  inventory?: {
    enableBarcode?: boolean;
    enableSKU?: boolean;
    lowStockAlert?: boolean;
    lowStockThreshold?: number;
    enableCategories?: boolean;
    trackCostPrice?: boolean;
  };
  transactions?: {
    autoGenerateInvoiceNumber?: boolean;
    defaultPaymentMethod?: string;
    enablePaymentReminders?: boolean;
    reminderDays?: number;
    showSignature?: boolean;
    defaultNotes?: string;
  };
  invoicePrint?: {
    paperSize?: 'A4' | 'A5' | 'thermal';
    showLogo?: boolean;
    showBusinessDetails?: boolean;
    showCustomerDetails?: boolean;
    showPaymentInfo?: boolean;
    footerText?: string;
    printCopies?: number;
  };
}

export interface SubscriptionPayload {
  plan?: 'free' | 'basic' | 'pro' | 'enterprise';
  expiryDate?: string;
  features?: string[];
}

export interface SettingsResponse {
  general: GeneralSettingsPayload;
  business_profile: BusinessProfilePayload;
  feature_settings: FeatureSettingsPayload;
  subscription: SubscriptionPayload;
}

export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  profile: {
    phone_no?: string;
    business_name?: string;
    photo?: string | null;
    is_verify?: boolean;
  };
}

export const settingsApi = {
  get: async (): Promise<SettingsResponse> => {
    const response = await fetchWithAuth('/settings/');
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
  update: async (data: Partial<SettingsResponse>): Promise<SettingsResponse> => {
    const response = await fetchWithAuth('/settings/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/settings/profile/');
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
  updateProfile: async (data: Partial<ProfileResponse & { phone_no?: string; business_name?: string; photo?: string | null }>): Promise<ProfileResponse> => {
    const response = await fetchWithAuth('/settings/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      await handleApiError(response);
    }
    return response.json();
  },
};

export default {
  auth: authApi,
  party: partyApi,
  expense: expenseApi,
  product: productApi,
  billing: billingApi,
  settings: settingsApi,
  setAuthTokens,
  clearAuthTokens,
};

