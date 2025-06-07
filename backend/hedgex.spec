# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from pathlib import Path

# Get required DLL paths from Anaconda installation
anaconda_path = Path(os.path.expanduser("~")) / "anaconda3"
dll_paths = {
    'sqlite3.dll': anaconda_path / "Library" / "bin" / "sqlite3.dll",
    'libcrypto-3.dll': anaconda_path / "Library" / "bin" / "libcrypto-3.dll",
    'libssl-3.dll': anaconda_path / "Library" / "bin" / "libssl-3.dll",
    'libffi-8.dll': anaconda_path / "Library" / "bin" / "libffi-8.dll",
    'zlib.dll': anaconda_path / "Library" / "bin" / "zlib.dll",
    '_ctypes.pyd': anaconda_path / "DLLs" / "_ctypes.pyd",
    'libexpat.dll': anaconda_path / "Library" / "bin" / "libexpat.dll",
    'libbz2.dll': anaconda_path / "Library" / "bin" / "libbz2.dll",
    'liblzma.dll': anaconda_path / "Library" / "bin" / "liblzma.dll",
    'api-ms-win-core-path-l1-1-0.dll': anaconda_path / "Library" / "bin" / "api-ms-win-core-path-l1-1-0.dll"
}

# Convert paths to strings and create binaries list
binaries = [(str(path), '.') for path in dll_paths.values() if path.exists()]

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
