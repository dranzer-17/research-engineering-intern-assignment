from flask import Flask, request, jsonify
import joblib
from flask_cors import CORS
import re
import string
import pickle
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import load_model
from mistralapi import answer_question

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

#############################
# Load Reddit Classifier Model
#############################
reddit_model_path = "models/reddit_classifier.pkl"
try:
    reddit_model = joblib.load(reddit_model_path)
    print("✅ Reddit classifier model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading reddit classifier model: {e}")
    reddit_model = None

# Mapping for subreddit labels based on your Colab output
SUBREDDIT_MAPPING = {
    0: "Anarchism",
    1: "Conservative",
    2: "Liberal",
    3: "PoliticalDiscussion",
    4: "Republican",
    5: "democrats",
    6: "neoliberal",
    7: "politics",
    8: "socialism",
    9: "worldpolitics"
}

#############################
# Load Sentiment Analysis Model & Tokenizer
#############################
try:
    sentiment_model = load_model("models/sentiment_model.h5", custom_objects={"mse": tf.keras.metrics.MeanSquaredError()})
    print("✅ Sentiment model loaded successfully!")
except Exception as e:
    print(f"❌ Error loading sentiment model: {e}")
    sentiment_model = None

try:
    with open("models/tokenizer.pkl", "rb") as f:
        tokenizer = pickle.load(f)
    print("✅ Tokenizer loaded successfully!")
except Exception as e:
    print(f"❌ Error loading tokenizer: {e}")
    tokenizer = None

#############################
# Text Preprocessing Function
#############################
def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)
    text = re.sub(r"[^\w\s]", "", text)  # Remove punctuation
    text = re.sub(r"\d+", "", text)      # Remove numbers
    return text

#############################
# Sentiment Prediction Function
#############################
def predict_sentiment(text):
    if tokenizer is None or sentiment_model is None:
        return "Unknown"
    text = clean_text(text)
    sequence = tokenizer.texts_to_sequences([text])
    padded = pad_sequences(sequence, maxlen=50, padding='post', truncating='post')
    sentiment_score = sentiment_model.predict(padded)[0][0]
    if sentiment_score > 0.3:
        return "Positive"
    elif sentiment_score < -0.3:
        return "Negative"
    else:
        return "Neutral"

#############################
# Flask Endpoints
#############################
@app.route("/")
def home():
    return "Welcome to the Reddit Post Classifier API! 🚀"

@app.route("/predict", methods=["POST"])
def predict():
    if reddit_model is None:
        return jsonify({"error": "Reddit model not loaded"}), 500

    data = request.get_json()
    if "post_title" not in data:
        return jsonify({"error": "Missing 'post_title' field"}), 400

    post_title = data["post_title"]
    try:
        prediction = reddit_model.predict([post_title])
        pred_index = prediction[0]
        if hasattr(pred_index, "item"):
            pred_index = int(pred_index.item())
        predicted_label = SUBREDDIT_MAPPING.get(pred_index, str(pred_index))
        return jsonify({
            "post_title": post_title,
            "predicted_subreddit": predicted_label
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/predict-sentiment", methods=["POST"])
def predict_sentiment_endpoint():
    data = request.get_json()
    if "post_title" not in data:
        return jsonify({"error": "Missing 'post_title' field"}), 400

    post_title = data["post_title"]
    try:
        sentiment = predict_sentiment(post_title)
        return jsonify({
            "post_title": post_title,
            "sentiment": sentiment
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "Missing query parameter"}), 400
    
    query = data['query']
    n_results = data.get('n_results', 5)
    
    # Use the existing answer_question function from mistralapi.py
    response = answer_question(query, n_results)
    
    return jsonify(response)

if __name__ == "__main__":
    app.run(debug=True)
