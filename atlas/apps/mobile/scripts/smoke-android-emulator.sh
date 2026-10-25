#!/usr/bin/env bash
set -euo pipefail

apk="atlas/apps/mobile/release/Atlas-mobile-v0.1.1-Android.apk"
output="atlas/apps/mobile/release"
adb install -r "$apk"
adb shell monkey -p com.atlas.app 1

onboarding_visible=false
for _ in $(seq 1 18); do
  if adb shell pidof com.atlas.app >/dev/null 2>&1; then
    adb shell uiautomator dump /sdcard/atlas-window.xml >/dev/null 2>&1 || true
    if adb shell cat /sdcard/atlas-window.xml 2>/dev/null | grep -q '你想探索什么'; then
      onboarding_visible=true
      break
    fi
  fi
  sleep 5
done

adb shell screencap -p /sdcard/atlas-mobile-onboarding.png
adb pull /sdcard/atlas-mobile-onboarding.png "$output/atlas-mobile-onboarding.png" >/dev/null
if [ "$onboarding_visible" != true ]; then
  adb logcat -d -s AndroidRuntime:E ReactNativeJS:E | tail -100
  echo "Atlas onboarding was not visible in the Android emulator" >&2
  exit 1
fi

device_api=$(adb shell getprop ro.build.version.sdk | tr -d '\r')
printf '{"installed":true,"launched":true,"onboardingVisible":true,"apiLevel":"%s","screenshot":"atlas-mobile-onboarding.png"}\n' "$device_api" > "$output/emulator-smoke.json"
echo "Atlas Android APK launched and displayed onboarding in emulator API $device_api"
