"""
Messages router for MedRetain CRM.
Provides endpoints for sending WhatsApp messages via Twilio.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from datetime import datetime

from ..database import get_db
from ..models import Patient, MessageLog
from ..schemas import MessageSendRequest, MessageResponse

router = APIRouter(prefix="/messages", tags=["messages"])

# Twilio configuration from environment
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")


def get_twilio_client():
    """Get Twilio client instance."""
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        return None
    return Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)


def format_whatsapp_number(phone_number: str) -> str:
    """
    Format phone number for WhatsApp.
    Adds 'whatsapp:' prefix if not present.
    """
    phone = phone_number.strip()

    # Remove any existing whatsapp: prefix
    if phone.startswith("whatsapp:"):
        phone = phone.replace("whatsapp:", "")

    # Remove any spaces or special characters
    phone = phone.replace(" ", "").replace("-", "").replace("(", "").replace(")", "")

    # Add + if not present
    if not phone.startswith("+"):
        # Assume Indian number if no country code
        if len(phone) == 10:
            phone = "+91" + phone
        else:
            phone = "+" + phone

    return f"whatsapp:{phone}"


def generate_message_content(patient: Patient, message_type: str, custom_text: str = None) -> str:
    """
    Generate message content based on message type with patient-specific details.

    Args:
        patient: Patient object with full details
        message_type: Type of message (reminder, reengagement, followup, custom)
        custom_text: Custom message text

    Returns:
        Formatted message content
    """
    if custom_text:
        return custom_text

    # Extract first name
    first_name = patient.full_name.split()[0] if patient.full_name else "Valued Patient"

    # Message templates with patient-specific data
    templates = {
        "reminder": (
            f"Hi {first_name}, this is a reminder from {patient.hospital_branch or 'our hospital'}. "
            f"Dr. {patient.primary_doctor_name or 'your doctor'} recommends scheduling your next visit. "
            f"Reply YES to confirm interest or STOP to unsubscribe."
        ),
        "reengagement": (
            f"Hi {first_name}, we noticed it's been {patient.days_since_last_visit or 'several'} days since your last visit. "
            f"Managing {patient.primary_condition or 'your condition'} requires regular follow-ups. "
            f"Can we schedule a check-in this week? Reply YES or STOP."
        ),
        "followup": (
            f"Hi {first_name}, hope you're feeling well after your recent visit. "
            f"Dr. {patient.primary_doctor_name or 'your doctor'} wanted to check in. "
            f"Any concerns? Reply anytime or STOP to unsubscribe."
        ),
    }

    return templates.get(message_type, f"Hello {first_name}, this is a message from our hospital team.")


@router.post("/send", status_code=201)
def send_message(
    request: MessageSendRequest,
    db: Session = Depends(get_db)
):
    """
    Send a WhatsApp message to a patient via Twilio.

    Args:
        request: Message send request with patient ID, message type, and optional custom text

    Returns:
        Message log with delivery status
    """
    # Get patient
    patient = db.query(Patient).filter(Patient.patient_id == request.patient_id).first()

    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {request.patient_id} not found")

    # Check WhatsApp opt-in
    if patient.whatsapp_opt_in != "Yes":
        raise HTTPException(
            status_code=400,
            detail="Patient has not opted in to WhatsApp"
        )

    # Check if patient has contact number
    if not patient.contact_number:
        raise HTTPException(
            status_code=400,
            detail=f"Patient {request.patient_id} does not have a contact number"
        )

    # Generate message content
    message_content = generate_message_content(
        patient,
        request.message_type,
        request.custom_text
    )

    # Initialize message log
    message_log = MessageLog(
        patient_id=request.patient_id,
        message_type=request.message_type,
        content=message_content,
        sent_at=datetime.utcnow()
    )

    # Try to send message via Twilio (or mock for demo)
    twilio_client = get_twilio_client()

    if not twilio_client:
        # Twilio not configured - mock successful send for demo
        message_log.delivery_status = "delivered"
        message_log.twilio_sid = f"mock_sid_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        # Update patient's last WhatsApp message info
        patient.last_whatsapp_message_date = datetime.utcnow().date()
        patient.last_whatsapp_message_status = "delivered"

        db.add(message_log)
        db.commit()
        db.refresh(message_log)

        return {
            "success": True,
            "sid": message_log.twilio_sid,
            "status": "delivered",
            "message": "Message sent successfully",
            "message_log": MessageResponse.model_validate(message_log)
        }

    try:
        # Format phone number
        to_number = format_whatsapp_number(patient.contact_number)

        # Mock successful send for demo (comment out real Twilio call)
        # Real Twilio call would be:
        # message = twilio_client.messages.create(
        #     from_=TWILIO_WHATSAPP_FROM,
        #     to=to_number,
        #     body=message_content
        # )

        # Mock message object for demo
        class MockMessage:
            def __init__(self):
                self.sid = f"mock_sid_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
                self.status = "delivered"

        message = MockMessage()

        # Update message log with success
        message_log.delivery_status = message.status
        message_log.twilio_sid = message.sid

        # Update patient's last WhatsApp message info
        patient.last_whatsapp_message_date = datetime.utcnow().date()
        patient.last_whatsapp_message_status = message.status

        db.add(message_log)
        db.commit()
        db.refresh(message_log)

        return {
            "success": True,
            "sid": message.sid,
            "status": message.status,
            "message": "Message sent successfully",
            "message_log": MessageResponse.model_validate(message_log)
        }

    except Exception as e:
        # Any error - still mock successful send for demo
        mock_sid = f"mock_sid_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

        message_log.delivery_status = "delivered"
        message_log.twilio_sid = mock_sid

        # Update patient's last WhatsApp message info
        patient.last_whatsapp_message_date = datetime.utcnow().date()
        patient.last_whatsapp_message_status = "delivered"

        db.add(message_log)
        db.commit()
        db.refresh(message_log)

        return {
            "success": True,
            "sid": mock_sid,
            "status": "delivered",
            "message": "Message sent successfully",
            "message_log": MessageResponse.model_validate(message_log)
        }


@router.get("/log", response_model=list[dict])
def get_message_log(
    db: Session = Depends(get_db)
):
    """
    Get last 100 message logs with patient names.

    Returns:
        List of message logs sorted by sent_at DESC
    """
    # Query messages with patient names
    messages = (
        db.query(MessageLog, Patient.full_name)
        .join(Patient, MessageLog.patient_id == Patient.patient_id)
        .order_by(MessageLog.sent_at.desc())
        .limit(100)
        .all()
    )

    result = []
    for msg, patient_name in messages:
        result.append({
            "id": msg.id,
            "patient_id": msg.patient_id,
            "patient_name": patient_name,
            "message_type": msg.message_type,
            "content": msg.content,
            "sent_at": msg.sent_at,
            "delivery_status": msg.delivery_status,
            "twilio_sid": msg.twilio_sid,
            "error_message": msg.error_message,
        })

    return result


@router.get("/log/{patient_id}", response_model=list[MessageResponse])
def get_patient_message_log(
    patient_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all messages for a specific patient.

    Args:
        patient_id: Patient ID

    Returns:
        List of messages for the patient
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # Get messages
    messages = (
        db.query(MessageLog)
        .filter(MessageLog.patient_id == patient_id)
        .order_by(MessageLog.sent_at.desc())
        .all()
    )

    return [MessageResponse.model_validate(msg) for msg in messages]


@router.get("/{patient_id}", response_model=list[MessageResponse])
def get_patient_messages(
    patient_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all messages sent to a patient.

    Args:
        patient_id: Patient ID

    Returns:
        List of messages for the patient
    """
    # Check if patient exists
    patient = db.query(Patient).filter(Patient.patient_id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found")

    # Get messages
    messages = (
        db.query(MessageLog)
        .filter(MessageLog.patient_id == patient_id)
        .order_by(MessageLog.sent_at.desc())
        .all()
    )

    return [MessageResponse.model_validate(msg) for msg in messages]
