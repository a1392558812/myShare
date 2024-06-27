@echo off
rem 执行 暂停10秒...
echo Pause for 10 seconds...
timeout /t 10
echo Pause End

rem 切换到 D:\Awen\vue-blog 目录下
cd /d D:\Awen\vue-blog

rem 执行 npm run build 命令
echo Running npm run build...
npm run build
echo run build end
pause