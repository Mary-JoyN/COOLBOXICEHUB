import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.routes.api import router as api_router
from app.routes.pages import router as pages_router
from app.seed_data import seed_database

STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
ASSETS_DIR = os.path.join(STATIC_DIR, "assets")
UPLOADS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")

os.makedirs(STATIC_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Seed database with accurate catalogue, business terms, FAQs and initial reviews
    seed_database()
    yield


app = FastAPI(
    title="The CoolerBox Ice Hub",
    description="Official web application for The CoolerBox Ice Hub in Ongwediva, Namibia. Gourmet ice, blocks, cups, purified water and event supplies.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(api_router)

# Mount specific directories for assets and uploads
app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# Include HTML page routes
app.include_router(pages_router)

# Mount root static files (for /home-base.css, /premium.css, /calculator.js, etc.)
app.mount("/", StaticFiles(directory=STATIC_DIR, html=False), name="root_static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
