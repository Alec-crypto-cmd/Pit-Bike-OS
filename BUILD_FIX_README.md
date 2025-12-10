# Fixing "Unable to Load Script"

The error "Unable to load script" happens because the **Debug APK** expects a development server (Metro) to be running on your computer.

## The Solution
We need a **Release APK** which bundles the script inside the app.
However, Release builds normally require a private signing key (which you don't have set up).

## The Fix
I have updated the GitHub Action to:
1. Build a **Release** version (standalone, no Metro needed).
2. "Hack" the build config to sign it with the **Debug** key.
   - *Note: This APK is safe to install but cannot be published to the Play Store.*

## Action Required
Push the changes again to trigger the new build.

```bash
cd welcome-app
git add .
git commit -m "Fix: build standalone APK with debug signing"
git push
```
