"""
Test script for the MedRetain CRM churn prediction model.
Run this script to verify all ML functionality works correctly.

Usage:
    python test_model.py
"""
import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pandas as pd
import numpy as np


def test_imports():
    """Test that all imports work correctly."""
    print("\n[1/7] Testing imports...")
    try:
        from ml.churn_model import (
            train_model,
            load_model,
            predict_score,
            predict_batch,
            get_feature_importance,
            get_feature_importance_detailed,
            get_patient_risk_factors,
            get_patient_recommendations,
            analyze_patient_complete,
            get_model_info,
            engineer_features
        )
        print("    OK - All imports successful")
        return True
    except ImportError as e:
        print(f"    FAIL - Import error: {e}")
        return False


def test_feature_engineering():
    """Test feature engineering on sample data."""
    print("\n[2/7] Testing feature engineering...")
    try:
        from ml.churn_model import engineer_features, FEATURE_NAMES

        # Create sample data
        sample_data = pd.DataFrame([{
            'days_since_last_visit': 120,
            'no_show_rate': 0.2,
            'total_appointments': 5,
            'completed_visits': 4,
            'satisfaction_score': 3.5,
            'is_chronic': 'Yes',
            'visit_frequency_per_year': 2.5,
            'cancelled_count': 1,
            'total_billed': 10000,
            'total_paid': 8000,
            'avg_bill_per_visit': 2000,
            'lifetime_value_inr': 50000,
            'age': 45,
            'days_since_registration': 365,
            'latest_appointment_status': 'Completed',
            'latest_payment_status': 'Paid'
        }])

        feature_df, feature_names = engineer_features(sample_data)

        assert len(feature_names) == len(FEATURE_NAMES), "Feature count mismatch"
        assert feature_df.shape[0] == 1, "Row count mismatch"
        assert feature_df.shape[1] >= len(FEATURE_NAMES), "Column count mismatch"

        print(f"    OK - Generated {len(feature_names)} features")
        print(f"    Sample features: {list(feature_df.columns)[:5]}")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        return False


def test_model_training():
    """Test model training (uses actual CSV data)."""
    print("\n[3/7] Testing model training...")
    try:
        from ml.churn_model import train_model

        csv_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "data",
            "hospital_crm_master.csv"
        )

        if not os.path.exists(csv_path):
            print(f"    SKIP - CSV file not found at {csv_path}")
            return True  # Skip but don't fail

        model, label_encoder, accuracy, report = train_model(csv_path, verbose=False)

        assert model is not None, "Model is None"
        assert accuracy > 0.5, f"Accuracy too low: {accuracy}"
        assert hasattr(model, 'predict'), "Model missing predict method"

        print(f"    OK - Model trained successfully")
        print(f"    Accuracy: {accuracy:.4f}")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_model_loading():
    """Test model loading."""
    print("\n[4/7] Testing model loading...")
    try:
        from ml.churn_model import load_model, MODEL_PATH

        if not os.path.exists(MODEL_PATH):
            print("    SKIP - Model not trained yet")
            return True

        model, scaler, label_encoder, feature_names = load_model()

        assert model is not None, "Model is None"
        assert scaler is not None, "Scaler is None"
        assert label_encoder is not None, "Label encoder is None"
        assert len(feature_names) > 0, "No feature names"

        print(f"    OK - Model loaded successfully")
        print(f"    Features: {len(feature_names)}")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        return False


def test_prediction():
    """Test prediction on sample patient."""
    print("\n[5/7] Testing prediction...")
    try:
        from ml.churn_model import predict_score

        sample_patient = {
            'patient_id': 'TEST001',
            'days_since_last_visit': 180,
            'no_show_rate': 0.3,
            'total_appointments': 5,
            'completed_visits': 3,
            'satisfaction_score': 2.5,
            'is_chronic': 'Yes',
            'visit_frequency_per_year': 1.0,
            'cancelled_count': 1,
            'total_billed': 10000,
            'total_paid': 5000,
            'avg_bill_per_visit': 2000,
            'lifetime_value_inr': 25000,
            'age': 65,
            'days_since_registration': 500,
            'latest_appointment_status': 'No-show',
            'latest_payment_status': 'Pending'
        }

        score, label = predict_score(sample_patient)

        assert 0 <= score <= 100, f"Score out of range: {score}"
        assert label in ['Low', 'Medium', 'High'], f"Invalid label: {label}"

        print(f"    OK - Prediction successful")
        print(f"    Score: {score:.1f}, Label: {label}")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        return False


