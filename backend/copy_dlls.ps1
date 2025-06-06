# Copy all required DLLs from Anaconda to the dist folder
Write-Host "Copying required DLLs to dist folder..."

$anacondaPath = "$env:USERPROFILE\anaconda3"
$distPath = ".\dist"
$dllsPath = "$distPath\DLLs"

# Create DLLs directory if it doesn't exist
if (-not (Test-Path $dllsPath)) {
    New-Item -ItemType Directory -Path $dllsPath | Out-Null
}

# List of DLLs to copy to root directory
$rootDlls = @(
    "$anacondaPath\Library\bin\ffi-8.dll",
    "$anacondaPath\Library\bin\libffi-8.dll",
    "$anacondaPath\Library\bin\sqlite3.dll",
    "$anacondaPath\Library\bin\libbz2.dll",
    "$anacondaPath\Library\bin\libcrypto-3-x64.dll",
    "$anacondaPath\Library\bin\libssl-3-x64.dll",
    # Windows System DLLs - only if they exist in Anaconda
    "$anacondaPath\Library\bin\vcruntime140.dll",
    "$anacondaPath\Library\bin\msvcp140.dll",
    "$anacondaPath\Library\bin\concrt140.dll"
)

# Also copy Python DLLs to root
foreach ($file in Get-ChildItem "$anacondaPath\DLLs" -Filter "*.pyd") {
    Write-Host "Copying $($file.FullName) to $distPath"
    Copy-Item $file.FullName $distPath -Force
}

# Copy python312.dll if it exists
if (Test-Path "$anacondaPath\python312.dll") {
    Write-Host "Copying python312.dll to $distPath"
    Copy-Item "$anacondaPath\python312.dll" $distPath -Force
}

# Copy root DLLs
foreach ($dll in $rootDlls) {
    if (Test-Path $dll) {
        Write-Host "Copying $dll to $distPath"
        Copy-Item $dll $distPath -Force
    } else {
        Write-Host "Warning: Could not find $dll"
    }
}

# Copy DLLs folder DLLs
foreach ($dll in $dllsDlls) {
    if (Test-Path $dll) {
        Write-Host "Copying $dll to $dllsPath"
        Copy-Item $dll $dllsPath -Force
    } else {
        Write-Host "Warning: Could not find $dll"
    }
}
