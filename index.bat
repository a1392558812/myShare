@echo off
echo 正在执行 main.bat
 
call .\bat\run-build.bat

rem 执行 暂停10秒...
echo Pause for 10 seconds...
timeout /t 10
echo Pause End

cd /d D:\Awen\blog
call .\bat\move-file.bat

cd /d D:\Awen\blog
call .\bat\create-menu.bat
 
echo 回到 main.bat 继续执行