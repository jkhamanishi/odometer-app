import { copyFile, mkdir, rm } from "node:fs/promises";
import { build } from "esbuild";

const distDir = "dist";

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  format: "iife",
  target: "es2020",
  outfile: `${distDir}/Code.js`,
});

await copyFile("src/appsscript.json", `${distDir}/appsscript.json`);