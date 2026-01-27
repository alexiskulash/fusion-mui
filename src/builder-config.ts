import { Builder } from "@builder.io/react";
import { brand, gray, green, orange, red } from "./shared-theme/themePrimitives";

Builder.register("editor.settings", {
  styleStrictMode: true,
  designTokens: {
    colors: [
      // Brand colors
      { name: "Brand 50", value: brand[50] },
      { name: "Brand 100", value: brand[100] },
      { name: "Brand 200", value: brand[200] },
      { name: "Brand 300", value: brand[300] },
      { name: "Brand 400", value: brand[400] },
      { name: "Brand 500", value: brand[500] },
      { name: "Brand 600", value: brand[600] },
      { name: "Brand 700", value: brand[700] },
      { name: "Brand 800", value: brand[800] },
      { name: "Brand 900", value: brand[900] },

      // Gray colors
      { name: "Gray 50", value: gray[50] },
      { name: "Gray 100", value: gray[100] },
      { name: "Gray 200", value: gray[200] },
      { name: "Gray 300", value: gray[300] },
      { name: "Gray 400", value: gray[400] },
      { name: "Gray 500", value: gray[500] },
      { name: "Gray 600", value: gray[600] },
      { name: "Gray 700", value: gray[700] },
      { name: "Gray 800", value: gray[800] },
      { name: "Gray 900", value: gray[900] },

      // Green colors
      { name: "Green 50", value: green[50] },
      { name: "Green 100", value: green[100] },
      { name: "Green 200", value: green[200] },
      { name: "Green 300", value: green[300] },
      { name: "Green 400", value: green[400] },
      { name: "Green 500", value: green[500] },
      { name: "Green 600", value: green[600] },
      { name: "Green 700", value: green[700] },
      { name: "Green 800", value: green[800] },
      { name: "Green 900", value: green[900] },

      // Orange colors
      { name: "Orange 50", value: orange[50] },
      { name: "Orange 100", value: orange[100] },
      { name: "Orange 200", value: orange[200] },
      { name: "Orange 300", value: orange[300] },
      { name: "Orange 400", value: orange[400] },
      { name: "Orange 500", value: orange[500] },
      { name: "Orange 600", value: orange[600] },
      { name: "Orange 700", value: orange[700] },
      { name: "Orange 800", value: orange[800] },
      { name: "Orange 900", value: orange[900] },

      // Red colors
      { name: "Red 50", value: red[50] },
      { name: "Red 100", value: red[100] },
      { name: "Red 200", value: red[200] },
      { name: "Red 300", value: red[300] },
      { name: "Red 400", value: red[400] },
      { name: "Red 500", value: red[500] },
      { name: "Red 600", value: red[600] },
      { name: "Red 700", value: red[700] },
      { name: "Red 800", value: red[800] },
      { name: "Red 900", value: red[900] },

      // Semantic colors (using MUI CSS variables)
      { name: "Background Default", value: "var(--template-palette-background-default)" },
      { name: "Background Paper", value: "var(--template-palette-background-paper)" },
      { name: "Text Primary", value: "var(--template-palette-text-primary)" },
      { name: "Text Secondary", value: "var(--template-palette-text-secondary)" },
      { name: "Primary Main", value: "var(--template-palette-primary-main)" },
      { name: "Primary Light", value: "var(--template-palette-primary-light)" },
      { name: "Primary Dark", value: "var(--template-palette-primary-dark)" },
      { name: "Divider", value: "var(--template-palette-divider)" },
    ],
    spacing: [
      // MUI spacing scale (8px base)
      { name: "XXS", value: "4px" }, // 0.5 spacing unit
      { name: "XS", value: "8px" }, // 1 spacing unit
      { name: "Small", value: "16px" }, // 2 spacing units
      { name: "Medium", value: "24px" }, // 3 spacing units
      { name: "Large", value: "32px" }, // 4 spacing units
      { name: "XL", value: "40px" }, // 5 spacing units
      { name: "XXL", value: "48px" }, // 6 spacing units
      { name: "3XL", value: "64px" }, // 8 spacing units
    ],
    fontFamily: [
      { name: "Primary Font", value: "Inter, sans-serif" },
    ],
    fontSize: [
      { name: "H1", value: "48px" },
      { name: "H2", value: "36px" },
      { name: "H3", value: "30px" },
      { name: "H4", value: "24px" },
      { name: "H5", value: "20px" },
      { name: "H6", value: "18px" },
      { name: "Subtitle 1", value: "18px" },
      { name: "Subtitle 2", value: "14px" },
      { name: "Body 1", value: "14px" },
      { name: "Body 2", value: "14px" },
      { name: "Caption", value: "12px" },
    ],
    borderRadius: [
      { name: "Default", value: "8px" },
      { name: "Small", value: "4px" },
      { name: "Large", value: "12px" },
      { name: "Round", value: "50%" },
    ],
  },
});
