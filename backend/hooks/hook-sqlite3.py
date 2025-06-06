from PyInstaller.utils.hooks import collect_dynamic_libs

# Get the SQLite DLLs
binaries = collect_dynamic_libs('sqlite3')

# This ensures sqlite3.dll and its dependencies are included
hiddenimports = ['sqlite3']
