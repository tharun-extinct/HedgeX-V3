from PyInstaller.utils.hooks import collect_data_files, collect_submodules

# Collect all click submodules
hiddenimports = collect_submodules('click')

# Add specific click modules that might be missed
additional_imports = [
    'click.core',
    'click.types',
    'click._compat',
    'click._winconsole',
    'click._textwrap',
    'click._termui_impl',
    'click._bashcomplete',
    'click.shell_completion',
]

hiddenimports.extend(additional_imports)

# Collect data files
datas = collect_data_files('click') 