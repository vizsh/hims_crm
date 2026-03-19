/**
 * MedRetain CRM - API Client
 * Typed fetch wrappers for all backend endpoints
 * Includes demo mode for static deployment (Vercel)
 */

// Check if we're in demo mode (no backend available)
const API_BASE = import.meta.env.VITE_API_URL || '/api';
let isDemo = false;

// Types
export interface Patient {
  patient_id: string;
  full_name: string | null;
  age: number | null;
  gender: string | null;
  contact_number: string | null;
  email: string | null;
  primary_condition: string | null;
  is_chronic: string | null;
  churn_risk_score: number | null;
  churn_risk_label: string | null;
  days_since_last_visit: number | null;
  whatsapp_opt_in: string | null;
  crm_action_required: string | null;
  patient_segment: string | null;
  hospital_branch: string | null;
  satisfaction_score: number | null;
  no_show_rate: number | null;
}

export interface PatientDetail extends Patient {
  primary_doctor_name: string | null;
  last_visit_date: string | null;
  total_appointments: number | null;
  completed_visits: number | null;
  visit_frequency_per_year: number | null;
  total_billed: number | null;
  total_paid: number | null;
  outstanding_balance: number | null;
  payment_history: string | null;
  nps_score: number | null;
  feedback_received: string | null;
  referral_source: string | null;
  loyalty_tier: string | null;
  preferred_contact_method: string | null;
  last_whatsapp_message_date: string | null;
  last_whatsapp_message_status: string | null;
  followup_required: string | null;
  last_contacted_date: string | null;
  insurance_provider: string | null;
  insurance_status: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
  medical_record_number: string | null;
  registration_date: string | null;
  last_prescription_date: string | null;
  prescription_adherence_score: number | null;
  lab_tests_completed: number | null;
  imaging_scans_completed: number | null;
  specialist_referrals: number | null;
  hospital_admissions: number | null;
  er_visits: number | null;
  telehealth_visits: number | null;
  avg_wait_time_minutes: number | null;
  service_rating: number | null;
  facility_rating: number | null;
  doctor_rating: number | null;
  communication_rating: number | null;
  appointment_booking_method: string | null;
  preferred_appointment_time: string | null;
  language_preference: string | null;
  special_needs: string | null;
  chronic_disease_program_enrolled: string | null;
  wellness_program_enrolled: string | null;
}

export interface PatientsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  patients: Patient[];
}

export interface PatientFilters {
  page?: number;
  page_size?: number;
  churn_risk_label?: string;
  is_chronic?: string;
  hospital_branch?: string;
  patient_segment?: string;
}

export interface AnalyticsSummary {
  total_patients: number;
  high_risk_count: number;
  medium_risk_count: number;
  low_risk_count: number;
  avg_churn_score: number;
  total_at_risk: number;
  whatsapp_opt_in_percentage: number;
  avg_satisfaction_score: number;
  count_by_segment: Record<string, number>;
}

export interface RetentionTrendPoint {
  month: string;
  patient_count: number;
}

export interface RetentionTrendResponse {
  trend: RetentionTrendPoint[];
}

export interface Batch {
  id: number;
  created_at: string;
  batch_size: number;
  filter_criteria: string;
  label: string;
  patient_count?: number;
}

export interface BatchPatient {
  patient_id: string;
  full_name: string | null;
  churn_risk_label: string | null;
  churn_risk_score: number | null;
  contact_number: string | null;
  actioned: boolean;
}

export interface CreateBatchPayload {
  filter_criteria: {
    risk_level?: string;
    segment?: string;
    branch?: string;
    is_chronic?: string;
    days_overdue?: string;
    satisfaction_level?: string;
    no_show_risk?: string;
    age_group?: string;
    whatsapp_only?: boolean;
    condition?: string;
    limit: number;
  };
  label: string;
}

export interface FilterOptions {
  risk_levels: string[];
  branches: string[];
  segments: string[];
  conditions: string[];
  chronic_options: string[];
  days_overdue_options: { value: string; label: string }[];
  satisfaction_levels: { value: string; label: string }[];
  no_show_risk_levels: { value: string; label: string }[];
  age_groups: { value: string; label: string }[];
}

export interface SendMessagePayload {
  patient_id: string;
  message_type: string;
  custom_text?: string;
}

export interface MessageResponse {
  id: number;
  patient_id: string;
  message_type: string;
  content: string;
  sent_at: string;
  delivery_status: string;
  twilio_sid: string | null;
  error_message: string | null;
}

