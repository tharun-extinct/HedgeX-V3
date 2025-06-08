# HedgeX-V3 Optimized Build Script
# Creates a smaller, more efficient executable for the FastAPI backend
# Author: Generated for HedgeX-V3 Project
# Date: June 2025

param(
    [string]$BuildType = "release",
    [switch]$SkipDependencies,
    [switch]$Verbose
)

# Set error handling
$ErrorActionPreference = "Stop"

# Color output functions
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "===> $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✓ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠ $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "✗ $Message" "Red"
}

# Build configuration
$OUTPUT_DIR = if ($BuildType -eq "dev") { "dist-dev" } else { "release" }
$SPEC_FILE = "hedgex-optimized.spec"

Write-ColorOutput "HedgeX-V3 Backend Build Script (Optimized)" "Magenta"
Write-ColorOutput "Build Type: $BuildType" "Gray"
Write-ColorOutput "Output Directory: $OUTPUT_DIR" "Gray"
Write-ColorOutput "" "White"

# Step 1: Environment Validation
Write-Step "Validating build environment"

# Check if we're in the correct directory
if (-not (Test-Path "app\main.py")) {
    Write-Error "Error: This script must be run from the backend directory"
    Write-Host "Current directory: $(Get-Location)"
    exit 1
}

# Check Python virtual environment
$venvPath = ".\venv\Scripts\python.exe"
if (-not (Test-Path $venvPath)) {
    Write-Error "Error: Python virtual environment not found at $venvPath"
    Write-Host "Please ensure your virtual environment is set up correctly"
    exit 1
}

Write-Success "Environment validation completed"

# Step 2: Clean previous builds
Write-Step "Cleaning previous builds"

$dirsToClean = @("dist", "build", $OUTPUT_DIR, "dist-dev")
foreach ($dir in $dirsToClean) {
    if (Test-Path $dir) {
        Remove-Item -Path "$dir\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "  Cleaned: $dir"
    }
}

Write-Success "Previous builds cleaned"

# Step 3: Setup build directories
Write-Step "Setting up build directories"

$requiredDirs = @("hooks", $OUTPUT_DIR)
foreach ($dir in $requiredDirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    Write-Host "  Created: $dir"
}

Write-Success "Build directories ready"

# Step 4: Activate virtual environment and verify dependencies
Write-Step "Activating virtual environment"

try {
    # Activate virtual environment
    & .\venv\Scripts\Activate.ps1
    Write-Success "Virtual environment activated"
    
    # Verify Python version
    $pythonVersion = & python --version 2>&1
    Write-Host "  Python version: $pythonVersion"
    
    # Install/upgrade dependencies if not skipped
    if (-not $SkipDependencies) {
        Write-Step "Installing/updating dependencies"
        & python -m pip install --upgrade pip --quiet
        & python -m pip install -r requirements.txt --quiet
        & python -m pip install pyinstaller --quiet
        Write-Success "Dependencies updated"
    }
    
} catch {
    Write-Error "Error setting up Python environment: $_"
    exit 1
}

# Step 5: Create optimized PyInstaller spec file
Write-Step "Creating optimized PyInstaller specification"

$specContent = @"
# -*- mode: python ; coding: utf-8 -*-
# HedgeX-V3 Optimized PyInstaller Specification
# Generated automatically - do not modify manually

import os
import sys
from pathlib import Path

# Build configuration
OUTPUT_DIR = '$OUTPUT_DIR'
APP_NAME = 'HedgeX-Backend'

# Optimization settings
block_cipher = None

# Analysis configuration
a = Analysis(
    ['app/main.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        # Include only essential data files
        ('app', 'app'),
    ],
    hiddenimports=[
        # Core FastAPI and Uvicorn imports
        'uvicorn.logging',
        'uvicorn.loops.auto',
        'uvicorn.protocols.http.auto',
        'uvicorn.lifespan.on',
        
        # Database and ORM
        'sqlite3',
        '_sqlite3',
        'sqlalchemy.dialects.sqlite',
        
        # Authentication and security
        'jose.backends.cryptography_backend',
        'passlib.handlers.bcrypt',
        'cryptography.hazmat.bindings.openssl.binding',
        
        # Core Python modules that might be missed
        'email.mime.multipart',
        'email.mime.text',
        'json',
        'datetime',
    ],
    hookspath=['hooks'],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[
        # Development and testing tools
        'pytest', 'unittest', 'doctest', 'pdb', 'pydoc',
        'test', 'tests', '_pytest',
        
        # Documentation and help
        'pydoc_data', 'lib2to3', 'distutils',
        
        # GUI frameworks (not needed for API)
        'tkinter', 'PyQt5', 'PyQt6', 'PySide2', 'PySide6',
        'matplotlib', 'plotly', 'seaborn',
        
        # Jupyter and IPython
        'IPython', 'jupyter', 'notebook', 'ipykernel',
        'ipython_genutils', 'jupyter_core',
        
        # Large data science libraries (if not actually used)
        'pandas.tests', 'numpy.tests', 'scipy',
        'sklearn', 'tensorflow', 'torch',
        
        # Web browsers and selenium
        'selenium', 'webdriver',
        
        # Unused standard library modules
        'audioop', 'cProfile', 'profile', 'pstats',
        'turtledemo', 'turtle', 'idlelib',
        
        # Platform-specific modules not needed
        'readline', 'rlcompleter',
        
        # XML processing (if not used)
        'xml.sax', 'xml.dom',
        
        # Multiprocessing (if not used)
        'multiprocessing.spawn', 'multiprocessing.forkserver',
        
        # Compression libraries (if not used)
        'bz2', 'lzma', 'zipfile', 'tarfile',
    ],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

# Remove duplicate entries and optimize
a.pure = [x for x in a.pure if not any(exclude in x[0] for exclude in [
    'test_', '_test', 'tests.', '.test_', 'testing.'
])]

# Create PYZ archive
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

# Create executable
exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name=APP_NAME,
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,  # Don't strip on Windows
    upx=True,     # Enable UPX compression if available
    upx_exclude=[],
    runtime_tmpdir=None,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    distpath=OUTPUT_DIR,
)
"@

