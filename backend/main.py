from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from schemes_data import SCHEMES, get_schemes_by_category
from conflict_detector import detect_conflicts
from form_filler import auto_fill_form
from database import (
    generate_otp, store_otp, verify_otp,
    create_guest_session, create_digilocker_session,
    log_query, get_stats as db_get_stats
)

app = FastAPI(title="PolicyPilot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ───────────────────────────────────────────

class CitizenProfile(BaseModel):
    description: str
    categories: List[str] = []
    state: str = ""
    documents: List[str] = []

class FormFillRequest(BaseModel):
    scheme_id: str
    citizen_data: dict = {}

class SendOTPRequest(BaseModel):
    phone: str

class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


# ─── Auth Endpoints ───────────────────────────────────

@app.post("/api/auth/send-otp")
def send_otp(request: SendOTPRequest):
    """Send OTP to phone number. In demo mode, returns OTP in response."""
    phone = request.phone.strip()
    if len(phone) < 10:
        return {"success": False, "error": "Invalid phone number"}
    
    otp_code = generate_otp()
    result = store_otp(phone, otp_code)

    # DEMO MODE: Return OTP directly (in production, send via SMS gateway)
    return {
        "success": True,
        "message": f"OTP sent to +91 {phone}",
        "otp_hint": otp_code,  # For demo/hackathon — shows OTP to user
        "expires_in": 300,
    }


@app.post("/api/auth/verify-otp")
def verify_otp_endpoint(request: VerifyOTPRequest):
    """Verify OTP and create session."""
    result = verify_otp(request.phone.strip(), request.otp.strip())
    return result


@app.post("/api/auth/guest")
def guest_login():
    """Create a guest session."""
    return create_guest_session()


@app.post("/api/auth/digilocker")
def digilocker_login():
    """Simulate DigiLocker authentication."""
    return create_digilocker_session()


# ─── Core Endpoints ──────────────────────────────────

@app.get("/")
def root():
    return {"status": "PolicyPilot API is running"}


@app.post("/api/match")
def match_schemes(profile: CitizenProfile):
    desc = profile.description.lower()
    matched = []
    
    for scheme in SCHEMES:
        score = 0
        reasons = []
        
        if scheme["category"].lower() in [c.lower() for c in profile.categories]:
            score += 30
            reasons.append(f"Category '{scheme['category']}' matches")
        
        for kw in scheme.get("keywords", []):
            if kw.lower() in desc:
                score += 15
                reasons.append(f"Matches '{kw}'")
        
        if profile.state and scheme.get("state", "Central") in ["Central", profile.state]:
            score += 10
            if scheme.get("state") == profile.state:
                reasons.append(f"State scheme for {profile.state}")
        
        if any(w in desc for w in ["income", "lakh", "poor", "bpl", "गरीब"]):
            if "income" in scheme.get("eligibility", "").lower():
                score += 15
                reasons.append("Income criteria likely met")
        
        if score >= 25:
            matched.append({
                "id": scheme["id"],
                "name": scheme["name"],
                "nameHi": scheme.get("nameHi", scheme["name"]),
                "category": scheme["category"],
                "matchPercentage": min(score, 98),
                "reasoning": ". ".join(reasons[:3]) + ".",
                "reasoningHi": scheme.get("reasoningHi", ""),
                "citation": scheme.get("citation", ""),
                "benefits": scheme.get("benefits", ""),
                "documents": scheme.get("documents", []),
                "steps": scheme.get("steps", []),
                "deadline": scheme.get("deadline", "Check official website"),
                "link": scheme.get("link", ""),
            })
    
    matched.sort(key=lambda x: x["matchPercentage"], reverse=True)
    conflicts = detect_conflicts(matched, profile.state)

    # Log query to database
    try:
        log_query(
            user_id=None,
            description=profile.description,
            categories=",".join(profile.categories),
            state=profile.state,
            schemes_matched=len(matched[:10]),
            conflicts_found=len(conflicts),
        )
    except Exception:
        pass

    return {"schemes": matched[:10], "conflicts": conflicts}


@app.get("/api/schemes")
def list_schemes(category: Optional[str] = None):
    if category:
        return {"schemes": get_schemes_by_category(category)}
    return {"schemes": SCHEMES}


@app.post("/api/form-fill")
def fill_form(request: FormFillRequest):
    return auto_fill_form(request.scheme_id, request.citizen_data)


@app.get("/api/stats")
def get_stats():
    """Combined stats from schemes data + database."""
    db_stats = db_get_stats()
    return {
        "totalSchemes": len(SCHEMES),
        "categories": {
            "Education": len(get_schemes_by_category("Education")),
            "Employment": len(get_schemes_by_category("Employment")),
            "Health": len(get_schemes_by_category("Health")),
            "Agriculture": len(get_schemes_by_category("Agriculture")),
        },
        "totalQueries": db_stats["total_queries"],
        "totalUsers": db_stats["total_users"],
        "totalSchemesMatched": db_stats["total_schemes_matched"],
        "totalConflicts": db_stats["total_conflicts"],
        "recentQueries": db_stats["recent_queries"],
    }


@app.get("/api/conflicts")
def get_all_conflicts():
    return detect_conflicts(SCHEMES, "")
