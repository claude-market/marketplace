# Layout and Spacing

## Spacing Systems
Do not use arbitrary values (e.g., 123px).
- **Linear scales fail**: The difference between 12px and 16px is huge; the difference between 100px and 104px is invisible.
- **The System**: Start with a base (e.g., 16px). Create a scale where no two values are closer than ~25%.
    - *Example Scale*: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Workflow**: Need space? Grab the next value on the scale. Not enough? Jump two steps.

## White Space
- **Start with too much**: Give elements too much room, then remove until it looks "not bad."
- **Separate groups**: Ensure space *between* groups is larger than space *within* groups.
    - *Ambiguity*: If a label's bottom margin equals the input's bottom margin, the relationship is unclear. Double the space between the input and the next label.

## Sizing and Grids
- **Shrink the Canvas**: Do not fill the screen just because you have 1400px. If a form needs 600px, use 600px.
- **Grids are Overrated**: Do not force everything into percentage-based columns (e.g., 12-column grids).
    - *Sidebars*: Should usually be fixed width (optimized for their content), while the main content flexes.
- **Responsive Design**:
    - Use `max-width` rather than percentages. Only shrink elements when the screen gets smaller than the element's ideal size.
    - **Relative sizing fails**: Do not use `em` for layout widths. Elements large on desktop should shrink *faster* than small elements on mobile. Sizing relationships are not linear across viewports.

## Density
- **Refactoring**: Dense UIs (dashboards) are valid, but must be a deliberate choice.
- **Columns**: If a form feels too narrow/empty, split supporting text into a side column rather than widening the input fields.