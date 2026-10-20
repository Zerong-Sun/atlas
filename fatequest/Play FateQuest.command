#!/bin/zsh
set -e
cd -- "${0:A:h}"
exec /Applications/Godot.app/Contents/MacOS/Godot --path .
