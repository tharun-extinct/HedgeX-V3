# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from pathlib import Path
import site

DIST_PATH = 'dist'

# Get Python installation paths - works with standard venv instead of Anaconda
python_path = Path(sys.executable).parent
site_packages = Path(site.getsitepackages()[0])
dll_dir = python_path  # DLLs usually in the same directory as python.exe in standard venv

# Use system DLLs for Windows - more reliable than Anaconda paths
system_dll_dir = Path(os.environ.get('SystemRoot', 'C:\\Windows')) / 'System32'

dll_paths = {
    # System DLLs
    'vcruntime140.dll': system_dll_dir / 'vcruntime140.dll',
    'msvcp140.dll': system_dll_dir / 'msvcp140.dll',
    'ucrtbase.dll': system_dll_dir / 'ucrtbase.dll',
    
    # Python DLLs
    'sqlite3.dll': dll_dir / 'sqlite3.dll',
    'libssl-3.dll': dll_dir / 'libssl-3.dll',
    'libcrypto-3.dll': dll_dir / 'libcrypto-3.dll',
    'libffi-8.dll': dll_dir / 'libffi-8.dll',
    'zlib.dll': dll_dir / 'zlib.dll',
    '_ctypes.pyd': dll_dir / 'lib/site-packages/_ctypes.pyd',
    'libexpat.dll': dll_dir / 'libexpat.dll',
    'libbz2.dll': dll_dir / 'libbz2.dll',
    'liblzma.dll': dll_dir / 'liblzma.dll'
}

# Convert paths to strings and create binaries list
binaries = [(str(path), '.') for path in dll_paths.values() if path.exists()]

block_cipher = None

a = Analysis(
    ['app/main.py'],
    pathex=['.'],  # Add current directory to Python path
    binaries=binaries,  # Include all required DLLs
    datas=[],      
    hiddenimports=[
        # Uvicorn imports
        'uvicorn.logging', 'uvicorn.loops.auto', 'uvicorn.loops.asyncio',
        'uvicorn.protocols.http.auto', 'uvicorn.protocols.http.h11_impl',
        'uvicorn.protocols.http.httptools_impl', 'uvicorn.lifespan.on',
        'uvicorn.lifespan.off', 'uvicorn.config', 'uvicorn.main',
        
        # FastAPI imports
        'fastapi', 'fastapi.middleware.cors', 'fastapi.responses',
        'fastapi.routing', 'fastapi.dependencies', 'fastapi.exceptions',
        
        # SQL and database
        'sqlite3', '_sqlite3', 'jwt', 'bcrypt',
        
        # Cryptography and security
        'cryptography.hazmat.bindings.openssl.binding',
        'cryptography.hazmat.primitives', 'cryptography.hazmat.backends',
        
        # Click (used by uvicorn)
        'click', 'click.core', 'click.types', 'click._compat', 'click._winconsole',
        
        # Ctypes and system modules
        'ctypes', 'ctypes.util', 'ctypes.wintypes', 'ctypes.macholib',
        '_ctypes', '_ctypes_test',
        
        # Additional modules that might be needed
        'pydantic', 'pydantic.main', 'pydantic.fields', 'pydantic.validators',
        'python_jose', 'python_jose.jwt', 'python_jose.jwe', 'python_jose.jwk',
        'aiofiles', 'python_multipart',
        
        # Route modules
        'app.routes.auth', 'app.routes.trading', 'app.routes.health',
        'app.cors_config'
    ],
    excludes=[
        'matplotlib', 'notebook', 'jupyter', 'scipy', 'PyQt5', 'Pillow', 'tkinter',
        'pandas.tests', 'numpy.tests', 'test', 'tests', 'IPython', 'lib2to3',
        'pygments', 'docutils', 'sphinx', 'pytest', 'mypy', 'pandas.io.formats.style', 
        'pandas.io.excel._xlsxwriter', 'pandas.io.excel._openpyxl'
    ],
    hookspath=['hooks'],
    hooksconfig={},
    runtime_hooks=['runtime_hook.py'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='HedgeX-Backend',
    distpath=DIST_PATH,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,  # Set to False on Windows
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
