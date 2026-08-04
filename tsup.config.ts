import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom"],
  injectStyle: false,
  onSuccess: async () => {
    const { readFile, writeFile } = await import("node:fs/promises");
    for (const file of ["dist/index.js", "dist/index.cjs"]) {
      const content = await readFile(file, "utf8");
      if (!content.startsWith('"use client"')) {
        await writeFile(file, `"use client";\n${content}`);
      }
    }
  },
});
