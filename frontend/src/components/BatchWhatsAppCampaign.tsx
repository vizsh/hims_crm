/**
 * Batch WhatsApp Campaign Component
 * Send messages to multiple patients at once
 */

import React, { useState } from 'react';

interface BatchResult {
  patientId: string;
  phone: string;
  name: string;
  success: boolean;
  messageSid?: string;
  error?: string;
}

interface BatchCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients?: Array<{
    patientId: string;
    phone: string;
    name: string;
  }>;
}

const BatchWhatsAppCampaign: React.FC<BatchCampaignModalProps> = ({
  isOpen,
  onClose,
  patients = []
}) => {
  const [message, setMessage] = useState('Hi, this is a booking reminder. Your appointment is confirmed.');
  const [campaignName, setCampaignName] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [campaignStarted, setCampaignStarted] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_MESSAGING_API_URL || 'http://localhost:5000';

  const sendBatchMessages = async () => {
    if (!patients || patients.length === 0) {
      alert('No patients selected');
      return;
    }

    if (patients.length > 1000) {
      alert('Maximum 1000 patients per batch. Please reduce the selection.');
      return;
    }

    setLoading(true);
    setCampaignStarted(true);

    try {
      const response = await fetch(`${API_BASE_URL}/send-batch-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patients,
          message,
          batchId: campaignName || `batch_${Date.now()}`
        })
      });

      const data = await response.json();

      if (data.success && data.data?.results) {
        setResults(data.data.results);
        console.log('✅ Campaign completed:', data.data.summary);
      } else {
        throw new Error(data.error || 'Campaign failed');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMsg}`);
      console.error('❌ Batch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  const successRate = results.length > 0 ? ((successCount / results.length) * 100).toFixed(1) : '0';

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#141921',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        width: '600px',
        maxWidth: '90vw',
        maxHeight: '85vh',
        overflow: 'auto',
        padding: '32px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '22px', fontWeight: 600 }}>
            📱 Batch WhatsApp Campaign
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {!campaignStarted ? (
          <>
            {/* Campaign Settings */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="e.g., March Appointment Reminders"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#0a0d12',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Message Editor */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px', fontSize: '14px' }}>
                Message Content
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0a0d12',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'monospace'
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {message.length} / 1600 characters
              </div>
            </div>

            {/* Patient Summary */}
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(76, 201, 240, 0.1)',
              border: '1px solid rgba(76, 201, 240, 0.3)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ color: '#4cc9f0', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                📊 Campaign Summary
              </div>
              <div style={{ color: '#9ca3af', fontSize: '13px' }}>
                Total Patients: <strong style={{ color: '#fff' }}>{patients.length}</strong><br />
                Message Length: <strong style={{ color: '#fff' }}>{message.length}</strong> chars
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Cancel
              </button>
              <button
                onClick={sendBatchMessages}
                disabled={loading || patients.length === 0}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: loading ? '#666' : '#4cc9f0',
                  border: 'none',
                  borderRadius: '8px',
                  color: loading ? '#999' : '#0a0d12',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600
                }}
              >
                {loading ? '⏳ Sending...' : '🚀 Send to ' + patients.length + ' Patients'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Campaign Results */}
            <div style={{
              padding: '16px',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                📊 Campaign Results
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px'
              }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{ color: '#10b981', fontSize: '20px', fontWeight: 700 }}>
                    {successCount}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Successful</div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{ color: '#ef4444', fontSize: '20px', fontWeight: 700 }}>
                    {failureCount}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Failed</div>
                </div>
                <div style={{
                  padding: '12px',
                  backgroundColor: 'rgba(76, 201, 240, 0.1)',
                  borderRadius: '6px'
                }}>
                  <div style={{ color: '#4cc9f0', fontSize: '20px', fontWeight: 700 }}>
                    {successRate}%
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>Success Rate</div>
                </div>
              </div>
            </div>

            {/* Results List */}
            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              marginBottom: '24px'
            }}>
              {results.map((result, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                      {result.name} ({result.phone})
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '2px' }}>
                      {result.success ? `SID: ${result.messageSid?.substring(0, 8)}...` : result.error}
                    </div>
                  </div>
                  <div style={{
                    fontSize: '18px'
                  }}>
                    {result.success ? '✅' : '❌'}
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#00d4a8',
                border: 'none',
                borderRadius: '8px',
                color: '#0a0d12',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              ✅ Done
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BatchWhatsAppCampaign;
