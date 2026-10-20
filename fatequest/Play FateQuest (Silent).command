#!/bin/zsh
set -e
cd -- "${0:A:h}"
echo "无声测试模式：跳过系统音频设备初始化；画面、操作及存档功能保持可用。"
exec /Applications/Godot.app/Contents/MacOS/Godot --path . --audio-driver Dummy
