import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom"],
  onSuccess: async () => {
    const { copyFile, readFile, writeFile } = await import("node:fs/promises");
    await copyFile("src/editor-styles.css", "dist/styles.css");

    for (const file of ["dist/index.js", "dist/index.cjs"]) {
      const content = await readFile(file, "utf8");
      if (!content.startsWith('"use client"')) {
        await writeFile(file, `"use client";\n${content}`);
      }
    }
  },
});
