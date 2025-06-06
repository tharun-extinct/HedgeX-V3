# Create required directories
Write-Host "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null
New-Item -ItemType Directory -Path "dist" -Force | Out-Null

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

# Clean previous build
Write-Host "Cleaning previous build..."
Remove-Item -Path "dist/*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build/*" -Recurse -Force -ErrorAction SilentlyContinue

# Build executable
Write-Host "Building executable..."
pyinstaller --clean hedgex.spec

Write-Host "Done! The executable is in the dist folder."
