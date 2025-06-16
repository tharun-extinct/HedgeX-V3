# Deprecated
# Create required directories
Write-Host "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null
New-Item -ItemType Directory -Path "dist" -Force | Out-Null
New-Item -ItemType Directory -Path "dist\dlls" -Force | Out-Null

# Copy required DLLs from Anaconda
Write-Host "Copying required DLLs..."
$anacondaBinPath = "$env:USERPROFILE\anaconda3\Library\bin"
$anacondaDLLsPath = "$env:USERPROFILE\anaconda3\DLLs"
$requiredDLLs = @(
    "$anacondaBinPath\api-ms-win-core-path-l1-1-0.dll",
    "$anacondaBinPath\ffi-8.dll",
    "$anacondaBinPath\sqlite3.dll",
    "$anacondaBinPath\libcrypto-3-x64.dll",
    "$anacondaBinPath\libssl-3-x64.dll",
    "$anacondaBinPath\zlib.dll",
    "$anacondaBinPath\libexpat.dll",
    "$anacondaBinPath\bzip2.dll",
    "$anacondaBinPath\liblzma.dll",
    "$anacondaBinPath\vcruntime140.dll",
    "$anacondaBinPath\msvcp140.dll",
    "$anacondaBinPath\ucrtbase.dll",
    "$anacondaDLLsPath\_ctypes.pyd",
    "$anacondaDLLsPath\_sqlite3.pyd"
)

foreach ($dll in $requiredDLLs) {
    if (Test-Path $dll) {
        Copy-Item $dll -Destination "dist\dlls\" -Force
        Write-Host "Copied $dll"
    } else {
        Write-Host "Warning: Could not find $dll"
    }
}

# Activate Anaconda environment if it exists
$condaPath = "$env:USERPROFILE\anaconda3\Scripts\activate.ps1"
if (Test-Path $condaPath) {
    Write-Host "Activating Anaconda environment..."
    & $condaPath
}

# Ensure we're using Python 3.12
Write-Host "Using Python version:"
python --version

# Install dependencies
Write-Host "Installing dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Build with PyInstaller
Write-Host "Building executable..."
python -m PyInstaller --clean hedgex.spec

# Copy DLLs to the dist folder after PyInstaller runs
Write-Host "Copying DLLs to dist folder..."
$requiredDLLs = @(
    "$env:USERPROFILE\anaconda3\Library\bin\ffi-8.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\sqlite3.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\libcrypto-3-x64.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\libssl-3-x64.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\zlib.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\libexpat.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\bzip2.dll",
    "$env:USERPROFILE\anaconda3\Library\bin\liblzma.dll",
    "$env:USERPROFILE\anaconda3\DLLs\_ctypes.pyd",
    "$env:USERPROFILE\anaconda3\DLLs\_sqlite3.pyd"
)

foreach ($dll in $requiredDLLs) {
    if (Test-Path $dll) {
        Copy-Item $dll -Destination "dist\" -Force
        Write-Host "Copied $dll to dist folder"
    } else {
        Write-Host "Warning: Could not find $dll"
    }
}

# Clean previous build
Write-Host "Cleaning previous build..."
Remove-Item -Path "dist/*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build/*" -Recurse -Force -ErrorAction SilentlyContinue

# Build executable
Write-Host "Building executable..."
pyinstaller --clean hedgex.spec

Write-Host "Done! The executable is in the dist folder."
