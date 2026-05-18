import os
import joblib
import pandas as pd
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'decision_tree_model.pkl')
FEATURES_PATH = os.path.join(BASE_DIR, 'models', 'features_list.pkl')

model = None
features_list = None

try:
    model = joblib.load(MODEL_PATH)
    features_list = joblib.load(FEATURES_PATH)
except Exception as e:
    print(f"Error loading models: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not features_list:
        return jsonify({'error': 'Model not loaded on the server.'}), 500
    
    try:
        data = request.json
        
        # Extract base inputs
        age = float(data.get('age', 0))
        tenure = float(data.get('tenure', 0))
        monthly_charges = float(data.get('monthly_charges', 0))
        total_charges = float(data.get('total_charges', 0))
        gender = data.get('gender', '')
        contract = data.get('contract', '')
        payment_method = data.get('payment_method', '')

        # Initialize feature variables
        gender_male = 0
        gender_other = 0
        contract_one_year = 0
        contract_two_year = 0
        payment_credit_card = 0
        payment_electronic_check = 0
        payment_mailed_check = 0

        # Mappings
        if gender == "Male":
            gender_male = 1
        elif gender == "Other":
            gender_other = 1

        if contract == "One year":
            contract_one_year = 1
        elif contract == "Two year":
            contract_two_year = 1

        if payment_method == "Credit card":
            payment_credit_card = 1
        elif payment_method == "Electronic check":
            payment_electronic_check = 1
        elif payment_method == "Mailed check":
            payment_mailed_check = 1

        # Construct dictionary for pandas dataframe
        input_dict = {
            'Age': age,
            'Tenure': tenure,
            'MonthlyCharges': monthly_charges,
            'TotalCharges': total_charges,
            'Gender_Male': gender_male,
            'Gender_Other': gender_other,
            'Contract_One year': contract_one_year,
            'Contract_Two year': contract_two_year,
            'PaymentMethod_Credit card': payment_credit_card,
            'PaymentMethod_Electronic check': payment_electronic_check,
            'PaymentMethod_Mailed check': payment_mailed_check
        }

        # Create DataFrame with exact feature columns in order
        df = pd.DataFrame([input_dict], columns=features_list)

        # Ensure types are appropriate
        df = df.astype(float)

        # Predict probability
        prob = model.predict_proba(df)[0][1]
        
        return jsonify({
            'churn_probability': prob * 100
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
