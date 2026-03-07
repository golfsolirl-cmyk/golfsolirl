@echo off
cd /d "c:\Users\Thomas\Desktop\golf"

echo Removing lock file...
del /f /q .git\index.lock 2>nul

echo Staging files...
git add .

echo Committing...
git commit -m "Replace repo with Golf Sol Ireland website"

echo Pushing to GitHub...
git push -u origin main --force

echo Done.
pause
