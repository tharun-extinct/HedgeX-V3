from fastapi.middleware.cors import CORSMiddleware

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["chrome-extension://*", "edge-extension://*"],  # Allow extension URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