// Demo Data
const DEMO_PATIENTS: Patient[] = [
  { patient_id: 'P001', full_name: 'David Williams', age: 69, gender: 'M', contact_number: '6939585183', email: 'david.williams@mail.com', primary_condition: 'Ear Infection', is_chronic: 'No', churn_risk_score: 95.09, churn_risk_label: 'High', days_since_last_visit: 224, whatsapp_opt_in: 'Yes', crm_action_required: 'Send appointment reminder', patient_segment: 'Returning', hospital_branch: 'Westside Clinic', satisfaction_score: 3.0, no_show_rate: 0.25 },
  { patient_id: 'P002', full_name: 'Sarah Johnson', age: 45, gender: 'F', contact_number: '5551234567', email: 'sarah.j@mail.com', primary_condition: 'Diabetes', is_chronic: 'Yes', churn_risk_score: 72.5, churn_risk_label: 'Medium', days_since_last_visit: 45, whatsapp_opt_in: 'Yes', crm_action_required: 'Follow-up call', patient_segment: 'Chronic Regular', hospital_branch: 'Downtown Hospital', satisfaction_score: 4.2, no_show_rate: 0.1 },
  { patient_id: 'P003', full_name: 'Michael Chen', age: 52, gender: 'M', contact_number: '5559876543', email: 'mchen@mail.com', primary_condition: 'Hypertension', is_chronic: 'Yes', churn_risk_score: 45.2, churn_risk_label: 'Low', days_since_last_visit: 15, whatsapp_opt_in: 'No', crm_action_required: 'None', patient_segment: 'Chronic High Value', hospital_branch: 'Eastside Medical', satisfaction_score: 4.8, no_show_rate: 0.05 },
  { patient_id: 'P004', full_name: 'Emily Rodriguez', age: 34, gender: 'F', contact_number: '5552345678', email: 'emily.r@mail.com', primary_condition: 'Asthma', is_chronic: 'Yes', churn_risk_score: 82.1, churn_risk_label: 'High', days_since_last_visit: 180, whatsapp_opt_in: 'Yes', crm_action_required: 'Urgent callback', patient_segment: 'Chronic Regular', hospital_branch: 'Westside Clinic', satisfaction_score: 2.5, no_show_rate: 0.35 },
  { patient_id: 'P005', full_name: 'James Wilson', age: 78, gender: 'M', contact_number: '5553456789', email: 'jwilson@mail.com', primary_condition: 'Heart Disease', is_chronic: 'Yes', churn_risk_score: 88.7, churn_risk_label: 'High', days_since_last_visit: 120, whatsapp_opt_in: 'Yes', crm_action_required: 'Senior care outreach', patient_segment: 'Chronic High Value', hospital_branch: 'Downtown Hospital', satisfaction_score: 3.5, no_show_rate: 0.2 },
  { patient_id: 'P006', full_name: 'Lisa Thompson', age: 28, gender: 'F', contact_number: '5554567890', email: 'lisa.t@mail.com', primary_condition: 'Allergies', is_chronic: 'No', churn_risk_score: 35.4, churn_risk_label: 'Low', days_since_last_visit: 30, whatsapp_opt_in: 'Yes', crm_action_required: 'None', patient_segment: 'Returning', hospital_branch: 'Eastside Medical', satisfaction_score: 4.5, no_show_rate: 0.0 },
  { patient_id: 'P007', full_name: 'Robert Brown', age: 61, gender: 'M', contact_number: '5555678901', email: 'rbrown@mail.com', primary_condition: 'Arthritis', is_chronic: 'Yes', churn_risk_score: 58.3, churn_risk_label: 'Medium', days_since_last_visit: 60, whatsapp_opt_in: 'No', crm_action_required: 'Schedule follow-up', patient_segment: 'Chronic Regular', hospital_branch: 'Westside Clinic', satisfaction_score: 3.8, no_show_rate: 0.15 },
  { patient_id: 'P008', full_name: 'Jennifer Davis', age: 42, gender: 'F', contact_number: '5556789012', email: 'jdavis@mail.com', primary_condition: 'Depression', is_chronic: 'Yes', churn_risk_score: 67.9, churn_risk_label: 'Medium', days_since_last_visit: 75, whatsapp_opt_in: 'Yes', crm_action_required: 'Mental health check-in', patient_segment: 'Chronic Regular', hospital_branch: 'Downtown Hospital', satisfaction_score: 3.2, no_show_rate: 0.25 },
];

