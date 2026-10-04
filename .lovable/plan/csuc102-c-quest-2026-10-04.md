# CSUC102 C Quest

## Goal
Turn the uploaded PTU Computer Programming Laboratory manual into a mobile-first learning game that teaches each C program line by line through short, interactive challenges.

## Experience
- A polished dark, Apple-like interface using PTU red, blue, and gold accents.
- PTU crest and course identity in the top bar; no Lovable watermark or branding.
- A 20-experiment quest map covering all programs in the manual, grouped by Foundations, Logic, Data, Memory, Records, and Functions.
- A focused lesson player with code on one side and an animated memory/output visualizer on the other.
- Line-by-line explanations tied to the currently highlighted code line.
- Three playable challenge types: predict the output, arrange code lines, and choose the correct explanation.
- XP, lives, streaks, progress rings, completion states, celebratory feedback, and a viva-question practice mode.
- Local progress persistence so learners can continue where they stopped without requiring sign-in.

## Content
- Use the manual’s experiment sequence, aims, concepts, representative code, expected output, and viva material.
- Provide rich playable lessons for core concepts and concise concept cards for the complete 20-experiment syllabus.
- Correct obvious extraction/printing mistakes in displayed teaching code where necessary, while remaining faithful to the intended program.

## Technical details
- Build the experience at `/` with React and TanStack Start.
- Keep curriculum data separate from the lesson interface for maintainability.
- Use semantic design tokens in the global stylesheet and existing design-system controls.
- Extract the PTU crest from the uploaded manual for use as an app asset.
- Persist progress in browser storage after hydration.
- Add complete page metadata and verify desktop and mobile rendering plus the core lesson flow.
