"""
Data loader for MedRetain CRM.
Loads patient data from CSV and initializes the database.
"""
import os
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime
from .database import SessionLocal, engine
from .models import Patient, Base
from .ml.churn_model import predict_batch


def parse_date(date_str):
    """
    Parse date string to date object.
    Handles various date formats.
    """
    if pd.isna(date_str) or date_str == "" or date_str is None:
        return None

    try:
        # Try parsing with pandas
        parsed = pd.to_datetime(date_str, errors='coerce')
        if pd.isna(parsed):
            return None
        return parsed.date()
    except:
        return None


def load_patient_data(csv_path: str, db: Session):
    """
    Load patient data from CSV into the database.

    Args:
        csv_path: Path to the CSV file
        db: Database session
    """
    print(f"Loading data from {csv_path}...")

    if not os.path.exists(csv_path):
        print(f"WARNING: CSV file not found at {csv_path}")
        return

    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"Found {len(df)} records in CSV")

    # Check existing patients
    existing_patient_ids = set(
        patient_id[0] for patient_id in db.query(Patient.patient_id).all()
    )
    print(f"Found {len(existing_patient_ids)} existing patients in database")

    # Filter new patients
    new_patients_df = df[~df['patient_id'].isin(existing_patient_ids)]
    print(f"Loading {len(new_patients_df)} new patients...")

    if len(new_patients_df) == 0:
        print("No new patients to load")
        return

    # Load patients in batches
    batch_size = 100
    total_loaded = 0

    for start_idx in range(0, len(new_patients_df), batch_size):
        end_idx = min(start_idx + batch_size, len(new_patients_df))
        batch_df = new_patients_df.iloc[start_idx:end_idx]

        batch_patients = []
        for _, row in batch_df.iterrows():
            try:
                patient = Patient(
                    patient_id=str(row.get('patient_id', '')),
                    full_name=str(row.get('full_name', '')) if pd.notna(row.get('full_name')) else None,
                    age=int(row['age']) if pd.notna(row.get('age')) else None,
                    gender=str(row.get('gender', '')) if pd.notna(row.get('gender')) else None,
                    contact_number=str(row.get('contact_number', '')) if pd.notna(row.get('contact_number')) else None,
                    email=str(row.get('email', '')) if pd.notna(row.get('email')) else None,
                    primary_condition=str(row.get('primary_condition', '')) if pd.notna(row.get('primary_condition')) else None,
                    is_chronic=str(row.get('is_chronic', '')) if pd.notna(row.get('is_chronic')) else None,
                    primary_doctor_name=str(row.get('primary_doctor_name', '')) if pd.notna(row.get('primary_doctor_name')) else None,
                    churn_risk_score=float(row['churn_risk_score']) if pd.notna(row.get('churn_risk_score')) else None,
                    churn_risk_label=str(row.get('churn_risk_label', '')) if pd.notna(row.get('churn_risk_label')) else None,
                    days_since_last_visit=int(row['days_since_last_visit']) if pd.notna(row.get('days_since_last_visit')) else None,
                    last_visit_date=parse_date(row.get('last_visit_date')),
                    total_appointments=int(row['total_appointments']) if pd.notna(row.get('total_appointments')) else None,
                    completed_visits=int(row['completed_visits']) if pd.notna(row.get('completed_visits')) else None,
                    no_show_rate=float(row['no_show_rate']) if pd.notna(row.get('no_show_rate')) else None,
                    visit_frequency_per_year=float(row['visit_frequency_per_year']) if pd.notna(row.get('visit_frequency_per_year')) else None,
                    total_billed=float(row['total_billed']) if pd.notna(row.get('total_billed')) else None,
                    total_paid=float(row['total_paid']) if pd.notna(row.get('total_paid')) else None,
                    outstanding_balance=float(row['outstanding_balance']) if pd.notna(row.get('outstanding_balance')) else None,
                    payment_history=str(row.get('payment_history', '')) if pd.notna(row.get('payment_history')) else None,
                    satisfaction_score=float(row['satisfaction_score']) if pd.notna(row.get('satisfaction_score')) else None,
                    nps_score=int(row['nps_score']) if pd.notna(row.get('nps_score')) else None,
                    feedback_received=str(row.get('feedback_received', '')) if pd.notna(row.get('feedback_received')) else None,
                    hospital_branch=str(row.get('hospital_branch', '')) if pd.notna(row.get('hospital_branch')) else None,
                    referral_source=str(row.get('referral_source', '')) if pd.notna(row.get('referral_source')) else None,
                    patient_segment=str(row.get('patient_segment', '')) if pd.notna(row.get('patient_segment')) else None,
                    loyalty_tier=str(row.get('loyalty_tier', '')) if pd.notna(row.get('loyalty_tier')) else None,
                    whatsapp_opt_in=str(row.get('whatsapp_opt_in', '')) if pd.notna(row.get('whatsapp_opt_in')) else None,
                    preferred_contact_method=str(row.get('preferred_contact_method', '')) if pd.notna(row.get('preferred_contact_method')) else None,
                    last_whatsapp_message_date=parse_date(row.get('last_whatsapp_message_date')),
                    last_whatsapp_message_status=str(row.get('last_whatsapp_message_status', '')) if pd.notna(row.get('last_whatsapp_message_status')) else None,
                    crm_action_required=str(row.get('crm_action_required', '')) if pd.notna(row.get('crm_action_required')) else None,
                    followup_required=str(row.get('followup_required', '')) if pd.notna(row.get('followup_required')) else None,
                    last_contacted_date=parse_date(row.get('last_contacted_date')),
                    insurance_provider=str(row.get('insurance_provider', '')) if pd.notna(row.get('insurance_provider')) else None,
                    insurance_status=str(row.get('insurance_status', '')) if pd.notna(row.get('insurance_status')) else None,
                    emergency_contact_name=str(row.get('emergency_contact_name', '')) if pd.notna(row.get('emergency_contact_name')) else None,
                    emergency_contact_number=str(row.get('emergency_contact_number', '')) if pd.notna(row.get('emergency_contact_number')) else None,
                    medical_record_number=str(row.get('medical_record_number', '')) if pd.notna(row.get('medical_record_number')) else None,
                    registration_date=parse_date(row.get('registration_date')),
                    last_prescription_date=parse_date(row.get('last_prescription_date')),
                    prescription_adherence_score=float(row['prescription_adherence_score']) if pd.notna(row.get('prescription_adherence_score')) else None,
                    lab_tests_completed=int(row['lab_tests_completed']) if pd.notna(row.get('lab_tests_completed')) else None,
                    imaging_scans_completed=int(row['imaging_scans_completed']) if pd.notna(row.get('imaging_scans_completed')) else None,
                    specialist_referrals=int(row['specialist_referrals']) if pd.notna(row.get('specialist_referrals')) else None,
                    hospital_admissions=int(row['hospital_admissions']) if pd.notna(row.get('hospital_admissions')) else None,
                    er_visits=int(row['er_visits']) if pd.notna(row.get('er_visits')) else None,
                    telehealth_visits=int(row['telehealth_visits']) if pd.notna(row.get('telehealth_visits')) else None,
                    avg_wait_time_minutes=float(row['avg_wait_time_minutes']) if pd.notna(row.get('avg_wait_time_minutes')) else None,
                    service_rating=float(row['service_rating']) if pd.notna(row.get('service_rating')) else None,
                    facility_rating=float(row['facility_rating']) if pd.notna(row.get('facility_rating')) else None,
                    doctor_rating=float(row['doctor_rating']) if pd.notna(row.get('doctor_rating')) else None,
                    communication_rating=float(row['communication_rating']) if pd.notna(row.get('communication_rating')) else None,
                    appointment_booking_method=str(row.get('appointment_booking_method', '')) if pd.notna(row.get('appointment_booking_method')) else None,
                    preferred_appointment_time=str(row.get('preferred_appointment_time', '')) if pd.notna(row.get('preferred_appointment_time')) else None,
                    language_preference=str(row.get('language_preference', '')) if pd.notna(row.get('language_preference')) else None,
                    special_needs=str(row.get('special_needs', '')) if pd.notna(row.get('special_needs')) else None,
                    chronic_disease_program_enrolled=str(row.get('chronic_disease_program_enrolled', '')) if pd.notna(row.get('chronic_disease_program_enrolled')) else None,
                    wellness_program_enrolled=str(row.get('wellness_program_enrolled', '')) if pd.notna(row.get('wellness_program_enrolled')) else None,
                )
                batch_patients.append(patient)
            except Exception as e:
                print(f"Error loading patient {row.get('patient_id', 'unknown')}: {e}")
                continue

        # Bulk insert
        if batch_patients:
            db.bulk_save_objects(batch_patients)
            db.commit()
            total_loaded += len(batch_patients)
            print(f"Loaded {total_loaded}/{len(new_patients_df)} patients...")

    print(f"Successfully loaded {total_loaded} new patients")


