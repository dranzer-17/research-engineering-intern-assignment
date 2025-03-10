import os
import json
import chromadb
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

# Load .env variables
from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

# Check if HF_TOKEN is loaded
hf_token = os.getenv("HF_TOKEN")
print(f"HF_TOKEN: {hf_token}")  # This should print your token (or None if not found)

# When initializing the model, pass the token
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2', use_auth_token=hf_token)

# Load Reddit dataset
file_path = r"C:\Users\shahk\reddify\public\data\simPPL_dataset.jsonl"
print(f"Loading dataset from: {file_path}")

reddit_posts = []
try:
    with open(file_path, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if line.strip():  # Skip empty lines
                try:
                    post = json.loads(line.strip())
                    reddit_posts.append(post)
                    if i % 1000 == 0:
                        print(f"Loaded {i} posts...")
                except json.JSONDecodeError as e:
                    print(f"Warning: Could not parse line {i+1}: {e}")
                    continue
except Exception as e:
    print(f"Error reading dataset: {e}")

print(f"Loaded {len(reddit_posts)} posts from dataset")

# Initialize ChromaDB (Persistent Storage)
chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="reddit_embeddings")

# Process and store embeddings
success_count = 0
skipped_count = 0

for i, post in enumerate(reddit_posts):
    # Extract post data - Reddit posts have a nested structure
    post_data = post.get("data", post)  # Use "data" field if available, otherwise use the post itself
    
    # Extract post ID
    post_id = post_data.get("id", "")
    if not post_id:
        post_id = post_data.get("name", "")  # Try using "name" which might be in format "t3_1is5wgo"
        if post_id and post_id.startswith("t3_"):
            post_id = post_id[3:]  # Extract just the ID part
    
    # If still no ID, generate one
    if not post_id:
        import uuid
        post_id = str(uuid.uuid4())
    
    # Extract title
    title = post_data.get("title", "")
    
    # Extract body text - could be in "selftext" or "body" field
    body = post_data.get("selftext", post_data.get("body", ""))
    
    # Combine for the full text to embed
    text = f"{title} {body}".strip()
    
    # Skip posts with insufficient content
    if len(text) < 10:  # Skip very short or empty posts
        skipped_count += 1
        if skipped_count <= 5:
            print(f"Skipping post {post_id} - insufficient content (length: {len(text)})")
        continue
    
    # Get URL
    url = post_data.get("url", post_data.get("permalink", ""))
    # Make sure Reddit URLs are absolute
    if url and url.startswith("/r/"):
        url = f"https://www.reddit.com{url}"
    
    # Get subreddit info
    subreddit = post_data.get("subreddit", "")
    author = post_data.get("author", "")
    created_utc = post_data.get("created_utc", "")
    
    try:
        # Generate embeddings
        embedding = model.encode(text).tolist()
        
        # Store in ChromaDB with enriched metadata
        collection.add(
            ids=[post_id],
            embeddings=[embedding],
            metadatas=[{
                "title": title,
                "body": body,
                "url": url,
                "subreddit": subreddit,
                "author": author,
                "created_utc": created_utc,
                "source": "reddit"
            }]
        )
        
        success_count += 1
        if success_count % 100 == 0:
            print(f"Successfully processed {success_count} posts")
            
    except Exception as e:
        print(f"Error processing post {post_id}: {e}")

print(f"\nSummary:")
print(f"✅ Successfully embedded {success_count} posts")
print(f"⚠️ Skipped {skipped_count} posts with insufficient content")
print(f"Total posts processed: {len(reddit_posts)}")

if success_count > 0:
    print("✅ Embeddings stored successfully in ChromaDB!")
else:
    print("❌ No embeddings were stored. Please check your dataset structure.")