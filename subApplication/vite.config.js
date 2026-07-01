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
  entryFileNames: "agent_[hash].js",
  chunkFileNames: "[name].[hash].js",
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

  if (userConfig.entryFileNames) {
    if (typeof userConfig.entryFileNames !== "string") {
      console.error("entryFileNames 必须是字符串类型");
    } else {
      buildConfig.entryFileNames = userConfig.entryFileNames.includes(".js")
        ? userConfig.entryFileNames.replace(".js", ".[hash].js")
        : `${userConfig.entryFileNames}.[hash].js`;
    }
  }

  if (userConfig.manualChunks) {
    if (typeof userConfig.manualChunks !== "object" || Array.isArray(userConfig.manualChunks)) {
      console.error("配置错误：manualChunks必须是对象格式");
    } else if (!Object.values(userConfig.manualChunks).every(v => Array.isArray(v) && v.length > 0)) {
      console.error("配置错误：manualChunks对象的值必须是字符串数组");
    } else {
      buildConfig.manualChunks = userConfig.manualChunks;
    }
  }
  
  if (userConfig.format) {
    buildConfig.format = userConfig.format;
  }
  if (userConfig.outDir) {
    buildConfig.outDir = userConfig.outDir;
  }
}

const chunkNameCache = {};

function getChunkName(packages) {
  const cacheKey = packages.sort().join(",");
  
  if (chunkNameCache[cacheKey]) {
    return chunkNameCache[cacheKey];
  }
  
  const md5s = packages.map((pkg) => {
    try {
      const pkgPath = path.resolve(`node_modules/${pkg}/package.json`);
      if (!fs.existsSync(pkgPath)) {
        console.warn(`Warning: ${pkgPath} not found, using package name as fallback`);
        return md5(pkg);
      }
      return md5(fs.readFileSync(pkgPath, "utf-8"));
    } catch (error) {
      console.error(`Error reading ${pkg}/package.json:`, error.message);
      return md5(pkg);
    }
  });
  
  const result = md5s.length === 1 ? md5s[0] : md5(md5s.join(""));
  chunkNameCache[cacheKey] = result;
  return result;
}

export default defineConfig({
  plugins: [vue(), cssInjectedByJsPlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // ========== 关键：定义 process.env 环境变量 ==========
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  build: {
    outDir: buildConfig.outDir,
    cssCodeSplit: buildConfig.cssCodeSplit,
    lib: {
      entry: buildConfig.input,
      formats: [buildConfig.format],
      fileName: () => {
        const hash = Date.now().toString(36);
        return buildConfig.entryFileNames.replace('[hash]', hash);
      },
    },
    rollupOptions: {
      output: {
        format: buildConfig.format,
        entryFileNames: buildConfig.entryFileNames,
        chunkFileNames: buildConfig.chunkFileNames,
        minChunkSize: buildConfig.minChunkSize,
        manualChunks(id) {
          if (buildConfig.manualChunks) {
            for (const [chunkName, packages] of Object.entries(buildConfig.manualChunks)) {
              for (const pkg of packages) {
                if (id.includes(`node_modules/${pkg}`)) {
                  const hash = getChunkName(packages);
                  return `${chunkName}_${hash}`;
                }
              }
            }
          }
          
          const packageJson = path.resolve(`./package.json`);
          
          if (id.includes("node_modules")) {
            let pkgContent = "{}";
            try {
              pkgContent = fs.readFileSync(packageJson, "utf-8");
            } catch (e) {
              console.warn("无法读取 package.json");
            }
            return `${buildConfig.vendorName}_${md5(pkgContent)}`;
          }
          
          return undefined;
        },
      },
    },
  },
  server: {
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});