import os
import chromadb
import requests
from dotenv import load_dotenv
import json
from typing import List, Dict, Any

# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")
if not HF_TOKEN:
    raise ValueError("Missing HF_TOKEN in environment variables")

# HuggingFace API settings
HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3"

# Connect to ChromaDB
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_collection(name="reddit_embeddings")

def retrieve_context(query: str, n_results: int = 5) -> List[Dict[str, Any]]:
    """
    Retrieve relevant documents from ChromaDB based on the query
    """
    results = collection.query(
        query_texts=[query],
        n_results=n_results
    )
    
    context_docs = []
    
    for i in range(len(results['ids'][0])):
        metadata = results['metadatas'][0][i]
        context_docs.append({
            "id": results['ids'][0][i],
            "title": metadata.get("title", "No title"),
            "body": metadata.get("body", "No content"),
            "subreddit": metadata.get("subreddit", "Unknown"),
            "url": metadata.get("url", ""),
            "score": results['distances'][0][i] if 'distances' in results else None
        })
    
    return context_docs

def format_context_for_prompt(context_docs: List[Dict[str, Any]]) -> str:
    """
    Format retrieved documents as context for the LLM prompt
    """
    context_text = "Here are some relevant Reddit posts to help answer the question:\n\n"
    
    for i, doc in enumerate(context_docs):
        context_text += f"[POST {i+1}] r/{doc['subreddit']} - {doc['title']}\n"
        
        # Truncate very long posts to avoid token limits
        body = doc['body']
        if len(body) > 800:
            body = body[:800] + "... [content truncated]"
        
        context_text += f"{body}\n\n"
        
    return context_text

def generate_answer(query: str, context_text: str) -> str:
    """
    Use HuggingFace API with Mistral-7B-Instruct-v0.3 to generate an answer
    """
    headers = {
        "Authorization": f"Bearer {HF_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Format prompt using Mistral's chat template
    prompt = f"""<s>[INST] You are a helpful assistant that answers questions based on Reddit discussions. 
Use the following Reddit posts as context to answer the user's question.
If the context doesn't contain enough information, just say you don't have enough information.
Always cite which posts you're drawing information from when appropriate.
Answer like according to xyz author ......

User question: {query}

Context from Reddit:
{context_text} [/INST]"""
    
    try:
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={
                "inputs": prompt,
                "parameters": {
                    "max_new_tokens": 512,
                    "temperature": 0.3,
                    "top_p": 0.9,
                    "do_sample": True
                }
            }
        )
        
        response.raise_for_status()  # Raise exception for HTTP errors
        result = response.json()
        
        # Handle different response formats from HF API
        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "").replace(prompt, "")
        elif isinstance(result, dict) and "generated_text" in result:
            return result["generated_text"].replace(prompt, "")
        else:
            print(f"Unexpected response format: {result}")
            return "Error: Unexpected response format from HuggingFace API"
            
    except Exception as e:
        print(f"API error: {str(e)}")
        return f"Error generating response: {str(e)}"

def chat_with_reddit_data():
    """
    Interactive chatbot function that uses Reddit data to answer questions
    """
    print("Reddit-based AI Assistant (type 'exit' to quit)")
    print("------------------------------------------------")
    print("Using mistralai/Mistral-7B-Instruct-v0.3 model")
    print("------------------------------------------------")
    
    while True:
        user_query = input("\nYour question: ")
        
        if user_query.lower() in ["exit", "quit", "bye"]:
            print("Goodbye!")
            break
            
        if not user_query.strip():
            continue
            
        print("\nSearching for relevant Reddit posts...")
        context_docs = retrieve_context(user_query)
        
        if not context_docs:
            print("No relevant Reddit posts found. Please try a different question.")
            continue
            
        print(f"Found {len(context_docs)} relevant posts. Generating answer...")
        
        context_text = format_context_for_prompt(context_docs)
        answer = generate_answer(user_query, context_text)
        
        print("\n" + answer)
        
def answer_question(query: str, n_results: int = 5) -> Dict[str, Any]:
    """
    Function to answer a question using the Reddit RAG system
    Returns both the answer and the retrieved context
    """
    # Retrieve relevant posts
    context_docs = retrieve_context(query, n_results)
    
    if not context_docs:
        return {
            "answer": "No relevant information found in the database.",
            "sources": []
        }
    
    # Format context and generate answer
    context_text = format_context_for_prompt(context_docs)
    answer = generate_answer(query, context_text)
    
    # Format response
    return {
        "answer": answer,
        "sources": [
            {
                "id": doc["id"],
                "title": doc["title"],
                "subreddit": doc["subreddit"],
                "url": doc["url"]
            }
            for doc in context_docs
        ]
    }

# Run the chatbot directly
if __name__ == "__main__":
    chat_with_reddit_data()