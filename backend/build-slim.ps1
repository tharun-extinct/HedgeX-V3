# Improved build script with size optimization
Write-Host "Creating required directories..."
New-Item -ItemType Directory -Path "hooks" -Force | Out-Null

# Clean previous build files first
Write-Host "Cleaning previous build..."
Remove-Item -Path "dist/*" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "build/*" -Recurse -Force -ErrorAction SilentlyContinue

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\activate.ps1") {
    Write-Host "Activating virtual environment..."
    & .\venv\Scripts\activate.ps1
}

# Build with PyInstaller (using optimized spec)
Write-Host "Building optimized executable..."
pyinstaller --clean hedgex.spec

# Only copy essential DLLs if needed
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
