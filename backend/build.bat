@echo off
echo Activating Python virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Building executable...
pyinstaller --clean hedgex.spec

echo Done! The executable is in the %DIST_PATH% folder.
