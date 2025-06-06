@echo off
echo Installing dependencies...
pip install -r requirements.txt

echo Building executable...
pyinstaller hedgex.spec

echo Done! The executable is in the dist folder.
