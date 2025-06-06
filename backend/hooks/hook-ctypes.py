from pathlib import Path
import os
from PyInstaller.utils.hooks import collect_dynamic_libs

def hook(hook_api):
    datas = []
    binaries = []

    # Get base Anaconda paths
    anaconda_path = Path(os.path.expanduser("~")) / "anaconda3"
    lib_bin = anaconda_path / "Library" / "bin"
    dlls_path = anaconda_path / "DLLs"

    # Critical DLLs needed by ctypes
    dll_list = {
        "root": ["ffi-8.dll", "libffi-8.dll", "libffi.dll"],  # try different versions
        "dlls": ["_ctypes.pyd"]
    }

    # Add DLLs that should be in root directory
    for dll in dll_list["root"]:
        dll_path = lib_bin / dll
        if dll_path.exists():
            binaries.append((str(dll_path), "."))

    # Add DLLs that should be in DLLs directory
    for dll in dll_list["dlls"]:
        dll_path = dlls_path / dll
        if dll_path.exists():
            binaries.append((str(dll_path), "DLLs"))

    # Also collect any ctypes-related DLLs using PyInstaller's utility
    ctypes_bins = collect_dynamic_libs('ctypes')
    binaries.extend(ctypes_bins)

    # Required imports
    hiddenimports = ['_ctypes', 'ctypes']

    return datas, binaries, hiddenimports
