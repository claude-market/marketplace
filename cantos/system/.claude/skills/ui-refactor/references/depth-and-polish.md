# Depth, Images, and Finishing Touches

## Lighting and Shadows
Interfaces should emulate a physical light source (usually coming from the top).
- **Raised Elements**: Light top border (highlight), dark bottom shadow.
- **Inset Elements (Wells)**: Dark top shadow (or inner shadow), light bottom border.
- **Elevation System**: Define 5 shadows.
    - Small/Tight: Buttons (close to surface).
    - Medium: Dropdowns.
    - Large/Diffused: Modals (far from surface).
- **Two-Part Shadows**: Combine a large, soft, ambient shadow (general depth) with a tight, dark shadow (occlusion near the object).

## Flat Design Depth
- **Layers**: Overlap elements to create depth (e.g., a card floating halfway off a colored header background).
- **Color**: Lighter feels closer; darker feels further away.

## Images
- **Text Overlay**: Text on photos requires consistent contrast.
    - *Overlay*: Semi-transparent black (for light text).
    - *Lower Contrast*: Reduce the contrast of the background image itself.
    - *Colorize*: Desaturate image + multiply blend mode with a brand color.
- **Scaling**:
    - Do not scale up icons (they look blocky). Enclose small icons in a shape (circle/square) to fill space.
    - Do not scale down screenshots (text becomes unreadable). Re-create simplified "illustration" versions of the UI, or crop to a detail view.
- **User Content**: Always control aspect ratios. Use `background-size: cover` or object-fit constraints. Prevent color bleed by adding a subtle inner shadow (inset) to user uploaded images.

## Finishing Touches
- **Supercharge Defaults**: Replace standard bullets with checkmarks/icons. Style underlines on links.
- **Accent Borders**: Add a colorful 4px top-border to a bland card or alert to add personality without graphic design skills.
- **Backgrounds**: Use subtle repeating patterns or simple geometric shapes to break up large white backgrounds.
- **Empty States**: Never leave a container blank. Add an illustration and a primary call-to-action button (e.g., "Create your first project").