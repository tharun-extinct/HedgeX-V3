# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from pathlib import Path

# Get required DLL paths from Anaconda installation
anaconda_path = Path(os.path.expanduser("~")) / "anaconda3"
dll_path = anaconda_path / "Library" / "bin"
dlls_path = anaconda_path / "DLLs"

dll_binaries = []

# Add all DLLs from Anaconda Library/bin to the root
for dll in dll_path.glob("*.dll"):
    dll_binaries.append((str(dll), "."))

# Add all Python extensions from DLLs to the root
for pyd in dlls_path.glob("*.pyd"):
    dll_binaries.append((str(pyd), "."))

# Add python312.dll if it exists
python_dll = anaconda_path / "python312.dll"
if python_dll.exists():
    dll_binaries.append((str(python_dll), "."))

# Combine all binaries
binaries = dll_binaries

block_cipher = None

a = Analysis(
    ['app/main.py'],
    pathex=['.'],  # Add current directory to Python path
    binaries=binaries,  # Include all required DLLs
    datas=[],    hiddenimports=[
        'uvicorn.logging', 'uvicorn.loops', 'uvicorn.loops.auto',
        'uvicorn.protocols', 'uvicorn.protocols.http', 'uvicorn.protocols.http.auto',
        'uvicorn.protocols.websockets', 'uvicorn.protocols.websockets.auto',
        'uvicorn.lifespan', 'uvicorn.lifespan.on',
        'sqlite3', '_sqlite3', 'jwt',
        'cryptography', 'cryptography.hazmat', 'cryptography.hazmat.bindings',
        'cryptography.hazmat.bindings.openssl', 'cryptography.hazmat.bindings.openssl.binding'
    ],hookspath=['hooks'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
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
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)
