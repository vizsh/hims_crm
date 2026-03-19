/**
 * MedRetain CRM - API Client
 * Typed fetch wrappers for all backend endpoints
 */

const API_BASE = '/api';

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

// API Functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

export async function getPatients(filters: PatientFilters = {}): Promise<PatientsResponse> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });

  const queryString = params.toString();
  return fetchAPI<PatientsResponse>(`/patients${queryString ? `?${queryString}` : ''}`);
}

export async function getPatient(id: string): Promise<PatientDetail> {
  return fetchAPI<PatientDetail>(`/patients/${id}`);
}

export async function updatePatientAction(id: string, action: string): Promise<void> {
  await fetchAPI(`/patients/${id}/action`, {
    method: 'PUT',
    body: JSON.stringify({ crm_action_required: action }),
  });
}

export async function getSummary(): Promise<AnalyticsSummary> {
  return fetchAPI<AnalyticsSummary>('/analytics/summary');
}

export async function getRetentionTrend(): Promise<RetentionTrendResponse> {
  return fetchAPI<RetentionTrendResponse>('/analytics/retention-trend');
}

export async function getChurnDistribution(): Promise<any> {
  return fetchAPI('/analytics/churn-distribution');
}

export async function getBranchPerformance(): Promise<any> {
  return fetchAPI('/analytics/branch-performance');
}

export async function getEngagementMetrics(): Promise<any> {
  return fetchAPI('/analytics/engagement-metrics');
}

export async function getBatches(): Promise<Batch[]> {
  return fetchAPI<Batch[]>('/batches');
}

export async function getFilterOptions(): Promise<FilterOptions> {
  return fetchAPI<FilterOptions>('/batches/filter-options');
}

export async function createBatch(payload: CreateBatchPayload): Promise<Batch> {
  return fetchAPI<Batch>('/batches', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBatchPatients(batchId: number): Promise<BatchPatient[]> {
  return fetchAPI<BatchPatient[]>(`/batches/${batchId}/patients`);
}

export async function markBatchPatientActioned(batchId: number, patientId: string): Promise<void> {
  await fetchAPI(`/batches/${batchId}/patients/${patientId}/action`, {
    method: 'POST',
  });
}

export async function sendMessage(payload: SendMessagePayload): Promise<MessageResponse> {
  return fetchAPI<MessageResponse>('/messages/send', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPatientMessages(patientId: string): Promise<MessageResponse[]> {
  return fetchAPI<MessageResponse[]>(`/messages/${patientId}`);
}

export async function getMessageLog(): Promise<any[]> {
  return fetchAPI<any[]>('/messages/log');
}

export async function getConditionsBreakdown(): Promise<any> {
  return fetchAPI('/analytics/conditions-breakdown');
}

export async function getMLModelInfo(): Promise<any> {
  return fetchAPI('/analytics/ml/model-info');
}

export async function getMLFeatureImportance(): Promise<any> {
  return fetchAPI('/analytics/ml/feature-importance-detailed');
}

export async function getPatientRiskAnalysis(patientId: string): Promise<any> {
  return fetchAPI(`/patients/${patientId}/risk-analysis`);
}

export async function getPatientRecommendations(patientId: string): Promise<any> {
  return fetchAPI(`/patients/${patientId}/recommendations`);
}

export async function getPatientCompleteAnalysis(patientId: string): Promise<any> {
  return fetchAPI(`/patients/${patientId}/complete-analysis`);
}
