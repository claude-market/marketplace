# Typography

## Type Scales
Do not use linear pixel increments or mathematical ratios (Golden Ratio) that result in fractional pixels (33.14px).
- **Hand-picked scale**: Select a set of sizes that work well.
    - *Example*: 12, 14, 16, 18, 20, 24, 30, 36, 48, 60, 72.
- **Avoid ems for size**: Use `px` or `rem` for font-size to guarantee you stay on the system. `em` compounds deeply nested sizes unpredictably.

## Font Selection
- **Safe Bet**: Neutral sans-serifs (system stack, Helvetica, Roboto).
- **Criteria**:
    - Choose fonts with 5+ weights (indicates quality).
    - Avoid condensed fonts with short x-heights for UI body text.
    - Trust popular fonts (Google Fonts sort by popularity).

## Line Height
Line height is **inversely proportional** to font size and line length.
- **Body text**: Needs taller line height (~1.5 to 1.7).
- **Headings**: Large text needs tighter line height (~1.0 to 1.2).
- **Line Length**: Wide paragraphs need more line height to help the eye track back. Narrow columns can use tighter spacing.
- **Optimal Length**: 45-75 characters per line.

## Alignment
- **Left Align**: The standard for readability.
- **Justified**: Avoid on web unless hyphenation is enabled; creates ugly "rivers" of white space.
- **Center**: Only for headlines or very short text blocks (2-3 lines max).
- **Numbers**: Always right-align tabular numbers/prices for comparison.
- **Baseline**: When mixing font sizes on a single row (e.g. "Price" and "$19"), align by baseline, not vertical center.

## Letter Spacing
- **Headlines**: Tighten spacing slightly for large, display text.
- **All Caps**: Increase spacing (tracking) to improve readability.