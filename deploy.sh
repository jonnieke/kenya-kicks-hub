#!/bin/bash

# Ball Mtaani Deployment Script
# This script automates the build and deployment process

set -e  # Exit on any error

echo "🚀 Starting Ball Mtaani deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run linting
print_status "Running linting..."
npm run lint

if [ $? -eq 0 ]; then
    print_success "Linting passed"
else
    print_warning "Linting failed, but continuing with deployment"
fi

# Build the project
print_status "Building project..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check build output
if [ ! -d "dist" ]; then
    print_error "dist directory not found after build"
    exit 1
fi

print_status "Build output size:"
du -sh dist/

# Copy deployment files
print_status "Copying deployment files..."
cp public/.htaccess dist/
cp public/robots.txt dist/
cp public/sitemap.xml dist/
cp public/manifest.json dist/
cp public/sw.js dist/

print_success "Deployment files copied"

# Create deployment package
print_status "Creating deployment package..."
tar -czf ball-mtaani-deploy-$(date +%Y%m%d-%H%M%S).tar.gz dist/

print_success "Deployment package created"

# Display deployment instructions
echo ""
echo "🎯 Deployment Package Ready!"
echo "=============================="
echo ""
echo "📦 Package: ball-mtaani-deploy-*.tar.gz"
echo "📁 Contents: dist/ folder with all optimized files"
echo ""
echo "🌐 cPanel Deployment Steps:"
echo "1. Extract the tar.gz file"
echo "2. Upload contents of dist/ folder to public_html/"
echo "3. Ensure .htaccess is in public_html/"
echo "4. Verify all routes work correctly"
echo ""
echo "🔧 Post-Deployment Checklist:"
echo "✅ Update environment variables in cPanel"
echo "✅ Configure SSL certificate"
echo "✅ Set up Cloudflare CDN (recommended)"
echo "✅ Submit sitemap to search engines"
echo "✅ Test all functionality"
echo "✅ Monitor performance metrics"
echo ""
echo "📊 Performance Targets:"
echo "• Page load speed: < 3s"
echo "• Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1"
echo "• Mobile-first experience"
echo "• SEO score > 90"
echo ""
echo "🚀 Your Ball Mtaani platform is ready for deployment!"
echo ""

# Optional: Upload to server if credentials are provided
if [ ! -z "$DEPLOY_HOST" ] && [ ! -z "$DEPLOY_USER" ]; then
    print_status "Uploading to server..."
    scp ball-mtaani-deploy-*.tar.gz $DEPLOY_USER@$DEPLOY_HOST:~/
    print_success "Uploaded to server"
    
    print_status "Extracting on server..."
    ssh $DEPLOY_USER@$DEPLOY_HOST "cd ~ && tar -xzf ball-mtaani-deploy-*.tar.gz && rm ball-mtaani-deploy-*.tar.gz"
    print_success "Extracted on server"
    
    print_status "Deploying to web directory..."
    ssh $DEPLOY_USER@$DEPLOY_HOST "sudo cp -r dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html/"
    print_success "Deployed to web directory"
else
    print_warning "Server credentials not provided. Manual deployment required."
    print_status "Use the deployment package to manually upload to your server."
fi

print_success "Deployment script completed successfully!"
