# Build Resources

This directory contains resources needed for building the application packages.

## Current Icon Files

The application icons are already provided:

### Windows
- `icon.ico` - Windows icon file (contains multiple sizes: 16x16, 32x32, 48x48, 256x256)

### macOS
- `icon.icns` - macOS icon file (contains sizes from 16x16 to 1024x1024)
- `entitlements.mac.plist` - macOS entitlements file for code signing

## Replacing Icons

If you want to replace the application icon:

1. Create a high-quality source image (1024x1024 PNG with transparent background)
2. Install icon generation tool:
   ```bash
   npm install -g electron-icon-builder
   ```
3. Generate platform icons:
   ```bash
   electron-icon-builder --input=./your-icon-source.png --output=./build
   ```

This will replace:
- `build/icon.ico` (Windows)
- `build/icon.icns` (macOS)

## Entitlements File

The `entitlements.mac.plist` file is required for macOS code signing and is already configured.
