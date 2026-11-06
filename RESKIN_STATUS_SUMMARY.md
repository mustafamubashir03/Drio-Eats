All re-skin tasks are complete. See the earlier conversation checkpoint for the full re-skin report. The Better Auth fix report is at FIX_AUTH_MISSING_ORIGIN_REPORT.md. 

Key re-skin status:
- @expo-google-fonts/poppins installed and loaded via useFonts in _layout.tsx
- Light CTA: lime #ECFF7F fill + onAccent #0C1600 label + 1px limeDeep border at 40% opacity (#4F660066) — flagged for visual approval
- Timeline dots: timeline.done (dark #00BE40 / light #008A30), timeline.pending (dark #525252 / light #C9CCD1)
- Text: textMuted → text.tertiary (dark #94969A, light #5F626B); textSubtle → text.muted; text.secondary added where applicable
- Surfaces: Dark → #0D0D0D surface/elevated/card with #3A3A3A 1px border; surfaceAlt → #1C1D21; Light → #FFFFFF surface/elevated; surfaceAlt → #EEF0F3; border/divider → #E3E5E8
- Spacing: list row gaps 14→12; divider margins 14→16; card padding 18→16; section gaps →24
- Font sizes by role remapped per decisions; weights: 800/700 → 500/600
- Avatar: 42→44 only (md)
- Card radius: 22→20; Badge radius: 8→999; Button radius: 16→999 (pill); AuthScaffold hero radius: 30→28
- CTA height lg: 58→60; md/lg font: 15/16 → 16/22 SemiBold 600
- Contrast script run and output pasted; corrected earlier "20.4:1" claim to actual 19.68:1 for #FFFFFF on #0B0B0B
- tsc: clean; lint: clean; web export: success

NOT verified on native for the Auth origin issue — requires native client testing.