const DEMO_SUMMARY: AnalyticsSummary = {
  total_patients: 2200,
  high_risk_count: 287,
  medium_risk_count: 820,
  low_risk_count: 1093,
  avg_churn_score: 62.04,
  total_at_risk: 1107,
  whatsapp_opt_in_percentage: 75.5,
  avg_satisfaction_score: 3.8,
  count_by_segment: {
    'Acute High Risk': 195,
    'Chronic High Value': 476,
    'Chronic Regular': 312,
    'One-time': 166,
    'Returning': 1051
  }
};

// API Functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Switch to demo mode if API is not available
    isDemo = true;
    throw error;
  }
}

export function isDemoMode(): boolean {
  return isDemo;
}

export async function getPatients(filters: PatientFilters = {}): Promise<PatientsResponse> {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return await fetchAPI<PatientsResponse>(`/patients${queryString ? `?${queryString}` : ''}`);
  } catch {
    // Return demo data
    const page = filters.page || 1;
    const pageSize = filters.page_size || 50;
    let filteredPatients = [...DEMO_PATIENTS];

    if (filters.churn_risk_label) {
      filteredPatients = filteredPatients.filter(p => p.churn_risk_label === filters.churn_risk_label);
    }

    return {
      total: filteredPatients.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(filteredPatients.length / pageSize),
      patients: filteredPatients.slice((page - 1) * pageSize, page * pageSize)
    };
  }
}

export async function getPatient(id: string): Promise<PatientDetail> {
  try {
    return await fetchAPI<PatientDetail>(`/patients/${id}`);
  } catch {
    const patient = DEMO_PATIENTS.find(p => p.patient_id === id);
    if (!patient) throw new Error('Patient not found');
    return {
      ...patient,
      primary_doctor_name: 'Dr. Smith',
      last_visit_date: '2025-06-15',
      total_appointments: 12,
      completed_visits: 10,
      visit_frequency_per_year: 4.2,
      total_billed: 15000,
      total_paid: 12500,
      outstanding_balance: 2500,
      payment_history: 'Good',
      nps_score: 8,
      feedback_received: 'Yes',
      referral_source: 'Online',
      loyalty_tier: 'Gold',
      preferred_contact_method: 'WhatsApp',
      last_whatsapp_message_date: null,
      last_whatsapp_message_status: null,
      followup_required: 'Yes',
      last_contacted_date: null,
      insurance_provider: 'BlueCross',
      insurance_status: 'Active',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_number: '5551112222',
      medical_record_number: `MRN${id}`,
      registration_date: '2020-01-15',
      last_prescription_date: '2025-05-20',
      prescription_adherence_score: 0.85,
      lab_tests_completed: 5,
      imaging_scans_completed: 2,
      specialist_referrals: 1,
      hospital_admissions: 0,
      er_visits: 1,
      telehealth_visits: 3,
      avg_wait_time_minutes: 15,
      service_rating: 4.2,
      facility_rating: 4.5,
      doctor_rating: 4.8,
      communication_rating: 4.0,
      appointment_booking_method: 'Online',
      preferred_appointment_time: 'Morning',
      language_preference: 'English',
      special_needs: null,
      chronic_disease_program_enrolled: patient.is_chronic === 'Yes' ? 'Yes' : 'No',
      wellness_program_enrolled: 'No'
    } as PatientDetail;
  }
}

export async function updatePatientAction(id: string, action: string): Promise<void> {
  try {
    await fetchAPI(`/patients/${id}/action`, {
      method: 'PUT',
      body: JSON.stringify({ crm_action_required: action }),
    });
  } catch {
    console.log('Demo mode: Action would be updated for', id);
  }
}

export async function getSummary(): Promise<AnalyticsSummary> {
  try {
    return await fetchAPI<AnalyticsSummary>('/analytics/summary');
  } catch {
    return DEMO_SUMMARY;
  }
}

export async function getRetentionTrend(): Promise<RetentionTrendResponse> {
  try {
    return await fetchAPI<RetentionTrendResponse>('/analytics/retention-trend');
  } catch {
    return {
      trend: [
        { month: 'Jan 2026', patient_count: 1850 },
        { month: 'Feb 2026', patient_count: 1920 },
        { month: 'Mar 2026', patient_count: 2200 },
        { month: 'Apr 2026', patient_count: 2050 },
        { month: 'May 2026', patient_count: 2180 },
        { month: 'Jun 2026', patient_count: 2300 },
      ]
    };
  }
}

