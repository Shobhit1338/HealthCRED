from pydantic import BaseModel, Field, field_validator, ValidationError
from datetime import date
from typing import List
import re

class User(BaseModel):
    name: str
    dob: date
    pan: str
    aadhar: str
    gstin: str
    udyam: str

    @field_validator('dob')
    def check_age(cls, dob):
        today = date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if age < 18:
            raise ValueError('User must be at least 18 years old')
        return dob

    @field_validator('pan')
    def validate_pan(cls, pan):
        pattern = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')
        if not pattern.match(pan):
            raise ValueError('Invalid PAN format')
        return pan

    @field_validator('aadhar')
    def validate_aadhar(cls, aadhar):
        pattern = re.compile(r'^\d{4}\s\d{4}\s\d{4}$')
        if not pattern.match(aadhar):
            raise ValueError('Invalid Aadhar format')
        return aadhar

    @field_validator('gstin')
    def validate_gstin(cls, gstin):
        pattern = re.compile(r'^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}Z[A-Z\d]{1}$')
        if not pattern.match(gstin):
            raise ValueError('Invalid GSTIN format')
        return gstin

    @field_validator('udyam')
    def validate_udyam(cls, udyam):
        pattern = re.compile(r'^UDYAM-[A-Z]{2}-00-\d{7}$')
        if not pattern.match(udyam):
            raise ValueError('Invalid UDYAM format')
        return udyam

class LoanDetails(BaseModel):
    disbursement_date: date
    loan_amount: float = Field(..., gt=0)
    interest_rate: float = Field(..., gt=0)
    tenure: int = Field(..., gt=0)
    repayment_dates: List[date]

    @field_validator('repayment_dates')
    def validate_repayment_dates(cls, repayment_dates, info):
        if not repayment_dates:
            raise ValueError('At least one repayment date is required')
        disbursement_date = info.data.get('disbursement_date')
        if disbursement_date:
            for repayment_date in repayment_dates:
                if repayment_date <= disbursement_date:
                    raise ValueError('Repayment dates must be after the disbursement date')
        return repayment_dates

class EMIAllocation(BaseModel):
    payment_date: date
    principal_component: float
    interest_component: float
    total_payment: float
    outstanding_principal: float
