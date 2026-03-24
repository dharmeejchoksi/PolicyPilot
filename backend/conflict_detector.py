"""
PolicyPilot - Conflict Detection Engine
Detects contradicting eligibility criteria between Central and State scheme versions.
"""

# Known conflict pairs — curated for demo and real-world relevance
CONFLICT_PAIRS = [
    {
        "id": "conflict-income-pmfby-gks",
        "type": "eligibility",
        "centralSchemeId": "pmfby",
        "stateSchemeId": "gujarat-kisan",
        "centralScheme": "PMFBY (Central)",
        "stateScheme": "Gujarat Kisan Sahay (State)",
        "field": "Income Limit",
        "centralValue": "₹1,50,000 per annum",
        "stateValue": "₹2,00,000 per annum",
        "centralCitation": "PMFBY Guidelines 2023, Section 2.3(b): 'Annual family income should not exceed ₹1,50,000 for full premium subsidy benefit.'",
        "stateCitation": "Gujarat Kisan Sahay Yojana, Section 4.1: 'Annual household income must be below ₹2,00,000.'",
        "explanation": "The Central PMFBY scheme caps income at ₹1.5 lakh for full premium subsidy while Gujarat's scheme allows up to ₹2 lakh. A farmer earning ₹1.7 lakh qualifies for the state scheme but NOT for the full central premium subsidy. Both are valid — we surface both so you can decide.",
        "explanationHi": "केंद्रीय PMFBY योजना पूर्ण प्रीमियम सब्सिडी के लिए आय ₹1.5 लाख पर सीमित करती है जबकि गुजरात योजना ₹2 लाख तक अनुमति देती है। ₹1.7 लाख कमाने वाला किसान राज्य योजना के लिए पात्र होगा लेकिन पूर्ण केंद्रीय सब्सिडी के लिए नहीं।",
        "applicableStates": ["Gujarat"],
    },
    {
        "id": "conflict-land-pmkisan-gks",
        "type": "eligibility",
        "centralSchemeId": "pm-kisan",
        "stateSchemeId": "gujarat-kisan",
        "centralScheme": "PM-KISAN (Central)",
        "stateScheme": "Gujarat Kisan Sahay (State)",
        "field": "Minimum Land Holding",
        "centralValue": "No minimum — all land-holding farmers eligible",
        "stateValue": "Minimum 1 acre of cultivable land required",
        "centralCitation": "PM-KISAN Guidelines, Section 3.1: 'All land-holding farmer families are eligible irrespective of the size of their land holdings.'",
        "stateCitation": "Gujarat Kisan Sahay Yojana, Section 4.2: 'Minimum holding of 1 acre of cultivable land is required for eligibility.'",
        "explanation": "PM-KISAN has no minimum land requirement — even a farmer with 0.25 acres qualifies. But Gujarat Kisan Sahay requires at least 1 acre. A marginal farmer with 0.5 acres qualifies for PM-KISAN but NOT Gujarat Kisan Sahay.",
        "explanationHi": "पीएम-किसान में कोई न्यूनतम भूमि आवश्यकता नहीं है — 0.25 एकड़ भी पात्र है। लेकिन गुजरात किसान सहाय में कम से कम 1 एकड़ आवश्यक है।",
        "applicableStates": ["Gujarat"],
    },
    {
        "id": "conflict-age-nmmss-state",
        "type": "eligibility",
        "centralSchemeId": "nmmss",
        "stateSchemeId": "state-merit",
        "centralScheme": "NMMSS (Central)",
        "stateScheme": "State Merit Scholarship",
        "field": "Income Ceiling",
        "centralValue": "₹3,50,000 per annum",
        "stateValue": "₹2,50,000 per annum (varies by state)",
        "centralCitation": "DSEL NMMSS Guidelines: 'Parental income from all sources shall not exceed ₹3,50,000 per annum.'",
        "stateCitation": "Various State Merit Notifications: 'State-level merit scholarships often cap family income at ₹2,50,000.'",
        "explanation": "The Central NMMSS allows families earning up to ₹3.5 lakh, but several state merit scholarships cap income at ₹2.5 lakh. A student from a family earning ₹3 lakh qualifies for NMMSS but may be rejected by the state merit scholarship.",
        "explanationHi": "केंद्रीय NMMSS ₹3.5 लाख तक आय वाले परिवारों को अनुमति देता है, लेकिन कई राज्य योग्यता छात्रवृत्तियाँ ₹2.5 लाख पर सीमित हैं।",
        "applicableStates": [],
    },
]


def detect_conflicts(matched_schemes, state):
    """
    Detect conflicts between Central and State scheme eligibility criteria.
    Returns list of conflict objects with both sources cited.
    """
    conflicts = []
    matched_ids = {s["id"] if isinstance(s, dict) else s for s in matched_schemes}

    for conflict in CONFLICT_PAIRS:
        central_id = conflict["centralSchemeId"]
        state_id = conflict["stateSchemeId"]

        # Check if both conflicting schemes are in matched results
        both_matched = central_id in matched_ids and state_id in matched_ids

        # Or if the conflict is relevant to the citizen's state
        state_relevant = not conflict["applicableStates"] or state in conflict["applicableStates"]

        if both_matched or (state_relevant and central_id in matched_ids):
            conflicts.append({
                "id": conflict["id"],
                "type": conflict["type"],
                "centralScheme": conflict["centralScheme"],
                "stateScheme": conflict["stateScheme"],
                "field": conflict["field"],
                "centralValue": conflict["centralValue"],
                "stateValue": conflict["stateValue"],
                "centralCitation": conflict["centralCitation"],
                "stateCitation": conflict["stateCitation"],
                "explanation": conflict["explanation"],
                "explanationHi": conflict["explanationHi"],
            })

    return conflicts
