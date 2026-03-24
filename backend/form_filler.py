"""
PolicyPilot - Form Auto-Filler
Extracts citizen details from uploaded documents and pre-fills application forms.
"""

# Form templates for different schemes
FORM_TEMPLATES = {
    "pm-kisan": {
        "title": "PM-KISAN Registration Form",
        "fields": [
            {"name": "full_name", "label": "Full Name", "type": "text", "required": True},
            {"name": "father_name", "label": "Father's/Husband's Name", "type": "text", "required": True},
            {"name": "aadhaar", "label": "Aadhaar Number", "type": "text", "required": True},
            {"name": "age", "label": "Age", "type": "number", "required": True},
            {"name": "gender", "label": "Gender", "type": "select", "options": ["Male", "Female", "Other"], "required": True},
            {"name": "state", "label": "State", "type": "text", "required": True},
            {"name": "district", "label": "District", "type": "text", "required": True},
            {"name": "village", "label": "Village/Town", "type": "text", "required": True},
            {"name": "land_holding", "label": "Land Holding (Acres)", "type": "number", "required": True},
            {"name": "annual_income", "label": "Annual Income (₹)", "type": "number", "required": True},
            {"name": "bank_name", "label": "Bank Name", "type": "text", "required": True},
            {"name": "account_number", "label": "Bank Account Number", "type": "text", "required": True},
            {"name": "ifsc", "label": "IFSC Code", "type": "text", "required": True},
            {"name": "mobile", "label": "Mobile Number", "type": "text", "required": True},
        ]
    },
    "pmfby": {
        "title": "PMFBY Crop Insurance Application",
        "fields": [
            {"name": "full_name", "label": "Full Name", "type": "text", "required": True},
            {"name": "aadhaar", "label": "Aadhaar Number", "type": "text", "required": True},
            {"name": "state", "label": "State", "type": "text", "required": True},
            {"name": "district", "label": "District", "type": "text", "required": True},
            {"name": "land_holding", "label": "Land Holding (Acres)", "type": "number", "required": True},
            {"name": "crop_name", "label": "Crop Name", "type": "text", "required": True},
            {"name": "season", "label": "Season", "type": "select", "options": ["Kharif", "Rabi", "Zaid"], "required": True},
            {"name": "sowing_date", "label": "Sowing Date", "type": "date", "required": True},
            {"name": "bank_name", "label": "Bank Name", "type": "text", "required": True},
            {"name": "account_number", "label": "Account Number", "type": "text", "required": True},
        ]
    },
    "default": {
        "title": "Scheme Application Form",
        "fields": [
            {"name": "full_name", "label": "Full Name", "type": "text", "required": True},
            {"name": "aadhaar", "label": "Aadhaar Number", "type": "text", "required": True},
            {"name": "age", "label": "Age", "type": "number", "required": True},
            {"name": "state", "label": "State", "type": "text", "required": True},
            {"name": "district", "label": "District", "type": "text", "required": True},
            {"name": "annual_income", "label": "Annual Income (₹)", "type": "number", "required": True},
            {"name": "mobile", "label": "Mobile Number", "type": "text", "required": True},
            {"name": "bank_name", "label": "Bank Name", "type": "text", "required": True},
            {"name": "account_number", "label": "Account Number", "type": "text", "required": True},
        ]
    }
}

# Simulated OCR extraction from documents
MOCK_EXTRACTED_DATA = {
    "full_name": "Ramesh Kumar Patel",
    "father_name": "Suresh Kumar Patel",
    "aadhaar": "XXXX-XXXX-7834",
    "age": "45",
    "gender": "Male",
    "state": "Gujarat",
    "district": "Mehsana",
    "village": "Visnagar",
    "annual_income": "140000",
    "land_holding": "2",
    "mobile": "98XXXXXX21",
    "bank_name": "State Bank of India",
    "account_number": "XXXXXX4521",
    "ifsc": "SBIN0001234",
}


def auto_fill_form(scheme_id, citizen_data=None):
    """
    Auto-fill form fields using extracted document data.
    Returns form template with pre-filled values and source attribution.
    """
    template = FORM_TEMPLATES.get(scheme_id, FORM_TEMPLATES["default"])
    extracted = {**MOCK_EXTRACTED_DATA, **(citizen_data or {})}

    filled_fields = []
    auto_filled_count = 0

    for field in template["fields"]:
        value = extracted.get(field["name"], "")
        source = "Manual Entry"

        if value and field["name"] in ["full_name", "father_name", "aadhaar", "age", "gender", "district", "village"]:
            source = "Aadhaar Card"
            auto_filled_count += 1
        elif value and field["name"] in ["annual_income"]:
            source = "Income Certificate"
            auto_filled_count += 1
        elif value and field["name"] in ["state", "land_holding"]:
            source = "User Input"
            auto_filled_count += 1
        elif value:
            auto_filled_count += 1

        filled_fields.append({
            **field,
            "value": str(value) if value else "",
            "source": source,
            "autoFilled": bool(value),
        })

    total = len(template["fields"])
    return {
        "title": template["title"],
        "fields": filled_fields,
        "summary": {
            "total": total,
            "autoFilled": auto_filled_count,
            "manual": total - auto_filled_count,
            "percentage": round((auto_filled_count / total) * 100) if total else 0,
        }
    }
