import os
from fastapi import FastAPI, Request , HTTPException , Depends
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


def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    token = auth_header.split(" ")[1]
    try:
        # Ask Supabase: "Is this token valid?"
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid session")


app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def read_root():
    return FileResponse("static/login.html")

@app.get("/dashboard")
async def dashboard():
    return FileResponse('static/index.html')

@app.get('/dashboard/create-admin')
async def register():
    return FileResponse('static/admin-create.html')

@app.get('/login')
async def login():
    return FileResponse('static/login.html')

@app.post("/dashboard/create-admin")
async def create_new_user(request: Request):
    data = await request.json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    try:
        response = supabase.auth.admin.create_user({
            "user_metadata": { "name": name },
            "email": email,
            "password": password,
            "email_confirm": True  # Auto-confirms so they don't need to check email
        })
        return {"status": "success" , "user" : email}
    except Exception as e:
        print(f"Admin Error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/images")
def get_doorbell_images(page: int = 1, page_size: int = 12, user = Depends(get_current_user)):
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