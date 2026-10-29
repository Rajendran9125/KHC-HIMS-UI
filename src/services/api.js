// Centralized API Client for KHC-HIMS Backend (Spring Boot at port 8080)
const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errBody = await res.json().catch(() => null);
      throw new Error(errBody?.message || `HTTP error! Status: ${res.status}`);
    }
    const json = await res.json();
    return json.data !== undefined ? json.data : json;
  } catch (error) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  resetPassword: (data) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(data) }),

  // Master: Users
  getUsers: () => request('/master/users'),
  createUser: (data) => request('/master/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/master/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/master/users/${id}`, { method: 'DELETE' }),
  getMenus: () => request('/master/menus'),

  // Master: Hospital Service Tariff (Service Name, Header, Dept, OPRATE, IPRATE, Status)
  getServices: (query = '', activeOnly = false) => {
    let url = `/master/services?activeOnly=${activeOnly}`;
    if (query) url += `&query=${encodeURIComponent(query)}`;
    return request(url);
  },
  createService: (data) => request('/master/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/master/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/master/services/${id}`, { method: 'DELETE' }),

  // Master: Doctors
  getDoctors: (activeOnly = false) => request(`/master/doctors?activeOnly=${activeOnly}`),
  createDoctor: (data) => request('/master/doctors', { method: 'POST', body: JSON.stringify(data) }),
  updateDoctor: (id, data) => request(`/master/doctors/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Master: Location (Country / State / City)
  getCountries: (activeOnly = false) => request(`/master/countries?activeOnly=${activeOnly}`),
  createCountry: (data) => request('/master/countries', { method: 'POST', body: JSON.stringify(data) }),
  updateCountry: (id, data) => request(`/master/countries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCountry: (id) => request(`/master/countries/${id}`, { method: 'DELETE' }),

  getStates: (countryId = '', activeOnly = false) => {
    let url = `/master/states?activeOnly=${activeOnly}`;
    if (countryId) url += `&countryId=${countryId}`;
    return request(url);
  },
  createState: (data) => request('/master/states', { method: 'POST', body: JSON.stringify(data) }),
  updateState: (id, data) => request(`/master/states/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteState: (id) => request(`/master/states/${id}`, { method: 'DELETE' }),

  getCities: (stateId = '', activeOnly = false) => {
    let url = `/master/cities?activeOnly=${activeOnly}`;
    if (stateId) url += `&stateId=${stateId}`;
    return request(url);
  },
  createCity: (data) => request('/master/cities', { method: 'POST', body: JSON.stringify(data) }),
  updateCity: (id, data) => request(`/master/cities/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCity: (id) => request(`/master/cities/${id}`, { method: 'DELETE' }),

  // Master: Types & Stats
  getPatientTypes: () => request('/master/patient-types'),
  getPaymentTypes: () => request('/master/payment-types'),
  getAdminStats: () => request('/master/admin/stats'),

  // Registration
  registerOpNew: (data) => request('/registration/op-new', { method: 'POST', body: JSON.stringify(data) }),
  registerOpReview: (data) => request('/registration/op-review', { method: 'POST', body: JSON.stringify(data) }),
  updatePatient: (data) => request('/registration/patient-update', { method: 'PUT', body: JSON.stringify(data) }),
  modifyRegDoctor: (data) => request('/registration/modify-doctor', { method: 'PUT', body: JSON.stringify(data) }),
  modifyRegPatientType: (data) => request('/registration/modify-patient-type', { method: 'PUT', body: JSON.stringify(data) }),
  modifyRegPaymentType: (data) => request('/registration/modify-payment-type', { method: 'PUT', body: JSON.stringify(data) }),
  getRegistrations: (query = '') => request(`/registration/list${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  searchPatients: (query = '') => request(`/registration/patients/search${query ? `?query=${encodeURIComponent(query)}` : ''}`),

  // Billing
  createOpBill: (data) => request('/billing/op-service', { method: 'POST', body: JSON.stringify(data) }),
  modifyBillDoctor: (data) => request('/billing/modify-doctor', { method: 'PUT', body: JSON.stringify(data) }),
  modifyBillPaymentType: (data) => request('/billing/modify-payment-type', { method: 'PUT', body: JSON.stringify(data) }),
  refundBillItem: (data) => request('/billing/refund-item', { method: 'POST', body: JSON.stringify(data) }),
  refundFullBill: (data) => request('/billing/refund-full', { method: 'POST', body: JSON.stringify(data) }),
  getBills: (query = '') => request(`/billing/list${query ? `?query=${encodeURIComponent(query)}` : ''}`),
  getBillById: (id) => request(`/billing/${id}`),

  // Reports
  getOpBillingReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/op-billing${q ? `?${q}` : ''}`);
  },
  getRevenueReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/revenue${q ? `?${q}` : ''}`);
  },
  getOpRegistrationReport: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/reports/op-registration${q ? `?${q}` : ''}`);
  },
};
