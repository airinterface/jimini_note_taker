# Setup Document

This document describes the basic setup flow for Jimini.

## 1. Prerequisites

- Node.js (LTS recommended)
- npm or Yarn
- Ruby + Bundler (for iOS CocoaPods)
- Xcode (for iOS)
- Android Studio + Android SDK (for Android)

## 2. Clone and Install

From project root:

```sh
cd app/mobile
npm install
```

If you use Yarn:

```sh
cd app/mobile
yarn
```

## 3. iOS Pod Install (iOS only)

```sh
cd app/mobile
bundle install
bundle exec pod install --project-directory=ios
```

## 4. Run React Native App

Use the official app startup instructions in:

- [app/mobile/README.md](app/mobile/README.md)

This includes:
- Starting Metro
- Running Android build
- Running iOS build

## 5. Notes

- Start Metro first, then launch platform builds in a separate terminal.
- If native dependencies change, run pod install again for iOS.
