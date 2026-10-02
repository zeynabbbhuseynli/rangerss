# Get this beta onto your iPhone without owning a Mac

## What is ready

The project, bundled app, native plugin wiring and cloud-build configuration are prepared. There is no signed .ipa, uploaded build, or TestFlight invitation yet.

## What you need to supply

1. An active Apple Developer Program membership and access to App Store Connect.
2. A private Git repository containing the contents of this ZIP, and a Codemagic account connected to that repository. Do not commit signing keys or passwords. Cloud builds may incur charges; review the provider's plan before starting.
3. In Apple Developer, register `com.zeynabhuseynli.celestialranger` if available, then create an iOS app record in App Store Connect with that exact bundle identifier. If you change it, update capacitor.config.json, both native PRODUCT_BUNDLE_IDENTIFIER entries, and codemagic.yaml together.
4. An App Store Connect API integration in Codemagic named `ranger-apple`, plus the Apple Distribution certificate and App Store provisioning profile. Enter all keys directly in the provider's secure settings, never in chat or the source files.
5. A Codemagic environment group named `ranger_release` containing `APP_STORE_APPLE_ID`, the numeric Apple ID from your app record. This is not your personal Apple Account email.

## Run the builds

1. Select `ios-validate` first. It installs dependencies, checks app behavior, and compiles an unsigned simulator build. No Apple credentials are needed for this workflow. Resolve any macOS compiler errors before proceeding.
2. Run `ios-testflight`. It builds and signs the iPhone app, uploads it, and requests TestFlight processing. It explicitly does not submit a public App Store release.
3. In App Store Connect, finish beta details, contact information, export-compliance questions, and test instructions using the draft in BETA-NOTES.md. Verify all declarations against the final build.
4. Add yourself to an internal tester group and select the processed build. Install Apple's TestFlight app on your iPhone and accept the invitation.
5. Complete DEVICE-CHECKS.md. For people outside your App Store Connect team, create an external group and request Apple's beta review when prompted. After approval, enable a public TestFlight invitation link or invite testers through Apple. No invitations have been sent by this project.

## Character conversations

The first beta works offline with authored replies to greetings, mission questions, clues, facts, progress, and breaks. Speaking fills the message box; sending asks the character. Turn on Read replies aloud to hear the response. Open-ended AI is not connected. Apple speech recognition may need connectivity depending on device/language.

## Official references

- https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/
- https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/
- https://capacitorjs.com/docs/ios
- https://docs.codemagic.io/yaml-quick-start/building-an-ionic-app/
- https://docs.codemagic.io/yaml-code-signing/signing-ios/
