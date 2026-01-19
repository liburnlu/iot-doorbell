import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# IMPORTANT: Allow your frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def dashboard():
    return FileResponse('static/index.html')

@app.get("/images")
def get_doorbell_images(page: int = 1, page_size: int = 12):
    # Calculate offset (e.g., Page 2 starts after 12 images)
    offset = (page - 1) * page_size
    
    # Supabase range is inclusive: (from, to)
    response = supabase.storage.from_('captures').list(
        'events', 
        {
            "limit": page_size,
            "offset": offset,
            "sortBy": {"column": "created_at", "order": "desc"}
        }
    )
    
    images = []
    for file in response:
        if file['name'] == '.emptyFolderPlaceholder': continue
        
        path = f"events/{file['name']}"
        signed_res = supabase.storage.from_('captures').create_signed_url(path, 3600)
        images.append({
            "name": file['name'],
            "url": signed_res['signedURL'],
            "created_at": file['created_at']
        })
    
    return images