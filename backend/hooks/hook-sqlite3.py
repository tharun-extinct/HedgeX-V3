# hook-sqlite3.py - Optimized SQLite hook for HedgeX-V3
from PyInstaller.utils.hooks import collect_dynamic_libs

# Collect only essential SQLite libraries
binaries = collect_dynamic_libs('sqlite3')
hiddenimports = ['sqlite3', '_sqlite3']
