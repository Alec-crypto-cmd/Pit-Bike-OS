# Fixing Artifact Path

The build likely succeeded, but the "Upload APK" step failed because I predicted the wrong filename (`app-release-apk.apk` instead of `app-release.apk`).

## The Fix
I updated the workflow to upload **any APK file** found in the output directory (`*.apk`). This ensures it captures the file regardless of its exact name.

## Action Required
Push the changes again.

```bash
cd welcome-app
git add .
git commit -m "Fix: use wildcard for APK artifact"
git push
```
