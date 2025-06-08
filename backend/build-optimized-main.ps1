# HedgeX Optimized Build Script
# Corrected version of original build.ps1 with proper environment handling and optimization

param(
    [switch]$Clean = $false,
    [switch]$Verbose = $false,
    [switch]$NoUPX = $false,
    [string]$OutputName = "hedgex"
)

# Color functions for better output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }

Write-Info "=== HedgeX Optimized Build Script ==="
Write-Info "Environment: Standard Python venv"

# Validate environment
if (!(Test-Path ".\venv\Scripts\activate.bat")) {
    Write-Error "Error: Python virtual environment not found at .\venv\"
    Write-Info "Expected: .\venv\Scripts\activate.bat"
    Write-Info "This project uses standard Python venv, not Conda"
    exit 1
}

# Create required directories
Write-Info "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null
New-Item -ItemType Directory -Path "dist" -Force | Out-Null
New-Item -ItemType Directory -Path "build" -Force | Out-Null

# Clean previous builds if requested
if ($Clean) {
    Write-Info "Cleaning previous builds..."
    Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item -Path "build\*" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Success "Build directories cleaned"
}

# Activate Python virtual environment
Write-Info "Activating Python virtual environment..."
try {
    & ".\venv\Scripts\Activate.ps1"
    Write-Success "Virtual environment activated"
} catch {
    Write-Error "Failed to activate virtual environment: $_"
    exit 1
}

# Verify Python version and environment
Write-Info "Checking Python environment..."
$pythonVersion = python --version 2>&1
Write-Host "Python version: $pythonVersion" -ForegroundColor White

# Verify we're in the virtual environment
$pythonPath = python -c "import sys; print(sys.executable)" 2>&1
if ($pythonPath -like "*venv*") {
    Write-Success "Using virtual environment Python: $pythonPath"
} else {
    Write-Warning "Warning: Not using virtual environment Python: $pythonPath"
}

# Install/upgrade dependencies
Write-Info "Installing dependencies..."
try {
    python -m pip install --upgrade pip --quiet
    python -m pip install -r requirements.txt --quiet
    
    # Ensure PyInstaller is installed
    python -m pip install pyinstaller --quiet
    
    Write-Success "Dependencies installed successfully"
} catch {
    Write-Error "Failed to install dependencies: $_"
    exit 1
}

# Handle DLL requirements for standard Python (not Anaconda)
Write-Info "Handling DLL requirements..."

# For standard Python venv, we need different DLL paths
$pythonRoot = python -c "import sys; print(sys.base_prefix)" 2>&1
$systemDLLs = @(
    "$env:WINDIR\System32\vcruntime140.dll",
    "$env:WINDIR\System32\msvcp140.dll",
    "$env:WINDIR\System32\ucrtbase.dll"
)

# Copy system DLLs if they exist
foreach ($dll in $systemDLLs) {
    if (Test-Path $dll) {
        $dllName = Split-Path $dll -Leaf
        Copy-Item $dll -Destination "dist\$dllName" -Force -ErrorAction SilentlyContinue
        if ($Verbose) { Write-Host "Copied system DLL: $dllName" -ForegroundColor Gray }
    }
}

# Verify hedgex.spec exists and is optimized
if (!(Test-Path "hedgex.spec")) {
    Write-Error "Error: hedgex.spec file not found"
    Write-Info "Please ensure the optimized hedgex.spec file exists"
    exit 1
}

# Check if spec file contains optimization settings
$specContent = Get-Content "hedgex.spec" -Raw
if ($specContent -match "strip=False" -and $specContent -match "upx=True") {
    Write-Success "Using optimized hedgex.spec configuration"
} else {
    Write-Warning "Warning: hedgex.spec may not be optimized"
}

# Build executable with PyInstaller
Write-Info "Building executable with PyInstaller..."
Write-Host "This may take several minutes..." -ForegroundColor Yellow

try {
    if ($Verbose) {
        python -m PyInstaller --clean hedgex.spec
    } else {
        python -m PyInstaller --clean hedgex.spec --log-level=WARN
    }
    
    Write-Success "PyInstaller build completed"
} catch {
    Write-Error "PyInstaller build failed: $_"
    exit 1
}

# Check if executable was created
$executablePath = "dist\$OutputName.exe"
if (Test-Path $executablePath) {
    $fileSize = (Get-Item $executablePath).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Success "Executable created successfully!"
    Write-Host "Location: $executablePath" -ForegroundColor White
    Write-Host "Size: $fileSizeMB MB" -ForegroundColor White
    
    # Size optimization feedback
    if ($fileSizeMB -lt 25) {
        Write-Success "Excellent size optimization achieved! ($fileSizeMB MB)"
    } elseif ($fileSizeMB -lt 50) {
        Write-Warning "Good size optimization ($fileSizeMB MB) - consider UPX for further reduction"
    } else {
        Write-Warning "Large executable size ($fileSizeMB MB) - review excludes in hedgex.spec"
    }
} else {
    Write-Error "Error: Executable not found at $executablePath"
    Write-Info "Check PyInstaller output for errors"
    exit 1
}

# Optional UPX compression
if (!$NoUPX -and (Get-Command upx -ErrorAction SilentlyContinue)) {
    Write-Info "Applying UPX compression..."
    try {
        upx --best --lzma $executablePath
        $compressedSize = (Get-Item $executablePath).Length
        $compressedSizeMB = [math]::Round($compressedSize / 1MB, 2)
        $compressionRatio = [math]::Round((1 - $compressedSize / $fileSize) * 100, 1)
        Write-Success "UPX compression completed!"
        Write-Host "Final size: $compressedSizeMB MB (${compressionRatio}% reduction)" -ForegroundColor White
    } catch {
        Write-Warning "UPX compression failed: $_"
    }
} elseif (!$NoUPX) {
    Write-Warning "UPX not found - install UPX for additional compression"
    Write-Info "Download from: https://upx.github.io/"
}

# Final verification
Write-Info "Performing final verification..."
if (Test-Path $executablePath) {
    Write-Success "Build completed successfully!"
    Write-Host "`nBuild Summary:" -ForegroundColor Cyan
    Write-Host "- Executable: $executablePath" -ForegroundColor White
    Write-Host "- Environment: Standard Python venv" -ForegroundColor White
    Write-Host "- Optimization: Enabled via hedgex.spec" -ForegroundColor White
    
    if (!$NoUPX -and (Get-Command upx -ErrorAction SilentlyContinue)) {
        Write-Host "- Compression: UPX applied" -ForegroundColor White
    }
    
    Write-Host "`nNext steps:" -ForegroundColor Cyan
    Write-Host "1. Test the executable: .\dist\$OutputName.exe" -ForegroundColor Gray
    Write-Host "2. Verify all features work correctly" -ForegroundColor Gray
    Write-Host "3. Deploy to production environment" -ForegroundColor Gray
} else {
    Write-Error "Build verification failed - executable not found"
    exit 1
}

Write-Success "=== Build Process Completed ==="
