@echo off
rem 执行 暂停10秒...
echo Pause for 10 seconds...
timeout /t 10
echo Pause End

rem 切换到 D:\Awen\blog 目录下
cd /d D:\Awen\blog

rem 执行 node ./menu-list/index.js 命令
echo Running node ./menu-list/index.js...
node ./menu-list/index.js

echo All scripts executed.
pause