$specContent | Out-File -FilePath $SPEC_FILE -Encoding utf8
Write-Success "PyInstaller specification created: $SPEC_FILE"

# Step 6: Create optimized hooks
Write-Step "Creating optimized build hooks"

# SQLite hook
$sqliteHook = @"
# hook-sqlite3.py - Optimized SQLite hook for HedgeX-V3
from PyInstaller.utils.hooks import collect_dynamic_libs

# Collect only essential SQLite libraries
binaries = collect_dynamic_libs('sqlite3')
hiddenimports = ['sqlite3', '_sqlite3']
"@

$sqliteHook | Out-File -FilePath "hooks\hook-sqlite3.py" -Encoding utf8

# FastAPI hook
$fastapiHook = @"
# hook-fastapi.py - Optimized FastAPI hook for HedgeX-V3
hiddenimports = [
    'fastapi.routing',
    'fastapi.encoders',
    'starlette.routing',
    'starlette.middleware',
    'starlette.middleware.cors',
]
"@

$fastapiHook | Out-File -FilePath "hooks\hook-fastapi.py" -Encoding utf8

Write-Success "Build hooks created"

# Step 7: Build the executable
Write-Step "Building optimized executable"

try {
    $buildStartTime = Get-Date
    
    if ($Verbose) {
        & python -m PyInstaller --clean $SPEC_FILE
    } else {
        & python -m PyInstaller --clean $SPEC_FILE --log-level WARN
    }
    
    $buildEndTime = Get-Date
    $buildDuration = $buildEndTime - $buildStartTime
    
    Write-Success "Build completed in $($buildDuration.TotalSeconds.ToString('0.0')) seconds"
    
} catch {
    Write-Error "Build failed: $_"
    exit 1
}

# Step 8: Verify and analyze build output
Write-Step "Analyzing build output"

$executablePath = "$OUTPUT_DIR\HedgeX-Backend.exe"
if (Test-Path $executablePath) {
    $fileInfo = Get-Item $executablePath
    $sizeInMB = [math]::Round($fileInfo.Length / 1MB, 2)
    
    Write-Success "Executable created successfully!"
    Write-Host "  Location: $executablePath"
    Write-Host "  Size: $sizeInMB MB"
    
    # Test the executable briefly
    Write-Step "Testing executable"
    try {
        $testProcess = Start-Process -FilePath $executablePath -ArgumentList "--help" -Wait -PassThru -NoNewWindow
        if ($testProcess.ExitCode -eq 0) {
            Write-Success "Executable test passed"
        } else {
            Write-Warning "Executable test returned exit code: $($testProcess.ExitCode)"
        }
    } catch {
        Write-Warning "Could not test executable: $_"
    }
    
} else {
    Write-Error "Executable not found at expected location: $executablePath"
    exit 1
}

# Step 9: Cleanup temporary files
Write-Step "Cleaning up temporary files"

if (Test-Path $SPEC_FILE) {
    Remove-Item $SPEC_FILE -Force
    Write-Host "  Removed: $SPEC_FILE"
}

Write-Success "Cleanup completed"

# Step 10: Final summary
Write-ColorOutput "" "White"
Write-ColorOutput "🎉 HedgeX-V3 Backend Build Summary" "Magenta"
Write-ColorOutput "=================================" "Magenta"
Write-Host "Build Type: " -NoNewline; Write-ColorOutput $BuildType "Yellow"
Write-Host "Output Location: " -NoNewline; Write-ColorOutput $executablePath "Yellow"
Write-Host "File Size: " -NoNewline; Write-ColorOutput "$sizeInMB MB" "Yellow"
Write-Host "Build Duration: " -NoNewline; Write-ColorOutput "$($buildDuration.TotalSeconds.ToString('0.0'))s" "Yellow"

Write-ColorOutput "" "White"
Write-ColorOutput "📋 Next Steps:" "Cyan"
Write-Host "1. Test the executable: " -NoNewline; Write-ColorOutput "$executablePath" "White"
Write-Host "2. Deploy to your target environment"
Write-Host "3. Configure any necessary environment variables"

Write-ColorOutput "" "White"
Write-ColorOutput "💡 Optimization Tips:" "Cyan"
Write-Host "• For even smaller size, install UPX: https://github.com/upx/upx/releases"
Write-Host "• Use --SkipDependencies flag for faster rebuilds"
Write-Host "• Use -BuildType dev for development builds"

Write-ColorOutput "" "White"
Write-Success "Build process completed successfully!"
