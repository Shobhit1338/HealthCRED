# Loan Application and Ledger Management System

This project is a full-stack web application that allows users to input loan details, calculate EMIs (Monthly Installments), and view a detailed repayment ledger. The application consists of a React frontend with Chakra UI and a FastAPI backend.

## Installation and Setup

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Shobhit1338/HealthCRED.git
   cd HealthCRED
   ```

2. **Create and Activate a Virtual Environment**

   ```bash
   python -m venv venv
   ```

   - On Windows:

     ```bash
     venv\Scripts\activate
     ```

   - On macOS and Linux:

     ```bash
     source venv/bin/activate
     ```

3. **Install Backend Dependencies**

   ```bash
   pip install -r backend/requirements.txt
   ```

### Frontend Setup

1. **Navigate to the Frontend Directory**

   ```bash
   cd frontend
   ```

2. **Install Frontend Dependencies**

   ```bash
   npm install
   ```

## Running the Application

### Start the Backend Server

In one terminal window, navigate to the project root directory and activate the virtual environment if not already activated:

```bash
cd backend
```


Start the backend server:

```bash
uvicorn main:app --reload
```

The backend server will run on `http://localhost:8000`.

### Start the Frontend Server

In a separate terminal window, navigate to the frontend directory:

```bash
cd frontend
```

Start the frontend server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:5173` or another available port.

## Testing the Application

### Input Sample Data

1. **Open the Application**

   Open your browser and navigate to `http://localhost:5173`.

2. **Fill Out the Onboarding Form**

   - **First Name**: Enter your first name (e.g., `John`).
   - **Last Name**: Enter your last name (e.g., `Doe`).
   - **Date of Birth**: Select a date indicating you are over 18 years old (e.g., `1999-11-13`).
   - **PAN**: Enter a unique PAN number (e.g., `CNPPG1193L`). *Note: This needs to be unique each time you fill out a new form entry.*
   - **Aadhar**: Enter a valid Aadhar number (e.g., `4749 1892 6871`).
   - **GSTIN**: Enter a valid GSTIN (e.g., `22ABCDE1234F1Z5`).
   - **UDYAM**: Enter a valid UDYAM registration number (e.g., `UDYAM-XX-00-0000000`).

   - **Submit the Form**

     - Click the "Submit" button.
     - If there are validation errors, they will be displayed next to the corresponding fields.
     - Upon successful submission, you will be taken to the Loan Details form.

3. **Fill Out the Loan Details Form**

   - **Disbursement Date**: Select today's date.
   - **Loan Amount**: `10000` (e.g., ₹10,000).
   - **Interest Rate**: `8.5` (8.5% per annum).
   - **Tenure**: `4` (4 months).
   - **Repayment Dates**:
     - Click "Add Date" to add repayment dates.
     - Add 4 dates, each after the Disbursement Date.
     - For example, if the Disbursement Date is `2023-10-01`, the repayment dates could be:
       - `2023-11-01`
       - `2023-12-01`
       - `2024-01-01`
       - `2024-02-01`

   - **Submit the Form**

     - Click the "Submit" button.
     - If there are validation errors, they will be displayed next to the corresponding fields.

4. **View the Ledger**

   - After submitting the Loan Details form, you will be redirected to the Ledger View page.
   - The ledger displays the EMI schedule, including principal and interest components for each repayment date.
   - The next EMI date and outstanding principal are prominently displayed.
   - You can download the ledger as a CSV file by clicking "Download Ledger as CSV".

---

## Project Demo Video

[![Project Demo Video](Loan%20Management%20System%20Thumbnail.png)](https://drive.google.com/file/d/1elIfW0aYcUpXxCzyU1PEsXyRXFFNc44z/view?usp=sharing)
