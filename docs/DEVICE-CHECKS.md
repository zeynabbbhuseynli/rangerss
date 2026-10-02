# Required device checks before external testing

These checks are pending; automated DOM tests do not replace them.

- Compile on Xcode 26+; resolve CocoaPods successfully with all five plugins.
- Inspect the first screen, all five tabs, safe areas and the keyboard on a small iPhone and a recent large iPhone. Confirm no horizontal clipping at larger accessibility text sizes.
- Test VoiceOver labels and focus order, reduced motion, landscape, and keyboard dismissal.
- Complete all five stamps; verify no duplicate points from repeated taps or snack choices.
- Add notes, force close, relaunch and resume. Start a new adventure and verify deletion.
- Airplane mode: bundled story, map, journal and authored chat work. Speech availability may vary; keyboard input must remain usable.
- Deny microphone and speech access: no crash, actionable message, typing still works.
- Allow speech access, speak, stop, and inspect/edit the transcript before Send. Confirm the recording indicator ends on Stop, navigation, timeout and app backgrounding.
- Turn read-aloud on/off, interrupt it, switch characters, and test with silent mode/Bluetooth headphones.
- Share the certificate and cancel sharing. Confirm the share sheet anchors correctly.
- Confirm native icon and launch background, permissions descriptions and privacy manifest inclusion in the archive.
- Complete Apple beta review and branding/photo rights checks before external distribution.
