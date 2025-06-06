# Create and activate a virtual environment
Write-Host "Creating virtual environment..."
python -m venv venv
.\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "Upgrading pip..."
python -m pip install --upgrade pip

# Install dependencies
Write-Host "Installing dependencies..."
python -m pip install wheel
python -m pip install -r requirements.txt

# Build executable
Write-Host "Building executable..."
pyinstaller hedgex.spec

Write-Host "Done! The executable is in the dist folder."
