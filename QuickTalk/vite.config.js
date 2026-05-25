import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import vue from "@vitejs/plugin-vue";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";
import md5 from "md5";

// 默认配置
let defaultConfig = {
  outDir: "dist",
  entryFileNames: "agent",
  chunkFileNames: "[name].js",
  format: "es",
  minChunkSize: 5000,
  vendorName: "vendor",
  cssCodeSplit: false,
  input: "src/main.js",
  manualChunks: null,
};
let buildConfig = { ...defaultConfig };
const configPath = path.resolve(process.cwd(), "build.config.json");

if (fs.existsSync(configPath)) {
  const userConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

  // 如果没有配置，直接跳过
  if (!userConfig.entryFileNames) {
    // 什么都不做
  } else if (typeof userConfig.entryFileNames !== "string") {
    console.error("entryFileNames 必须是字符串类型");
  } else {
    buildConfig.entryFileNames = userConfig.entryFileNames.includes(".js")
      ? userConfig.entryFileNames.replace(".js", `_${Date.now()}.js`)
      : `${userConfig.entryFileNames}_${Date.now()}.js`;
  }

  // 如果没有配置，直接跳过
  if (!userConfig.manualChunks) {
    // 什么都不做
  } else if (
    typeof userConfig.manualChunks !== "object" ||
    Array.isArray(userConfig.manualChunks)
  ) {
    console.error("配置错误：manualChunks必须是对象格式");
  } else if (
    !Object.values(userConfig.manualChunks).every(
      (v) => Array.isArray(v) && v.length > 0,
    )
  ) {
    console.error("配置错误：manualChunks对象的值必须是字符串数组");
  } else {
    buildConfig.manualChunks = userConfig.manualChunks;
  }
}

// 在文件顶部添加缓存对象
const chunkNameCache = {};
function getChunkName(packages) {
  const cacheKey = packages.sort().join(",");

  if (chunkNameCache[cacheKey]) {
    return chunkNameCache[cacheKey];
  }

  // 添加错误处理
  const md5s = packages.map((pkg) => {
    try {
      const pkgPath = path.resolve(`node_modules/${pkg}/package.json`);
      if (!fs.existsSync(pkgPath)) {
        console.warn(
          `Warning: ${pkgPath} not found, using package name as fallback`,
        );
        return md5(pkg);
      }
      return md5(fs.readFileSync(pkgPath, "utf-8"));
    } catch (error) {
      console.error(`Error reading ${pkg}/package.json:`, error.message);
      return md5(pkg); // fallback
    }
  });

  const result = md5s.length === 1 ? md5s[0] : md5(md5s.join(""));
  chunkNameCache[cacheKey] = result;
  return result;
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: buildConfig.outDir,
    cssCodeSplit: buildConfig.cssCodeSplit,
    rollupOptions: {
      input: buildConfig.input,
      output: {
        entryFileNames: buildConfig.entryFileNames,
        chunkFileNames: buildConfig.chunkFileNames, // 配置 非入口代码块（chunk）的文件命名规则
        format: buildConfig.format,
        minChunkSize: buildConfig.minChunkSize,
        manualChunks(id) {
          // 1. 优先处理自定义分包规则
          if (buildConfig.manualChunks) {
            for (const [chunkName, packages] of Object.entries(
              buildConfig.manualChunks,
            )) {
              // 检查当前模块是否属于指定的包
              for (const pkg of packages) {

                if (id.includes(`node_modules/${pkg}`)) {
                  // 使用 getChunkName 生成基于包内容的 hash
                  const hash = getChunkName(packages);
                  return `${chunkName}_${hash}`;
                }
              }
            }
          }
          const packageJson = path.resolve(`./package.json`);

          // 2. 处理默认分包规则
          if (id.includes("node_modules")) {
            return `${buildConfig.vendorName}_${md5(fs.readFileSync(packageJson, "utf-8"))}`;
          }

          return undefined;
        },
      },
    },
  },
});
