from PyInstaller.utils.hooks import collect_dynamic_libs
<<<<<<< HEAD
import os
from pathlib import Path

def hook(hook_api):
    # Get the SQLite DLLs using PyInstaller's utility
    sqlite_bins = collect_dynamic_libs('sqlite3')
    
    # Add additional DLLs from Anaconda if needed
    anaconda_path = Path(os.path.expanduser("~")) / "anaconda3"
    sqlite_dll = anaconda_path / "Library" / "bin" / "sqlite3.dll"
    sqlite_pyd = anaconda_path / "DLLs" / "_sqlite3.pyd"
    
    additional_bins = []
    if sqlite_dll.exists():
        additional_bins.append((str(sqlite_dll), "."))
    if sqlite_pyd.exists():
        additional_bins.append((str(sqlite_pyd), "DLLs"))
    
    # Combine all binaries
    binaries = sqlite_bins + additional_bins
      # Required imports
    hiddenimports = ['sqlite3', '_sqlite3']
    
    return [], binaries, hiddenimports
=======

# Get the SQLite DLLs
binaries = collect_dynamic_libs('sqlite3')

# This ensures sqlite3.dll and its dependencies are included
hiddenimports = ['sqlite3']
>>>>>>> e021f8e0cf4115041d1695f40cdd46168b0af44b
