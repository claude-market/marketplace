# Hierarchy and Focus

Visual hierarchy is how important elements appear in relation to one another. It is the most effective tool for making a design feel "professional."

## Strategies for Hierarchy

### 1. Size Isn't Everything
Do not rely solely on font size to denote importance.
- **Weight**: Make primary elements bolder (600/700) and secondary elements lighter (400). Avoid weights <400 for UI.
- **Color**: Use dark colors for primary content, grey for secondary, lighter grey for tertiary.
- **Example**: Instead of a tiny font size for a date, keep the size readable but make the color light grey.

### 2. De-emphasize to Emphasize
If a primary element doesn't stand out, do not make it louder. Instead, weaken the competing elements.
- **Backgrounds**: Remove background colors from secondary sidebars/containers so the main content pops.
- **Soft colors**: Turn valid but inactive navigation items into a soft grey rather than black.

### 3. Labels
Avoid `Label: Value` formats where possible.
- **Combine**: Instead of "In Stock: 12", use "12 left in stock".
- **Context**: If the format is obvious (email, phone, price), remove the label entirely.
- **Secondary**: If labels are required (e.g., data dashboards), treat them as supporting content (smaller, lighter weight, uppercase with letter-spacing) and emphasize the *data*.

### 4. Visual vs. Document Hierarchy
Web semantics (`h1`, `h2`, `h3`) should not dictate visual style.
- Section titles (like "Manage Account") are often just labels for the content below them. They should be small and subtle, not giant `h1` styled headers.

### 5. Balancing Weight and Contrast
- **Icons**: Icons are visually "heavy" (solid surface area). To balance an icon next to text, give the icon a softer color (lower contrast).
- **Borders**: If a hairline border (1px) is too subtle, do not just darken the color (which adds noise). Increase the width (2px) instead to add weight.

### 6. Semantics are Secondary
Design buttons based on hierarchy, not just semantics.
- **Primary**: Solid, high contrast background.
- **Secondary**: Outline style or low contrast background.
- **Tertiary**: Link style (no container).
- **Destructive**: If a "Delete" button is not the primary action, do not make it big and red. Make it a secondary/tertiary link. Use the red/bold styling only for the confirmation modal where it *is* the primary action.