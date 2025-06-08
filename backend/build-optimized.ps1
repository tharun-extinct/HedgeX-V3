# Improved build script with size optimization
Write-Host "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null

# Clean previous build files first
Write-Host "Cleaning previous build..."
Remove-Item -Path "dist/*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build/*" -Recurse -Force -ErrorAction SilentlyContinue

# Activate Anaconda environment if it exists
$condaPath = "$env:USERPROFILE\anaconda3\Scripts\activate.ps1"
if (Test-Path $condaPath) {
    Write-Host "Activating Anaconda environment..."
    & $condaPath
}

# Install dependencies (use production requirements)
Write-Host "Installing optimized dependencies..."
python -m pip install --upgrade pip
python -m pip install -r requirements-prod.txt
python -m pip install pyinstaller==5.13.2

# Install UPX for better compression
Write-Host "Installing UPX for compression..."
python -m pip install upx-ucl

# Build with PyInstaller (using optimized spec)
Write-Host "Building optimized executable..."
python -m PyInstaller --clean hedgex.spec

# Only copy essential DLLs that might be missing
Write-Host "Copying essential DLLs..."
$anacondaBinPath = "$env:USERPROFILE\anaconda3\Library\bin"
$anacondaDLLsPath = "$env:USERPROFILE\anaconda3\DLLs"
$essentialDLLs = @(
    "$anacondaBinPath\sqlite3.dll",
    "$anacondaDLLsPath\_sqlite3.pyd"
)

foreach ($dll in $essentialDLLs) {
    if (Test-Path $dll) {
        if (-not (Test-Path "dist\$(Split-Path $dll -Leaf)")) {
            Copy-Item $dll -Destination "dist\" -Force
            Write-Host "Copied $(Split-Path $dll -Leaf) to dist folder"
        }
    }
}

Write-Host "Done! The optimized executable is in the dist folder."
