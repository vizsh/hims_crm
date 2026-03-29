/**
 * SendWhatsAppButton Component
 * Integrated with MedRetain CRM
 * Sends WhatsApp messages via Twilio
 */

import React, { useState } from 'react';

interface SendWhatsAppButtonProps {
  patientPhone?: string;
  patientName?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
  messageType?: 'default' | 'reminder' | 'followup';
  reason?: string;
  onSuccess?: (messageSid: string) => void;
  onError?: (error: string) => void;
  variant?: 'primary' | 'secondary' | 'success';
}

const SendWhatsAppButton: React.FC<SendWhatsAppButtonProps> = ({
  patientPhone = '+917400291925', // FIXED: Hardcoded demo number for all patients
  patientName = 'Patient',
  appointmentDate,
  appointmentTime,
  doctorName,
  messageType = 'default',
  reason = 'general',
  onSuccess,
  onError,
  variant = 'primary'
}) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [messageSid, setMessageSid] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get API URL from environment or use default
  const API_BASE_URL = import.meta.env.VITE_MESSAGING_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000';

  console.log('🔗 API Base URL:', API_BASE_URL);
  console.log('📱 Phone Number:', patientPhone);

  /**
   * Send WhatsApp Message
   */
  const sendWhatsAppMessage = async () => {
    setLoading(true);
    setStatus('loading');
    setErrorMessage(null);

    try {
      console.log('📤 Sending WhatsApp message...');
      console.log('Target:', patientPhone);
      console.log('Type:', messageType);

      let endpoint = `${API_BASE_URL}/send-message`;
      let payload: any = {
        phoneNumber: patientPhone,
        patientName,
        message: 'Hi, this is a booking reminder. Your appointment is confirmed.',
      };

      if (messageType === 'reminder' && appointmentDate) {
        endpoint = `${API_BASE_URL}/send-appointment-reminder`;
        payload = { phoneNumber: patientPhone, patientName, appointmentDate, appointmentTime, doctorName };
      } else if (messageType === 'followup') {
        endpoint = `${API_BASE_URL}/send-followup-message`;
        payload = { phoneNumber: patientPhone, patientName, reason };
      }

      console.log('📡 Endpoint:', endpoint);
      console.log('💾 Payload:', payload);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response Status:', response.status);
      console.log('📥 Response Headers:', response.headers);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Response Data:', data);

      if (data.success) {
        setStatus('success');
        setMessageSid(data.data?.messageSid || null);
        console.log('✅ Message sent successfully:', data.data?.messageSid);
        if (onSuccess) onSuccess(data.data?.messageSid || '');
        setTimeout(() => { setStatus('idle'); setMessageSid(null); }, 4000);
      } else {
        throw new Error(data.error || 'Failed to send message');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('❌ Full Error:', error);
      console.error('❌ Error Message:', errorMsg);

      setStatus('error');
      setErrorMessage(errorMsg);

      if (onError) onError(errorMsg);
      setTimeout(() => { setStatus('idle'); setErrorMessage(null); }, 5000);

    } finally {
      setLoading(false);
    }
  };

  // Get button styling based on variant and status
  const getButtonStyle = () => {
    const baseStyle = {
      padding: '10px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      opacity: loading ? 0.7 : 1,
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      whiteSpace: 'nowrap' as const
    };

    if (status === 'success') {
      return {
        ...baseStyle,
        backgroundColor: '#10b981',
        color: '#fff'
      };
    }

    if (status === 'error') {
      return {
        ...baseStyle,
        backgroundColor: '#ef4444',
        color: '#fff'
      };
    }

    if (variant === 'secondary') {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: '#4cc9f0',
        border: '1px solid #4cc9f0'
      };
    }

    if (variant === 'success') {
      return {
        ...baseStyle,
        backgroundColor: '#00d4a8',
        color: '#0a0d12'
      };
    }

    return {
      ...baseStyle,
      backgroundColor: '#4cc9f0',
      color: '#0a0d12'
    };
  };

  // Get button text
  const getButtonText = () => {
    if (loading) {
      return '⏳ Sending...';
    }

    if (status === 'success') {
      return '✅ Sent!';
    }

    if (status === 'error') {
      return '❌ Failed';
    }

    if (messageType === 'reminder') {
      return '📱 Send Reminder';
    }

    if (messageType === 'followup') {
      return '📱 Send Follow-up';
    }

    return '📱 Send Message';
  };

  return (
    <div>
      <button
        onClick={sendWhatsAppMessage}
        disabled={loading || status === 'success'}
        style={getButtonStyle()}
        title={`Send WhatsApp to ${patientPhone}`}
      >
        {getButtonText()}
      </button>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '6px',
          color: '#ef4444',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          {errorMessage}
        </div>
      )}

      {/* Success Message */}
      {status === 'success' && messageSid && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '6px',
          color: '#10b981',
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          Message sent! (SID: {messageSid.substring(0, 8)}...)
        </div>
      )}
    </div>
  );
};

export default SendWhatsAppButton;
