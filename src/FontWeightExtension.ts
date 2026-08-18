import { Extension } from "@tiptap/core";
import "@tiptap/extension-text-style";

export type FontWeightOptions = {
  types: string[];
};

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fontWeight: {
      /**
       * Set an explicit font weight (e.g. "400", "700") on the selection.
       * Unlike `toggleBold` (which adds/removes a semantic <strong> mark),
       * this writes an inline `font-weight` style. It exists mainly to let
       * headings — whose bold look normally comes from block-level CSS,
       * not from a mark — be switched back to a normal weight, since a
       * <strong> mark alone can't override a heading's own font-weight.
       */
      setFontWeight: (weight: string) => ReturnType;
      /**
       * Remove the explicit font weight override, reverting to whatever
       * weight the surrounding block (paragraph, heading, ...) uses by
       * default.
       */
      unsetFontWeight: () => ReturnType;
    };
  }
}

export const FontWeight = Extension.create<FontWeightOptions>({
  name: "fontWeight",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontWeight: {
            default: null,
            parseHTML: (element: HTMLElement) =>
              element.style.fontWeight?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes: { fontWeight?: string }) => {
              if (!attributes.fontWeight) {
                return {};
              }

              return {
                style: `font-weight: ${attributes.fontWeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontWeight:
        (fontWeight: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontWeight }).run();
        },
      unsetFontWeight:
        () =>
        ({ chain }: any) => {
          return chain()
            .setMark("textStyle", { fontWeight: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});
