# HedgeX Backend Build Script - Fixed Version
# This script addresses common PyInstaller issues with FastAPI/Uvicorn applications

Write-Host "=== HedgeX Backend Build Script ===" -ForegroundColor Green

# Create required directories
Write-Host "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null
New-Item -ItemType Directory -Path "dist" -Force | Out-Null
New-Item -ItemType Directory -Path "build" -Force | Out-Null
New-Item -ItemType Directory -Path "release" -Force | Out-Null

# Check Python version
Write-Host "Checking Python version..."
$pythonVersion = python --version 2>&1
Write-Host "Using: $pythonVersion"

# Upgrade pip and install dependencies
Write-Host "Installing/upgrading dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Clean previous builds
Write-Host "Cleaning previous builds..."
if (Test-Path "dist") {
    Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "build") {
    Remove-Item -Path "build\*" -Recurse -Force -ErrorAction SilentlyContinue
}

# Test that the application can be imported
Write-Host "Testing application import..."
try {
    python -c "from app.main import app; print('Application import successful')"
} catch {
    Write-Host "Error: Application import failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Build with PyInstaller using the fixed spec file
Write-Host "Building executable with PyInstaller..."
try {
    python -m PyInstaller --clean --noconfirm hedgex.spec
    if ($LASTEXITCODE -ne 0) {
        throw "PyInstaller failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host "Error: PyInstaller build failed!" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Check if executable was created
$exePath = "release\HedgeX-Backend.exe"
if (Test-Path $exePath) {
    Write-Host "Build successful! Executable created at: $exePath" -ForegroundColor Green
    
    # Test the executable
    Write-Host "Testing executable..."
    try {
        $process = Start-Process -FilePath $exePath -ArgumentList "--help" -Wait -PassThru -NoNewWindow
        if ($process.ExitCode -eq 0) {
            Write-Host "Executable test passed!" -ForegroundColor Green
        } else {
            Write-Host "Warning: Executable test failed with exit code $($process.ExitCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "Warning: Could not test executable: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    
    # Show file size
    $fileSize = (Get-Item $exePath).Length / 1MB
    Write-Host "Executable size: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Cyan
    
} else {
    Write-Host "Error: Executable was not created!" -ForegroundColor Red
    exit 1
}

Write-Host "=== Build completed successfully! ===" -ForegroundColor Green
Write-Host "You can run the application with: .\release\HedgeX-Backend.exe" -ForegroundColor Cyan 