import os
import requests
from pymongo import MongoClient
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

load_dotenv(dotenv_path="../.env")

MONGODB_URI = os.getenv("MONGO_DB_URI")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_INDEX = os.getenv("PINECONE_INDEX", "luxe-products")

NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/embeddings"
EMBEDDING_MODEL = "nvidia/nv-embedqa-e5-v5"
EMBEDDING_DIMENSION = 1024


def get_embedding(text: str) -> list:
    response = requests.post(
        NVIDIA_API_URL,
        headers={
            "Authorization": f"Bearer {NVIDIA_API_KEY}",
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        json={
            "input": [text],
            "model": EMBEDDING_MODEL,
            "input_type": "passage",
            "encoding_format": "float",
            "truncate": "END",
        },
    )
    response.raise_for_status()
    return response.json()["data"][0]["embedding"]


def build_product_text(product: dict) -> str:
    parts = [
        product.get("name", ""),
        product.get("category", ""),
        product.get("description", ""),
    ]

    sizes = product.get("sizes", [])
    if sizes:
        parts.append(f"Available sizes: {', '.join(sizes)}")

    shoe_sizes = product.get("shoeSizes", [])
    if shoe_sizes:
        parts.append(f"Available shoe sizes: {', '.join(shoe_sizes)}")

    price = product.get("price")
    if price:
        parts.append(f"Price: ${price}")

    if product.get("isFeatured"):
        parts.append("Featured product. Premium quality.")

    return " ".join(filter(None, parts)).strip()


def main():
    print("Connecting to MongoDB...")
    client = MongoClient(MONGODB_URI)
    db = client["ai-shopping-agent"]
    products_collection = db["products"]
    products = list(products_collection.find({}))
    print(f"Found {len(products)} products in MongoDB")

    print("Initializing Pinecone...")
    pc = Pinecone(api_key=PINECONE_API_KEY)

    existing_indexes = [idx.name for idx in pc.list_indexes()]
    if PINECONE_INDEX not in existing_indexes:
        print(f"Creating Pinecone index '{PINECONE_INDEX}'...")
        pc.create_index(
            name=PINECONE_INDEX,
            dimension=EMBEDDING_DIMENSION,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1"),
        )
        import time
        time.sleep(10)
    else:
        print(f"Index '{PINECONE_INDEX}' already exists")

    index = pc.Index(PINECONE_INDEX)

    vectors = []
    for product in products:
        product_id = str(product["_id"])
        text = build_product_text(product)
        print(f"\nProduct: {product.get('name', product_id)}")
        print(f"Embedding text: {text[:120]}...")
        try:
            embedding = get_embedding(text)
            vectors.append(
                {
                    "id": product_id,
                    "values": embedding,
                    "metadata": {
                        "productId": product_id,
                        "name": product.get("name", ""),
                        "category": product.get("category", ""),
                        "price": float(product.get("price", 0)),
                    },
                }
            )
        except Exception as e:
            print(f"Failed to embed product {product_id}: {e}")

    if vectors:
        batch_size = 50
        for i in range(0, len(vectors), batch_size):
            batch = vectors[i: i + batch_size]
            index.upsert(vectors=batch)
            print(f"\nUpserted batch {i // batch_size + 1} ({len(batch)} vectors)")

    print(f"\nDone! {len(vectors)} products indexed in Pinecone.")
    client.close()


if __name__ == "__main__":
    main()