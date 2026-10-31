import api from './axios';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  studentVerifyDetails: (data) => api.post('/auth/student/verify-details', data),
  studentLogin: (data) => api.post('/auth/student/login', data),
};

export const studentAPI = {
  getAll: (search) => api.get('/students', { params: search ? { search } : {} }),
  getByClass: (std, sec, search) => api.get(`/students/class/${std}/${sec}`, { params: search ? { search } : {} }),
  getById: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data, data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}),
  update: (id, data) => api.put(`/students/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {}),
  delete: (id) => api.delete(`/students/${id}`),
};

export const attendanceAPI = {
  getSheet: (std, sec, date) => api.get('/attendance/sheet', { params: { standard: std, section: sec, date } }),
  save: (data) => api.post('/attendance/save', data),
  getDashboard: () => api.get('/attendance/dashboard'),
  getStudentSummary: (id) => api.get(`/attendance/student/${id}/summary`),
  getDailyReport: (date) => api.get('/attendance/report/daily', { params: { date } }),
  getMonthlyReport: (std, sec, year, month) =>
    api.get('/attendance/report/monthly', { params: { standard: std, section: sec, year, month } }),
};

export const reportAPI = {
  downloadDailyPdf: (date) => api.get('/reports/daily/pdf', { params: { date }, responseType: 'blob' }),
  downloadDailyExcel: (date) => api.get('/reports/daily/excel', { params: { date }, responseType: 'blob' }),
  downloadStudentPdf: (id) => api.get(`/reports/student/${id}/pdf`, { responseType: 'blob' }),
};

export const marksAPI = {
  getByStudent: (id) => api.get(`/marks/student/${id}`),
  getByClass: (std, sec, year) => api.get(`/marks/class/${std}/${sec}`, { params: { year } }),
  add: (data) => api.post('/marks', data),
  update: (id, data) => api.put(`/marks/${id}`, data),
  delete: (id) => api.delete(`/marks/${id}`),
  togglePublish: (id, publish) => api.put(`/marks/${id}/publish`, null, { params: { publish } }),
  bulkPublish: (std, sec, examType, academicYear, published) =>
    api.post('/marks/publish-bulk', null, { params: { standard: std, section: sec, examType, academicYear, published } }),
};

export const documentAPI = {
  getAll: (studentId) => api.get(`/students/${studentId}/documents`),
  upload: (studentId, formData) =>
    api.post(`/students/${studentId}/documents`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (studentId, docId) => api.delete(`/students/${studentId}/documents/${docId}`),
};

export const studentPortalAPI = {
  getMyProfile: () => api.get('/student/me'),
  getMyAttendance: (params) => api.get('/student/me/attendance', { params }),
  getMonthlyAttendance: (year, month) => api.get('/student/me/attendance/monthly', { params: { year, month } }),
  getMyMarks: (params) => api.get('/student/me/marks', { params }),
  getMyResults: (params) => api.get('/student/me/results', { params }),
  getMyPerformance: () => api.get('/student/me/performance'),
  downloadMarksheet: (params) => api.get('/student/me/marksheet', { params, responseType: 'blob' }),
};

