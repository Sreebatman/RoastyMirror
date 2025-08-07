import os
from flask import Flask, request, jsonify
import cv2
import numpy as np
from deepface import DeepFace
import random
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS

# Enhanced roast generator
ROAST_DB = {
    "happy": [
        "That grin? My circuits are overheating!",
        "Someone's happy... did you find a penny?",
        "Smiling like you won the lottery? You didn't."
    ],
    "sad": [
        "Why so glum? Did your dog leave you too?",
        "That frown belongs in a modern art museum.",
        "Cheer up! Or don't, I'm just a mirror."
    ],
    "angry": [
        "Whoa, who stole your coffee?",
        "Angry? You look like a tomato with a bad haircut.",
        "Rage looks good on you... said no one ever."
    ],
    "surprise": [
        "Surprised? Did you see your own outfit?",
        "Eyes wide open? You must have seen my electricity bill.",
        "Surprise! You still look like that."
    ],
    "fear": [
        "Scared? Don't worry, I won't show your real face.",
        "Is that fear or did you see your hair?",
        "Why so jumpy? I'm just judging you."
    ],
    "disgust": [
        "Disgusted? You should see what I see.",
        "That face? Did you smell yourself?",
        "Did you just taste your own cooking?"
    ],
    "neutral": [
        "Resting mirror face, I see.",
        "Wow, you really woke up and chose 'meh'.",
        "No expression? Did you run out of emotions?"
    ]
}

def generate_roast(emotion, confidence):
    base_roasts = ROAST_DB.get(emotion, ["I'm speechless... rare for me."])
    
    # Confidence-based modifiers
    if confidence > 85:
        base_roasts.append(f"Wow, really committing to that {emotion} face.")
    elif confidence < 40:
        base_roasts.append("Can't tell if that's an expression or gas.")
    
    # Emotion-specific enhancements
    if emotion == "happy" and confidence > 75:
        base_roasts.append("Someone's overcompensating with that smile.")
    elif emotion == "sad" and confidence > 70:
        base_roasts.append("Tears would really complete this look.")
    
    return random.choice(base_roasts)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        # Get image from frontend
        file = request.files['frame'].read()
        nparr = np.frombuffer(file, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Analyze expression
        results = DeepFace.analyze(img, 
                                  actions=['emotion'], 
                                  enforce_detection=False,
                                  detector_backend='opencv')
        
        if len(results) > 0:
            emotion = results[0]['dominant_emotion']
            confidence = results[0]['emotion'][emotion]
            roast = generate_roast(emotion, confidence)
            
            return jsonify({
                "emotion": emotion,
                "roast": roast,
                "confidence": float(confidence)
            })
        else:
            return jsonify({
                "error": "No face detected",
                "roast": "Are you even there? Or just a floating ghost?"
            }), 404
            
    except Exception as e:
        return jsonify({
            "error": str(e),
            "roast": "My circuits are frying... try again later"
        }), 500

@app.route('/')
def health_check():
    return jsonify({"status": "active", "message": "Moody Mirror API is running"})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)