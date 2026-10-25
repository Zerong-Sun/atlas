import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const required = [
  "ATLAS_ANDROID_KEYSTORE_FILE",
  "ATLAS_ANDROID_KEYSTORE_PASSWORD",
  "ATLAS_ANDROID_KEY_ALIAS",
  "ATLAS_ANDROID_KEY_PASSWORD",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`${name} is required to sign the Android release`);
}

const file = fileURLToPath(new URL("../android/app/build.gradle", import.meta.url));
const source = await readFile(file, "utf8");
const signingStart = source.indexOf("    signingConfigs {");
const buildTypesStart = source.indexOf("    buildTypes {", signingStart);
const packagingStart = source.indexOf("    packagingOptions {", buildTypesStart);
if (signingStart < 0 || buildTypesStart < 0 || packagingStart < 0) {
  throw new Error("Unexpected generated build.gradle layout");
}

const signingSection = source.slice(signingStart, buildTypesStart);
if (!signingSection.includes("debug {") || signingSection.includes("release {")) {
  throw new Error("Expected a generated debug-only signing configuration");
}
const signedSection = signingSection.replace(/    }\n$/, `        release {
            storeType 'pkcs12'
            storeFile file(System.getenv('ATLAS_ANDROID_KEYSTORE_FILE'))
            storePassword System.getenv('ATLAS_ANDROID_KEYSTORE_PASSWORD')
            keyAlias System.getenv('ATLAS_ANDROID_KEY_ALIAS')
            keyPassword System.getenv('ATLAS_ANDROID_KEY_PASSWORD')
        }
    }
`);
if (signedSection === signingSection) throw new Error("Could not insert release signing configuration");

const buildSection = source.slice(buildTypesStart, packagingStart);
const releaseSection = buildSection.replace(/(        release \{[\s\S]*?)signingConfig signingConfigs\.debug/, "$1signingConfig signingConfigs.release");
if (releaseSection === buildSection) throw new Error("Could not replace the debug key in the release build");

await writeFile(file, source.slice(0, signingStart) + signedSection + releaseSection + source.slice(packagingStart));
console.log("Android release signing configured with the persistent upload key.");
