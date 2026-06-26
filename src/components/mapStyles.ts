/**
 * Basemap styles for the map view.
 *
 * - `neutral`  — light, low-saturation basemap that blends with the shadcn
 *                neutral theme (current default).
 * - `color`    — original vivid Mapbox street style, kept on purpose so the
 *                "colorful map" direction isn't lost.
 *
 * Plan to revisit later (themed map pass):
 *   1. Build a custom style in Mapbox Studio whose land/water/road colors are
 *      derived from the design tokens (background / muted / border), so the map
 *      matches the app instead of relying on an off-the-shelf style.
 *   2. Add a light/dark pair and switch on the `.dark` class.
 *   3. Replace `ACTIVE_MAP_STYLE` with that custom style URL (or make it an
 *      env var, e.g. NEXT_PUBLIC_MAP_STYLE, for per-environment overrides).
 */
export const MAP_STYLES = {
  neutral: 'mapbox://styles/mapbox/light-v11',
  color: 'mapbox://styles/mapbox/streets-v12',
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

/** The basemap currently rendered. Switch to `MAP_STYLES.color` to go vivid. */
export const ACTIVE_MAP_STYLE: string = MAP_STYLES.neutral;
