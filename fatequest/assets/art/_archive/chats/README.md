# Chat image archive

Dump of **all generated variants** from ChatGPT art conversations (not just the filenames promoted into `assets/art/`).

- Location: `assets/art/_archive/chats/<chat-id>/`
- Each chat folder: `img-NN-<hash>.webp` + `meta.json` (url, title, user prompt snippets)
- Index: `index.json`

Generated **2026-07-24** via `scripts/archive_chat_images.py`.

Production assets under `assets/art/*.webp` are separately curated (resized / dealpha / strip_checker). This archive keeps raw variants for safekeeping.
