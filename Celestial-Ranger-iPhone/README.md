# Celestial Ranger — iPhone beta project

Version 0.2.0. This is an iOS source project prepared for a cloud build and TestFlight setup. It is not a signed IPA or a live TestFlight release. It has not been compiled in Xcode or tested on a physical iPhone in this environment.

## Included

- Generated Capacitor 8.5.2 iOS project; locally bundled adventure, map and photos.
- Three-step onboarding and a personalized next-mission card.
- Five discoveries, trivia, stamps, route planning, field notes, eco rank and certificate.
- Five-tab navigation: Explore, Journal, Talk, Eco, More.
- Oakley and Fernan story chat with distinct authored replies, aware of progress.
- Native speech-to-text input (review before sending) and synthetic read-aloud replies.
- Native haptic feedback, share sheet, and device-local progress storage.
- Microphone/speech permission descriptions, app icon, launch background and privacy manifest.
- Unsigned simulator compile and signed TestFlight workflows for Codemagic.

## Current limits

Chat is an offline, intent-matched story experience, not free-form AI. No AI key or external AI service is connected. `RANGER_API_URL` is an optional future HTTPS endpoint contract (see docs/AI-CONTRACT.md); do not configure it until a secured backend is available. Kid mode always uses authored replies. Character voices use system speech, not cloned or professionally recorded voices.

Map, routes, distances, ordering and park status are simulated. No location tracking or live park data. Snack choices do not place orders. Progress and field notes stay on each device and are removed when the app is deleted. The public web preview is the previous version; this package is the separate iPhone upgrade.

## Build locally or in cloud

Node 22+, Xcode 26+, CocoaPods on a Mac/cloud Mac:

    npm ci
    npm run build
    npm run check
    npx cap sync ios
    npx cap open ios

Use App.xcworkspace, not App.xcodeproj. CocoaPods is required because the speech-recognition plugin does not supply Swift Package Manager support. Run pod installation on macOS through `cap sync ios`. Android can reuse the web app later, but no Android native project or Android validation is included.

Start with docs/START-HERE.md for the no-Mac release path.

## Validation completed here

- Production asset bundle built; Capacitor native asset sync completed.
- Automated DOM interaction checks passed for oath validation, onboarding, all five stamps, duplicate reward prevention, field notes, certificate, character switching, message escaping, snack reward prevention, and saved-state restoration.
- Native metadata/plists and workflow structure checked.
- Native compilation, rendering, microphone permissions, audio routes, signing, upload and Apple beta review remain to be completed on macOS/iPhone. Browser screenshot testing was unavailable here.

The original uploaded concept and embedded assets are preserved. Confirm your rights to supplied photography, character artwork and third-party branding before distributing to external testers; a fan-concept disclaimer does not establish those rights.
