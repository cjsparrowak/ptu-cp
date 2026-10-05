# Program Audit, Coach Fix, and Themes

## Goal
Make every displayed C example technically sound, keep the floating coach easy to reach, and support polished light and dark viewing modes.

## Changes
- Review all 20 lesson snippets for syntax, braces, declarations, output accuracy, and misleading explanations; correct any genuine errors while preserving the lab sequence.
- Move the desktop coach launcher and open panel away from fixed lesson controls, keep the launcher visible, and add stronger elevation plus clear hover/focus movement.
- Add a compact sun/moon theme control to the main game and full coach page.
- Save the selected theme in the browser and use the system preference on a learner’s first visit.
- Define a complete light palette while retaining the current dark PTU palette and readable code/terminal colors.

## Verification
- Compile representative complete versions of the lesson snippets where feasible and manually validate conceptual fragments.
- Test the coach launcher and panel on desktop and mobile, including lesson navigation controls.
- Check both themes on the mission map, lesson player, Viva Arena, floating coach, and full coach page.
- Confirm page metadata and the latest app health report remain clean.

## Technical details
- Keep curriculum content data-driven in the existing curriculum module.
- Apply the theme class before hydration where possible to avoid a visible color flash.
- Use existing semantic color tokens and button components; no backend or account changes.