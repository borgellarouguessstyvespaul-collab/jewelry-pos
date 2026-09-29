"""
Jewelry POS - Main Application Entry Point
FastAPI application with CORS, routing, and middleware
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api import auth, users, categories, products, sales, stock, customers, reports, audit, archives

from app.core.init_db import init_db

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Jewelry POS API",
    description="Point of Sale system for jewelry store",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.on_event("startup")
def on_startup():
    init_db()


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$|^https:\/\/.*\.onrender\.com$|^http:\/\/localhost(:\d+)?$|^http:\/\/127\.0\.0\.1(:\d+)?$",
    allow_origins=[
        "*",
        "https://jewelry-pos-nine.vercel.app",
        "https://jewelry-pos-740f.onrender.com",
        "https://jewelry-pos-sfji.onrender.com",
        "https://jewelry-pos-six.vercel.app",
        "https://jewelry-pos-tau.vercel.app",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(users.router,      prefix="/api/users",      tags=["Users"])
app.include_router(categories.router, prefix="/api/categories", tags=["Categories"])
app.include_router(products.router,   prefix="/api/products",   tags=["Products"])
app.include_router(sales.router,      prefix="/api/sales",      tags=["Sales"])
app.include_router(stock.router,      prefix="/api/stock",      tags=["Stock"])
app.include_router(customers.router,  prefix="/api/customers",  tags=["Customers"])
app.include_router(reports.router,    prefix="/api/reports",    tags=["Reports"])
app.include_router(audit.router,      prefix="/api/audit",      tags=["Audit"])
app.include_router(archives.router,   prefix="/api/archives",   tags=["Archives"])



@app.get("/", tags=["Health"])
def root():
    return {"message": "Jewelry POS API is running", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok"}
