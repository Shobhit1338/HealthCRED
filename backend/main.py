from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import User, LoanDetails, EMIAllocation
from fastapi.responses import StreamingResponse
import csv
import uuid
import io

app = FastAPI()

# Configure CORS
origins = [
    "http://localhost:5173",  # React app domain
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

users = {}
loans = {}

@app.post("/api/user")
def create_user(user: User):
    if user.pan in users:
        raise HTTPException(status_code=400, detail="User with this PAN already exists")
    users[user.pan] = user
    return {"message": "User data received", "user": user}

def calculate_emi(loan_details: LoanDetails):
    P = loan_details.loan_amount # Loan amount
    R = loan_details.interest_rate / (12 * 100)  # Interest rate
    N = loan_details.tenure  # Number of months

    if N != len(loan_details.repayment_dates):
        raise ValueError('Number of repayment dates must match the tenure')

    # EMI Formula
    emi = (P * R * (1 + R) ** N) / ((1 + R) ** N - 1)
    emi = round(emi, 2)

    schedule = []
    outstanding_principal = P

    for idx, payment_date in enumerate(loan_details.repayment_dates):
        interest_component = outstanding_principal * R
        principal_component = emi - interest_component
        outstanding_principal -= principal_component

        allocation = EMIAllocation(
            payment_date=payment_date,
            principal_component=round(principal_component, 2),
            interest_component=round(interest_component, 2),
            total_payment=round(emi, 2),
            outstanding_principal=round(max(outstanding_principal, 0), 2)
        )
        schedule.append(allocation)

    return emi, schedule

@app.post("/api/loan")
def calculate_loan(loan_details: LoanDetails):
    try:
        emi, schedule = calculate_emi(loan_details)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    loan_id = str(uuid.uuid4())
    loans[loan_id] = {
        "loan_details": loan_details,
        "emi": emi,
        "repayment_schedule": schedule
    }
    return {
        "loan_id": loan_id,
        "emi": emi,
        "repayment_schedule": schedule
    }

@app.get("/api/ledger")
def get_ledger(loan_id: str):
    loan = loans.get(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@app.get("/api/ledger/csv")
def download_ledger_csv(loan_id: str):
    loan = loans.get(loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    # Create CSV data in-memory
    csv_file = io.StringIO()
    fieldnames = ['payment_date', 'principal_component', 'interest_component', 'total_payment', 'outstanding_principal']
    writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
    writer.writeheader()
    for allocation in loan['repayment_schedule']:
        writer.writerow({
            'payment_date': allocation.payment_date,
            'principal_component': allocation.principal_component,
            'interest_component': allocation.interest_component,
            'total_payment': allocation.total_payment,
            'outstanding_principal': allocation.outstanding_principal
        })

    csv_file.seek(0)
    headers = {
        'Content-Disposition': f'attachment; filename="ledger_{loan_id}.csv"'
    }
    return StreamingResponse(csv_file, media_type='text/csv', headers=headers)
