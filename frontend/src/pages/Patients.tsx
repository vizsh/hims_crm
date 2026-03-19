import React, { useState } from 'react';
import PatientTable from '../components/PatientTable';
import PatientDrawer from '../components/PatientDrawer';
import { Patient } from '../api';

const Patients: React.FC = () => {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [messagePatient, setMessagePatient] = useState<Patient | null>(null);

  return (
    <div>
      <h1 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 700, color: '#fff' }}>
        Patients
      </h1>
      <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#9ca3af' }}>
        Manage all patients and their retention risk profiles
      </p>

      <PatientTable
        onPatientClick={(patient) => setSelectedPatientId(patient.patient_id)}
        onSendMessage={(patient) => setMessagePatient(patient)}
      />

      <PatientDrawer
        patientId={selectedPatientId}
        onClose={() => setSelectedPatientId(null)}
      />
    </div>
  );
};

export default Patients;
