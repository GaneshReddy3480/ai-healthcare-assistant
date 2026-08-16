import os
import logging
from typing import Dict, Any, List
from ..config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Could not initialize Google GenAI Python client: {e}")

    def generate_health_response(self, message: str, medicine_context: str = None, history: List[dict] = None) -> Dict[str, Any]:
        """
        Generates safe, structured, educational health responses with strict medical safety guidelines.
        """
        lower = message.lower()
        is_emergency = any(kw in lower for kw in [
            'chest pain', 'heart attack', 'cannot breathe', 'severe bleeding', 'unconscious', 'anaphylaxis', 'poison', 'overdose'
        ])

        if is_emergency:
            return {
                "text": """⚠️ **EMERGENCY MEDICAL WARNING**\n\nYour symptoms indicate a potentially life-threatening emergency.\n\n**Immediate Actions:**\n1. **Call emergency services immediately** (108 / 112 / 911).\n2. **Visit the nearest hospital emergency room**.\n3. Do not attempt self-medication.\n\n*Notice: MediFind AI is an educational tool and does not provide emergency medical care.*""",
                "is_emergency": True,
                "suggested_questions": ["Emergency hospital finder", "First aid guidelines"]
            }

        if self.client:
            try:
                system_instruction = (
                    "You are MediFind AI, an empathetic, safe, and professional healthcare assistant for a university minor project. "
                    "Provide clear, educational explanations of medications, dosages, typical precautions, and wellness. "
                    "NEVER diagnose patients, NEVER alter prescriptions, NEVER replace doctors. "
                    "Keep answers structured with bullet points."
                )
                
                prompt = f"User Question: {message}"
                if medicine_context:
                    prompt += f"\nContext: User is inquiring about {medicine_context}"

                response = self.client.models.generate_content(
                    model="gemini-3.7-flash",
                    contents=prompt,
                    config={
                        "system_instruction": system_instruction,
                        "temperature": 0.5
                    }
                )
                return {
                    "text": response.text,
                    "is_emergency": False,
                    "suggested_questions": [
                        "What are common precautions for this medication?",
                        "Should this be taken before or after meals?",
                        "What questions should I ask my doctor?"
                    ]
                }
            except Exception as e:
                logger.error(f"Gemini API error: {e}")

        # Fallback educational response
        return {
            "text": f"**MediFind Health Guide:**\n\nRegarding your query on '{message}':\n\n"
                    "- **Usage:** Medications should strictly be taken under guidance of a licensed healthcare provider.\n"
                    "- **Precautions:** Always verify dosage, expiry date, and potential interactions with food or other drugs.\n"
                    "- **Availability:** You can check real-time stock at verified nearby pharmacies using the MediFind locator.\n\n"
                    "*Notice: AI-generated information is for general educational purposes and is not a substitute for advice from a qualified healthcare professional.*",
            "is_emergency": False,
            "suggested_questions": [
                "What are common precautions for this medication?",
                "Can this medicine be taken with food or milk?",
                "What should I ask my pharmacist about this prescription?"
            ]
        }

gemini_service = GeminiService()
