"""
AI Post Classifier (Google Gemini)
===================================
Uses Google's Gemini AI to analyze social media posts and determine:
1. Is it about tourism? (YES/NO)
2. Which place is mentioned?
3. What's the sentiment? (positive/negative/neutral)
"""

import os
import sys
import json
import random

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from config import GEMINI_API_KEY, USE_DEMO_DATA
except ImportError:
    print("⚠️ config.py not found. Using demo mode.")
    GEMINI_API_KEY = ""
    USE_DEMO_DATA = True


class PostClassifier:
    """
    Uses Google Gemini AI to classify social media posts.
    Falls back to simple keyword matching if no API key is available.
    """
    
    def __init__(self, places_list=None):
        """
        Args:
            places_list: List of known tourist place names (from your database)
        """
        self.gemini_client = None
        self.places_list = places_list or []
        
        # ✅ Only initialize Gemini if we have a key
        if GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=GEMINI_API_KEY)
                
                # ✅ NEW: Prefer Flash models (they have higher free limits)
                print("🔍 Checking available Gemini models...")
                try:
                    models = genai.list_models()
                    available_models = [m.name for m in models if 'generateContent' in m.supported_generation_methods]
                    print(f"📋 Available models: {available_models[:5]}")
                    
                    # ✅ PRIORITY: Use Flash models first (they have higher quotas)
                    flash_models = [m for m in available_models if 'flash' in m.lower()]
                    pro_models = [m for m in available_models if 'pro' in m.lower() and 'flash' not in m.lower()]
                    
                    model_to_use = None
                    
                    if flash_models:
                        model_to_use = flash_models[0]  # Use first Flash model
                        print(f"✅ Using Flash model (high quota): {model_to_use}")
                    elif pro_models:
                        model_to_use = pro_models[0]
                        print(f"⚠️ Using Pro model (low quota): {model_to_use}")
                    elif available_models:
                        model_to_use = available_models[0]
                        print(f"⚠️ Using first available model: {model_to_use}")
                    
                    if model_to_use:
                        model_name = model_to_use.replace('models/', '')
                        self.gemini_client = genai.GenerativeModel(model_name)
                        print(f"✅ Google Gemini AI connected successfully!")
                    else:
                        raise Exception("No models support text generation")
                        
                except Exception as list_error:
                    print(f"⚠️ Could not list models: {list_error}")
                    # Fallback: try gemini-flash directly
                    try:
                        self.gemini_client = genai.GenerativeModel('gemini-1.5-flash')
                        print("✅ Google Gemini AI connected using: gemini-1.5-flash")
                    except:
                        self.gemini_client = genai.GenerativeModel('gemini-pro')
                        print("✅ Google Gemini AI connected using: gemini-pro")
                    
            except Exception as e:
                print(f"⚠️ Gemini AI failed to initialize: {e}")
                self.gemini_client = None
        else:
            print("⚠️ No Gemini API key found. Using simple keyword matching.")
    
    def classify_post(self, post_content: str):
        """
        Analyze a social media post to determine if it's about tourism.
        
        Args:
            post_content: The text content of the post
            
        Returns:
            Dictionary with classification results:
            {
                "is_tourism": bool,
                "place_name": str,
                "sentiment": "positive" | "negative" | "neutral",
                "confidence": float (0-1)
            }
        """
        if not self.gemini_client:
            print("⚠️ Gemini not available. Using keyword-based classification.")
            return self._classify_with_keywords(post_content)
        
        try:
            # Build the AI prompt
            prompt = self._build_classification_prompt(post_content)
            
            # Call Gemini API with generation config for JSON
            generation_config = {
                "temperature": 0.2,
                "top_p": 0.8,
                "top_k": 40,
                "max_output_tokens": 500,
            }
            
            response = self.gemini_client.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # ✅ DEBUG: Print raw response
            print(f"🔍 Raw Gemini response: '{response.text}'")
            
            # ✅ IMPROVED: Extract JSON from response
            response_text = response.text.strip()
            
            if not response_text:
                raise ValueError("Empty response from Gemini")
            
            # Try to find JSON object using regex
            import re
            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text)
            
            if json_match:
                response_text = json_match.group(0)
                print(f"✅ Extracted JSON: {response_text}")
            else:
                # If no JSON found, try removing markdown
                lines = response_text.split('\n')
                # Remove lines that are just markdown
                lines = [line for line in lines if not line.startswith('```') and line.strip() != '']
                
                # Join back the lines
                response_text = '\n'.join(lines)
                
                # Try parsing again
                try:
                    result = json.loads(response_text)
                    print(f"✅ AI Classification: {result}")
                    return result
                except json.JSONDecodeError as json_error:
                    print(f"❌ JSON parsing error: {json_error}")
                    print(f"🔍 Response text: '{response_text}'")
                    raise
            
            # Parse the response
            result = json.loads(response_text)
            
            print(f"✅ AI Classification: {result}")
            return result
            
        except Exception as e:
            print(f"❌ Gemini API error: {e}")
            print("⚠️ Falling back to keyword matching.")
            return self._classify_with_keywords(post_content)
    
    def _build_classification_prompt(self, post_content: str):
        """
        Build the prompt for Gemini AI.
        
        This is where the magic happens - we tell the AI exactly what to do!
        """
        places_str = ', '.join(self.places_list) if self.places_list else "tourist places in Kedah, Malaysia"
        
        prompt = f"""
You are an expert tourism analyst for Kedah, Malaysia.

Your task: Analyze this social media post and determine if it's about tourism.

Known tourist places: {places_str}

Post content:
"{post_content}"

Respond ONLY with a JSON object in this exact format:
{{
  "is_tourism": true/false,
  "place_name": "exact name of the place mentioned (or null if not about tourism)",
  "sentiment": "positive/negative/neutral",
  "confidence": 0.0-1.0 (how confident you are)
}}

Rules:
- is_tourism = true ONLY if the post is clearly about visiting, experiencing, or recommending a tourist location
- place_name must exactly match one of the known places, or be null
- sentiment should reflect the overall tone of the post
- confidence is how sure you are (1.0 = very sure, 0.5 = not sure)

Example 1:
Post: "Just visited Langkawi! The beaches are amazing! 🏝️"
Response: {{"is_tourism": true, "place_name": "Langkawi", "sentiment": "positive", "confidence": 0.95}}

Example 2:
Post: "I love Malaysia!"
Response: {{"is_tourism": false, "place_name": null, "sentiment": "positive", "confidence": 0.8}}

Now analyze the post above and respond ONLY with the JSON object.
"""
        return prompt
    
    def _classify_with_keywords(self, post_content: str):
        """
        Simple keyword-based classification (fallback when no AI available).
        This is not as smart as AI, but it works!
        """
        content_lower = post_content.lower()
        
        # Check if any known place is mentioned
        mentioned_place = None
        for place in self.places_list:
            if place.lower() in content_lower:
                mentioned_place = place
                break
        
        # Simple sentiment analysis based on keywords
        positive_words = ['amazing', 'beautiful', 'love', 'best', 'awesome', 'great', 'wonderful']
        negative_words = ['bad', 'terrible', 'awful', 'worst', 'disappointing', 'poor']
        
        positive_count = sum(1 for word in positive_words if word in content_lower)
        negative_count = sum(1 for word in negative_words if word in content_lower)
        
        if positive_count > negative_count:
            sentiment = 'positive'
        elif negative_count > positive_count:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
        
        # Determine if it's about tourism
        tourism_keywords = ['visit', 'trip', 'travel', 'vacation', 'holiday', 'beach', 'hotel', 'resort']
        is_tourism = any(keyword in content_lower for keyword in tourism_keywords) or mentioned_place is not None
        
        return {
            'is_tourism': is_tourism,
            'place_name': mentioned_place,
            'sentiment': sentiment,
            'confidence': 0.6 if is_tourism else 0.8  # Lower confidence for simple matching
        }


# Test the classifier
if __name__ == "__main__":
    print("🧪 Testing AI Post Classifier...\n")
    
    # Sample places (you would get these from your database)
    sample_places = ["Langkawi", "Alor Setar", "Kedah", "Pantai Cenang"]
    
    classifier = PostClassifier(places_list=sample_places)
    
    # Test posts
    test_posts = [
        "Just visited Langkawi! The beaches are incredible! 🏝️😍",
        "I love Malaysia! #travel",
        "Worst hotel experience in Alor Setar 😡",
        "What's the weather like today?",
    ]
    
    for post in test_posts:
        print(f"\n📝 Post: {post}")
        result = classifier.classify_post(post)
        print(f"   Result: {json.dumps(result, indent=2)}")
