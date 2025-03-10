# Reddify - Reddit Post Visualizer

## Overview

Reddify is a Reddit post visualizer designed to analyze and display Reddit posts from a dataset provided by SimPPL. It integrates machine learning models for sentiment analysis, subreddit prediction, and query-based information retrieval. The project serves as a demonstration of AI-powered content analysis and visualization.

## Features

### 🔹 **Reddit Post Visualization**
- Displays Reddit posts in an interactive UI built with **Next.js**, **Tailwind CSS**, and **shadcn/ui**.
- Uses **Chakra UI** components for a sleek and responsive design.

### 🔹 **AI-Powered Query System**
- Integrates **Mistral v3** and `sentence-transformers/all-MiniLM-L6-v2` from Hugging Face.
- Implements **Retrieval-Augmented Generation (RAG)** by storing the dataset in **ChromaDB** for efficient vector-based search.
- Allows users to ask queries about the dataset and receive AI-generated responses.

### 🔹 **Sentiment Analysis**
- Uses a **Keras LSTM Sequential Model** to predict sentiment (positive, negative, neutral).
- Trained on a **1.6 million-row dataset**.
- Model implementation: [Sentiment Analysis Colab](https://colab.research.google.com/drive/1Wqnykr7TNPQjeYZbzRRcuqGt8dbiXtUh?usp=drive_link).

### 🔹 **Subreddit Prediction**
- Uses **TF-IDF Vectorizer** and **Logistic Regression** to predict subreddit categories.
- Works even when subreddit labels are missing.
- Model implementation: [Subreddit Predictor Colab](https://colab.research.google.com/drive/1mENz41DPgmBWzghppvJPutx8mcC3w5SZ?usp=sharing).

### 🔹 **Planned Features**
- **Create Post Feature:** Allows users to submit new posts, which will be analyzed and assigned a predicted subreddit.

---

## Installation & Setup

### Prerequisites
- **Node.js** (>= 16.x)
- **Python 3.x**
- **ChromaDB**
- **Hugging Face API key** (for transformer models)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/reddify.git
   cd reddify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file and add:
   ```
   NEXT_PUBLIC_HF_API_KEY=your_huggingface_api_key
   CHROMADB_PATH=./data/chroma
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Start the backend**
   ```bash
   python backend/server.py
   ```

---

## Technologies Used

- **Frontend:** Next.js, Tailwind CSS, shadcn/ui
- **Backend:** Python, Flask/FastAPI
- **Machine Learning:** TensorFlow, Keras, Scikit-learn, Hugging Face Transformers
- **Database:** ChromaDB (Vector Database)
- **Deployment:** Render (for backend)

---

## Contributing

Feel free to fork the project, submit issues, or create pull requests.

---

## License

This project is open-source and available under the **MIT License**.