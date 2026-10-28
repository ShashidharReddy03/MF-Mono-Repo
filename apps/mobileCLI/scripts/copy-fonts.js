/**
 * Copies brand TTFs from @expo-google-fonts into app and Android assets.
 */
const fs = require("fs");
const path = require("path");

const dest = path.join(__dirname, "..", "assets", "fonts");
const androidDest = path.join(__dirname, "..", "android", "app", "src", "main", "assets", "fonts");

const resolvePkg = (pkg) => path.dirname(require.resolve(`${pkg}/package.json`));

const files = [
  ["@expo-google-fonts/montserrat", "400Regular/Montserrat_400Regular.ttf", "Montserrat-Regular.ttf"],
  ["@expo-google-fonts/montserrat", "500Medium/Montserrat_500Medium.ttf", "Montserrat-Medium.ttf"],
  ["@expo-google-fonts/montserrat", "600SemiBold/Montserrat_600SemiBold.ttf", "Montserrat-SemiBold.ttf"],
  ["@expo-google-fonts/montserrat", "700Bold/Montserrat_700Bold.ttf", "Montserrat-Bold.ttf"],
  ["@expo-google-fonts/noto-sans-arabic", "400Regular/NotoSansArabic_400Regular.ttf", "NotoSansArabic-Regular.ttf"],
  ["@expo-google-fonts/noto-sans-arabic", "500Medium/NotoSansArabic_500Medium.ttf", "NotoSansArabic-Medium.ttf"],
  ["@expo-google-fonts/noto-sans-arabic", "600SemiBold/NotoSansArabic_600SemiBold.ttf", "NotoSansArabic-SemiBold.ttf"],
  ["@expo-google-fonts/noto-sans-arabic", "700Bold/NotoSansArabic_700Bold.ttf", "NotoSansArabic-Bold.ttf"],
];

fs.mkdirSync(dest, { recursive: true });
fs.mkdirSync(androidDest, { recursive: true });

let copied = 0;
for (const [pkg, rel, name] of files) {
  try {
    const src = path.join(resolvePkg(pkg), rel);
    if (!fs.existsSync(src)) {
      console.warn(`[copy-fonts] missing ${src}`);
      continue;
    }
    fs.copyFileSync(src, path.join(dest, name));
    fs.copyFileSync(src, path.join(androidDest, name));
    copied += 1;
  } catch (e) {
    console.warn(`[copy-fonts] skip ${name}: ${e.message}`);
  }
}
console.log(`[copy-fonts] copied ${copied}/${files.length} fonts`);
