# Optimized build script to reduce executable size
Write-Host "Starting optimized build process..."

# Clean previous build files first
Write-Host "Cleaning previous build..."
Remove-Item -Path "dist\*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build\*" -Recurse -Force -ErrorAction SilentlyContinue

# Ensure hooks directory exists
Write-Host "Setting up hooks directory..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\activate.ps1") {
    Write-Host "Activating virtual environment..."
    & .\venv\Scripts\activate.ps1
}

# Build with PyInstaller (using optimized spec)
Write-Host "Building optimized executable..."
pyinstaller --clean hedgex.spec

Write-Host "Build completed! Executable size optimization tips:"
Write-Host "1. If you want to further reduce size, manually download UPX from https://github.com/upx/upx/releases"
Write-Host "2. Place upx.exe in your PATH and run 'upx --best dist\HedgeX-Backend.exe'"
Write-Host "3. You can also try 'upx --ultra-brute dist\HedgeX-Backend.exe' for maximum compression"
Write-Host "Done! The optimized executable is in the dist folder."
