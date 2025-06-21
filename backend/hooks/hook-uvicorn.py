from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Collect all uvicorn submodules
hiddenimports = collect_submodules('uvicorn')

# Add specific uvicorn modules that might be missed
additional_imports = [
    'uvicorn.logging',
    'uvicorn.loops.auto',
    'uvicorn.loops.asyncio',
    'uvicorn.protocols.http.auto',
    'uvicorn.protocols.http.h11_impl',
    'uvicorn.protocols.http.httptools_impl',
    'uvicorn.lifespan.on',
    'uvicorn.lifespan.off',
    'uvicorn.config',
    'uvicorn.main',
    'uvicorn.server',
    'uvicorn.workers',
]

hiddenimports.extend(additional_imports)

# Collect data files
datas = collect_data_files('uvicorn') 