def update_churn_predictions(db: Session):
    """
    Update churn predictions for all patients in the database.
    """
    print("\nUpdating churn predictions for all patients...")

    try:
        # Get all patients
        patients = db.query(Patient).all()
        print(f"Found {len(patients)} patients in database")

        if len(patients) == 0:
            print("No patients to update")
            return

        # Convert to DataFrame
        patient_data = []
        for patient in patients:
            patient_data.append({
                'patient_id': patient.patient_id,
                'days_since_last_visit': patient.days_since_last_visit or 0,
                'no_show_rate': patient.no_show_rate or 0,
                'total_appointments': patient.total_appointments or 0,
                'completed_visits': patient.completed_visits or 0,
                'satisfaction_score': patient.satisfaction_score or 3.0,
                'is_chronic': patient.is_chronic or 'No',
                'visit_frequency_per_year': patient.visit_frequency_per_year or 0,
                'churn_risk_label': patient.churn_risk_label or 'Medium'
            })

        df = pd.DataFrame(patient_data)

        # Predict scores
        scores, labels = predict_batch(df)

        # Update patients
        batch_size = 100
        total_updated = 0

        for i, patient in enumerate(patients):
            patient.churn_risk_score = float(scores[i])
            patient.churn_risk_label = str(labels[i])

            if (i + 1) % batch_size == 0:
                db.commit()
                total_updated = i + 1
                print(f"Updated {total_updated}/{len(patients)} patients...")

        # Final commit
        db.commit()
        print(f"Successfully updated churn predictions for {len(patients)} patients")

    except Exception as e:
        print(f"Error updating churn predictions: {e}")
        db.rollback()


def initialize_data():
    """
    Initialize the database with patient data from CSV.
    Only runs if the patients table is empty.
    """
    print("\n" + "="*60)
    print("MedRetain CRM - Data Initialization")
    print("="*60 + "\n")

    # Create session
    db = SessionLocal()

    try:
        # Check if data already exists
        patient_count = db.query(Patient).count()

        if patient_count > 0:
            print(f"Database already initialized with {patient_count} patients")
            print("Skipping data load...")
            return

        # Path to CSV
        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "data",
            "hospital_crm_master.csv"
        )

        # Load patient data
        load_patient_data(csv_path, db)

        # Update churn predictions
        update_churn_predictions(db)

        print("\n" + "="*60)
        print("Data initialization completed successfully!")
        print("="*60 + "\n")

    except Exception as e:
        print(f"Error during data initialization: {e}")
        db.rollback()
    finally:
        db.close()