export async function getChurnDistribution(): Promise<any> {
  try {
    return await fetchAPI('/analytics/churn-distribution');
  } catch {
    return { distribution: [] };
  }
}

export async function getBranchPerformance(): Promise<any> {
  try {
    return await fetchAPI('/analytics/branch-performance');
  } catch {
    return { branches: [] };
  }
}

export async function getEngagementMetrics(): Promise<any> {
  try {
    return await fetchAPI('/analytics/engagement-metrics');
  } catch {
    return { metrics: {} };
  }
}

export async function getBatches(): Promise<Batch[]> {
  try {
    return await fetchAPI<Batch[]>('/batches');
  } catch {
    return [
      { id: 1, created_at: '2026-03-15T10:00:00', batch_size: 50, filter_criteria: 'High Risk', label: 'March High Risk Outreach', patient_count: 45 },
      { id: 2, created_at: '2026-03-10T14:30:00', batch_size: 30, filter_criteria: 'Chronic Patients', label: 'Chronic Care Follow-up', patient_count: 28 },
    ];
  }
}

export async function getFilterOptions(): Promise<FilterOptions> {
  try {
    return await fetchAPI<FilterOptions>('/batches/filter-options');
  } catch {
    return {
      risk_levels: ['High', 'Medium', 'Low'],
      branches: ['Downtown Hospital', 'Westside Clinic', 'Eastside Medical'],
      segments: ['Chronic High Value', 'Chronic Regular', 'Returning', 'One-time', 'Acute High Risk'],
      conditions: ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Arthritis', 'Depression'],
      chronic_options: ['Yes', 'No'],
      days_overdue_options: [
        { value: '0-30', label: '0-30 days' },
        { value: '31-90', label: '31-90 days' },
        { value: '90+', label: '90+ days' }
      ],
      satisfaction_levels: [
        { value: '1', label: '1 star' },
        { value: '2', label: '2 stars' },
        { value: '3', label: '3 stars' },
        { value: '4', label: '4 stars' },
        { value: '5', label: '5 stars' }
      ],
      no_show_risk_levels: [
        { value: 'low', label: 'Low (0-10%)' },
        { value: 'medium', label: 'Medium (10-25%)' },
        { value: 'high', label: 'High (25%+)' }
      ],
      age_groups: [
        { value: 'young', label: 'Young (0-35)' },
        { value: 'middle', label: 'Middle (36-55)' },
        { value: 'senior', label: 'Senior (56-70)' },
        { value: 'elderly', label: 'Elderly (70+)' }
      ]
    };
  }
}

export async function createBatch(payload: CreateBatchPayload): Promise<Batch> {
  try {
    return await fetchAPI<Batch>('/batches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: Date.now(),
      created_at: new Date().toISOString(),
      batch_size: payload.filter_criteria.limit,
      filter_criteria: JSON.stringify(payload.filter_criteria),
      label: payload.label,
      patient_count: Math.min(payload.filter_criteria.limit, 25)
    };
  }
}

export async function getBatchPatients(batchId: number): Promise<BatchPatient[]> {
  try {
    return await fetchAPI<BatchPatient[]>(`/batches/${batchId}/patients`);
  } catch {
    return DEMO_PATIENTS.slice(0, 5).map(p => ({
      patient_id: p.patient_id,
      full_name: p.full_name,
      churn_risk_label: p.churn_risk_label,
      churn_risk_score: p.churn_risk_score,
      contact_number: p.contact_number,
      actioned: false
    }));
  }
}

export async function markBatchPatientActioned(batchId: number, patientId: string): Promise<void> {
  try {
    await fetchAPI(`/batches/${batchId}/patients/${patientId}/action`, {
      method: 'POST',
    });
  } catch {
    console.log('Demo mode: Patient marked as actioned');
  }
}

export async function sendMessage(payload: SendMessagePayload): Promise<MessageResponse> {
  try {
    return await fetchAPI<MessageResponse>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      id: Date.now(),
      patient_id: payload.patient_id,
      message_type: payload.message_type,
      content: payload.custom_text || 'Demo message sent',
      sent_at: new Date().toISOString(),
      delivery_status: 'demo_sent',
      twilio_sid: null,
      error_message: null
    };
  }
}

export async function getPatientMessages(patientId: string): Promise<MessageResponse[]> {
  try {
    return await fetchAPI<MessageResponse[]>(`/messages/${patientId}`);
  } catch {
    return [];
  }
}

