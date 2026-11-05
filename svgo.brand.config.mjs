// Config for the `optimize:brand` script. Optimizes COPIES of brand/*.svg into
// src/assets/brand/ — the brand/ masters are read-only and never touched.
// Preserves viewBox, fills, and the role/aria-label the marks ship with so the
// rendered output is visually identical; precision capped at 2 decimals.
export default {
  multipass: true,
  floatPrecision: 2,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // Keep viewBox — the marks have no width/height and rely on it.
          removeViewBox: false,
          // Keep role="img" / aria-label="Aditeraction" accessibility hooks.
          removeUnknownsAndDefaults: {
            keepRoleAttr: true,
            keepAriaAttrs: true,
          },
        },
      },
    },
  ],
};
