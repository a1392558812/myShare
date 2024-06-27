@echo off
rem Change directory to D:\Awen\vue-blog
cd /d D:\Awen\vue-blog

rem Execute npm run build command
echo Running npm run build...
call npm run build

rem 执行 暂停15秒...
echo Pause for 15 seconds...
timeout /t 15
echo Pause End

rem Change directory to D:\Awen\blog
cd /d D:\Awen\blog

rem Execute node ./main.js command
echo Running node ./main.js...
node ./main.js

rem Execute node ./menu-list/index.js command
echo Running node ./menu-list/index.js...
node ./menu-list/index.js

echo All scripts executed.
pause