export async function getMessageLog(): Promise<any[]> {
  try {
    return await fetchAPI<any[]>('/messages/log');
  } catch {
    return [];
  }
}

export async function getConditionsBreakdown(): Promise<any> {
  try {
    return await fetchAPI('/analytics/conditions-breakdown');
  } catch {
    return {
      conditions: [
        { condition: 'Hypertension', patient_count: 425, avg_churn_score: 65.2, color: '#ffd166' },
        { condition: 'Diabetes', patient_count: 380, avg_churn_score: 72.8, color: '#ff6b6b' },
        { condition: 'Heart Disease', patient_count: 295, avg_churn_score: 78.1, color: '#ff6b6b' },
        { condition: 'Asthma', patient_count: 245, avg_churn_score: 45.6, color: '#00d4a8' },
        { condition: 'Arthritis', patient_count: 220, avg_churn_score: 58.9, color: '#ffd166' },
        { condition: 'Kidney Disease', patient_count: 185, avg_churn_score: 81.3, color: '#ff6b6b' },
        { condition: 'Depression', patient_count: 165, avg_churn_score: 62.4, color: '#ffd166' },
        { condition: 'COPD', patient_count: 145, avg_churn_score: 85.2, color: '#ff6b6b' },
      ]
    };
  }
}

export async function getMLModelInfo(): Promise<any> {
  try {
    return await fetchAPI('/analytics/ml/model-info');
  } catch {
    return {
      status: 'trained',
      accuracy: 0.9409,
      precision: 0.9385,
      recall: 0.9433,
      n_features: 20,
      n_samples: 2200,
      trained_on: new Date().toISOString()
    };
  }
}

export async function getMLFeatureImportance(): Promise<any> {
  try {
    return await fetchAPI('/analytics/ml/feature-importance-detailed');
  } catch {
    return {
      features: [
        { feature: 'days_since_last_visit', importance: 0.5894 },
        { feature: 'engagement_score', importance: 0.0949 },
        { feature: 'satisfaction_score', importance: 0.0665 },
        { feature: 'total_appointments', importance: 0.057 },
        { feature: 'no_show_rate', importance: 0.0566 },
        { feature: 'is_chronic', importance: 0.0464 },
        { feature: 'visit_frequency_per_year', importance: 0.0201 },
        { feature: 'age', importance: 0.0091 },
      ]
    };
  }
}

export async function getPatientRiskAnalysis(patientId: string): Promise<any> {
  try {
    return await fetchAPI(`/patients/${patientId}/risk-analysis`);
  } catch {
    const patient = DEMO_PATIENTS.find(p => p.patient_id === patientId);
    if (!patient) throw new Error('Patient not found');

    return {
      risk_score: patient.churn_risk_score,
      risk_label: patient.churn_risk_label,
      risk_factors: [
        { factor: 'Long time since last visit', value: `${patient.days_since_last_visit} days`, severity: 'high', impact: 0.58 },
        { factor: 'Below-average satisfaction', value: `${patient.satisfaction_score}/5`, severity: 'medium', impact: 0.12 },
        { factor: 'Elevated no-show rate', value: `${(patient.no_show_rate || 0) * 100}%`, severity: 'medium', impact: 0.08 },
      ],
      contributing_features: [
        { feature: 'days_since_last_visit', value: patient.days_since_last_visit, importance: 0.5894 },
        { feature: 'satisfaction_score', value: patient.satisfaction_score, importance: 0.0665 },
        { feature: 'no_show_rate', value: patient.no_show_rate, importance: 0.0566 },
      ],
      total_risk_factors: 3
    };
  }
}

export async function getPatientRecommendations(patientId: string): Promise<any> {
  try {
    return await fetchAPI(`/patients/${patientId}/recommendations`);
  } catch {
    return {
      recommendations: [
        { priority: 'high', action: 'Schedule follow-up appointment' },
        { priority: 'medium', action: 'Send personalized health tips' },
      ]
    };
  }
}

export async function getPatientCompleteAnalysis(patientId: string): Promise<any> {
  try {
    return await fetchAPI(`/patients/${patientId}/complete-analysis`);
  } catch {
    const riskAnalysis = await getPatientRiskAnalysis(patientId);
    return {
      ...riskAnalysis,
      patient_id: patientId,
      analysis_timestamp: new Date().toISOString()
    };
  }
}