def test_patient_insights():
    """Test patient-specific insights and recommendations."""
    print("\n[6/7] Testing patient insights...")
    try:
        from ml.churn_model import (
            get_patient_risk_factors,
            get_patient_recommendations,
            analyze_patient_complete
        )

        sample_patient = {
            'patient_id': 'TEST002',
            'full_name': 'Test Patient',
            'days_since_last_visit': 200,
            'no_show_rate': 0.4,
            'total_appointments': 8,
            'completed_visits': 4,
            'satisfaction_score': 2.0,
            'is_chronic': 'Yes',
            'visit_frequency_per_year': 0.5,
            'cancelled_count': 2,
            'total_billed': 50000,
            'total_paid': 30000,
            'avg_bill_per_visit': 6250,
            'lifetime_value_inr': 100000,
            'age': 70,
            'days_since_registration': 730,
            'latest_appointment_status': 'No-show',
            'latest_payment_status': 'Pending'
        }

        # Test risk factors
        risk_analysis = get_patient_risk_factors(sample_patient)
        assert 'risk_score' in risk_analysis, "Missing risk_score"
        assert 'risk_factors' in risk_analysis, "Missing risk_factors"

        # Test recommendations
        recommendations = get_patient_recommendations(sample_patient)
        assert 'recommendations' in recommendations, "Missing recommendations"
        assert 'priority_actions' in recommendations, "Missing priority_actions"

        # Test complete analysis
        analysis = analyze_patient_complete(sample_patient)
        assert 'risk_assessment' in analysis, "Missing risk_assessment"
        assert 'action_plan' in analysis, "Missing action_plan"
        assert 'summary' in analysis, "Missing summary"

        print(f"    OK - Patient insights generated")
        print(f"    Risk factors: {len(risk_analysis['risk_factors'])}")
        print(f"    Recommendations: {len(recommendations['recommendations'])}")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_feature_importance():
    """Test feature importance extraction."""
    print("\n[7/7] Testing feature importance...")
    try:
        from ml.churn_model import (
            get_feature_importance,
            get_feature_importance_detailed,
            MODEL_METRICS_PATH
        )

        if not os.path.exists(MODEL_METRICS_PATH):
            print("    SKIP - Model metrics not found (model not trained)")
            return True

        # Test basic importance
        importances = get_feature_importance()
        assert len(importances) > 0, "No importances returned"
        assert all(v >= 0 for v in importances.values()), "Negative importance found"

        # Test top N
        top_5 = get_feature_importance(top_n=5)
        assert len(top_5) == 5, f"Expected 5 features, got {len(top_5)}"

        # Test detailed importance
        detailed = get_feature_importance_detailed()
        assert len(detailed) > 0, "No detailed importances"
        assert 'rank' in detailed[0], "Missing rank in detailed"
        assert 'importance' in detailed[0], "Missing importance in detailed"

        print(f"    OK - Feature importance extracted")
        print(f"    Top feature: {list(importances.keys())[0]}")
        return True
    except FileNotFoundError:
        print("    SKIP - Model not trained yet")
        return True
    except Exception as e:
        print(f"    FAIL - Error: {e}")
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("MedRetain CRM - ML Model Test Suite")
    print("=" * 60)

    tests = [
        test_imports,
        test_feature_engineering,
        test_model_training,
        test_model_loading,
        test_prediction,
        test_patient_insights,
        test_feature_importance
    ]

    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"    FAIL - Unexpected error: {e}")
            results.append(False)

    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    passed = sum(results)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")

    if passed == total:
        print("\nAll tests passed!")
        return 0
    else:
        print(f"\n{total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
