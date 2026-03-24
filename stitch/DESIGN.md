# Design System Specification: The Authoritative Canvas

## 1. Overview & Creative North Star
**Creative North Star: "The Editorial Monolith"**

To design for a government entity is to design for trust, but "trust" should not be synonymous with "generic." This design system rejects the cluttered, line-heavy aesthetic of traditional bureaucracy in favor of an **Editorial Monolith** approach. We treat the dashboard not as a software interface, but as a high-end digital publication—authoritative, expansive, and impeccably organized.

By utilizing intentional asymmetry, extreme typographic scale, and tonal depth, we move away from "template" layouts. We create impact through breathing room (white space) and the confident use of heavy primary blocks contrasted against "Ice White" surfaces.

---

## 2. Colors & Surface Logic
The palette is rooted in a deep, patriotic blue and a functional, high-visibility yellow. However, the sophistication lies in the neutral "Ice White" foundations and how they layer.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Traditional boxes feel restrictive and dated. Instead, define boundaries through background shifts.
*   **Example:** A `surface_container_low` sidebar sitting against a `surface` background creates a clear, sophisticated boundary without a single stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of premium cardstock.
*   **Base Layer:** `surface` (#f7fafc)
*   **Secondary Sections:** `surface_container_low` (#f1f4f6)
*   **Floating Cards:** `surface_container_lowest` (#ffffff)
*   **Interactive Elements:** Use `surface_container_high` (#e5e9eb) to indicate "pressed" or "active" depth.

### The "Glass & Gradient" Rule
To prevent the deep blue from feeling "flat," use subtle radial gradients.
*   **Taskbar/Header:** Transition from `primary` (#001e40) to `primary_container` (#003366) at a 45-degree angle. This adds a "soul" to the header that feels metallic and high-end.
*   **Floating Elements:** Use `surface_container_lowest` with a 80% opacity and a `20px` backdrop-blur for notifications or dropdowns to create a "frosted glass" effect.

---

## 3. Typography: The Voice of Authority
We pair **Public Sans** (Display/Headlines) for its sturdy, institutional feel with **Inter** (Body/Labels) for its modern technical precision.

*   **Display-LG (Public Sans, 3.5rem):** Reserved for high-level data totals or welcome headers. Use `on_background` (#181c1e) with -0.02em letter spacing.
*   **Headline-MD (Public Sans, 1.75rem):** For section headers. This is the "editorial" anchor of each page.
*   **Body-LG (Inter, 1rem):** Standard reading text. Ensure a line-height of 1.6 for maximum accessibility.
*   **Label-MD (Inter, 0.75rem):** Always uppercase with +0.05em tracking when used for metadata or category tags.

---

## 4. Elevation & Depth
Depth is achieved through **Tonal Layering**, not structural scaffolding.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background. This creates a soft, natural lift.
*   **Ambient Shadows:** For "Floating" states (e.g., a modal or a primary CTA hover), use a shadow: `0 20px 40px rgba(0, 30, 64, 0.06)`. Note the tint—we use a hint of the `primary` blue, never pure black, to keep the shadow feeling like natural ambient light.
*   **The Ghost Border:** If a separator is required for accessibility, use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons: High-Visibility Utility
*   **Primary:** Background: `secondary_container` (#fcd400) | Text: `on_secondary_container` (#6e5c00). Roundness: `md` (0.375rem). The yellow is our functional beacon.
*   **Secondary:** Background: `primary` (#001e40) | Text: `on_primary` (#ffffff). For authoritative actions.
*   **Tertiary:** No background. Text: `primary`. Use for "Cancel" or "Back" actions.

### Cards & Data Lists
*   **Constraint:** Forbid the use of divider lines.
*   **Style:** Separate list items using a `12` (3rem) vertical gap from the Spacing Scale. If items must be grouped, use a subtle `surface_container_low` background for every second item (zebra striping) rather than a line.

### Input Fields
*   **Style:** Use "Quiet" inputs. No background color—only a `bottom-border` using `outline_variant`. On focus, the border transitions to `primary` (#001e40) with a thickness of 2px.

### Navigation (The Monolith Header)
*   The header should be a solid block of `primary`. 
*   Active states: Use a `secondary_fixed` (#ffe16d) 4px bottom-bar on the active nav item.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme white space. If you think there’s enough room between sections, double it.
*   **Do** align text to a strict baseline grid to maintain the "Editorial" feel.
*   **Do** use the `secondary` (Yellow) sparingly. It is a "laser pointer" for the user's eye; overusing it diminishes its power.

### Don’t:
*   **Don’t** use shadows on every card. Reserve shadows only for elements that truly "float" over the content (modals, tooltips).
*   **Don’t** use 100% black text. Use `on_surface` (#181c1e) to maintain a premium, softer contrast against the Ice White.
*   **Don’t** use "Rounded-Full" (pills) for buttons. Stick to `md` (0.375rem) to maintain a structured, architectural look.