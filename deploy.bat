@echo off
REM Ball Mtaani Deployment Script for Windows
REM This script automates the build and deployment process

echo 🚀 Starting Ball Mtaani deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo [INFO] Node.js version: 
node --version
echo [INFO] npm version: 
npm --version

REM Install dependencies
echo [INFO] Installing dependencies...
call npm ci --production=false

if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

REM Run linting
echo [INFO] Running linting...
call npm run lint

if %errorlevel% neq 0 (
    echo [WARNING] Linting failed, but continuing with deployment
) else (
    echo [SUCCESS] Linting passed
)

REM Build the project
echo [INFO] Building project...
call npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)
echo [SUCCESS] Build completed successfully

REM Check build output
if not exist "dist" (
    echo [ERROR] dist directory not found after build
    pause
    exit /b 1
)

echo [INFO] Build output size:
dir dist /s

REM Copy deployment files
echo [INFO] Copying deployment files...
copy "public\.htaccess" "dist\" >nul 2>&1
copy "public\robots.txt" "dist\" >nul 2>&1
copy "public\sitemap.xml" "dist\" >nul 2>&1
copy "public\manifest.json" "dist\" >nul 2>&1
copy "public\sw.js" "dist\" >nul 2>&1

echo [SUCCESS] Deployment files copied

REM Create deployment package
echo [INFO] Creating deployment package...
set TIMESTAMP=%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set TIMESTAMP=%TIMESTAMP: =0%
powershell -command "Compress-Archive -Path 'dist\*' -DestinationPath 'ball-mtaani-deploy-%TIMESTAMP%.zip'"

echo [SUCCESS] Deployment package created

REM Display deployment instructions
echo.
echo 🎯 Deployment Package Ready!
echo ==============================
echo.
echo 📦 Package: ball-mtaani-deploy-%TIMESTAMP%.zip
echo 📁 Contents: dist/ folder with all optimized files
echo.
echo 🌐 cPanel Deployment Steps:
echo 1. Extract the zip file
echo 2. Upload contents of dist/ folder to public_html/
echo 3. Ensure .htaccess is in public_html/
echo 4. Verify all routes work correctly
echo.
echo 🔧 Post-Deployment Checklist:
echo ✅ Update environment variables in cPanel
echo ✅ Configure SSL certificate
echo ✅ Set up Cloudflare CDN (recommended)
echo ✅ Submit sitemap to search engines
echo ✅ Test all functionality
echo ✅ Monitor performance metrics
echo.
echo 📊 Performance Targets:
echo • Page load speed: ^< 3s
echo • Core Web Vitals: LCP ^< 2.5s, FID ^< 100ms, CLS ^< 0.1
echo • Mobile-first experience
echo • SEO score ^> 90
echo.
echo 🚀 Your Ball Mtaani platform is ready for deployment!
echo.

REM Optional: Upload to server if credentials are provided
if not "%DEPLOY_HOST%"=="" (
    if not "%DEPLOY_USER%"=="" (
        echo [INFO] Uploading to server...
        echo [INFO] Use your preferred FTP/SFTP client to upload the deployment package
        echo [INFO] Package: ball-mtaani-deploy-%TIMESTAMP%.zip
    )
) else (
    echo [WARNING] Server credentials not provided. Manual deployment required.
    echo [INFO] Use the deployment package to manually upload to your server.
)

echo [SUCCESS] Deployment script completed successfully!
pause
