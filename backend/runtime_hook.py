# Runtime hook for HedgeX Backend
# This ensures proper initialization when running as an executable

import os
import sys
from pathlib import Path

# Set environment variable to fix OpenSSL 3.0 legacy provider issue
os.environ['CRYPTOGRAPHY_OPENSSL_NO_LEGACY'] = '1'

# Add the current directory to Python path
if getattr(sys, 'frozen', False):
    # Running as compiled executable
    application_path = Path(sys._MEIPASS)
    sys.path.insert(0, str(application_path))
else:
    # Running as script
    application_path = Path(__file__).parent
    sys.path.insert(0, str(application_path))

# Set environment variables for better compatibility
os.environ['PYTHONPATH'] = str(application_path)

# Ensure proper encoding
if sys.platform.startswith('win'):
    import locale
    try:
        locale.setlocale(locale.LC_ALL, 'C.UTF-8')
    except:
        try:
            locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        except:
            pass

# Import required modules to ensure they're available
try:
    import uvicorn
    import fastapi
    import click
    import ctypes
    import sqlite3
    import bcrypt
    import jwt
except ImportError as e:
    print(f"Warning: Could not import module: {e}") 