# Audio assets

Generated / composed per `docs/AUDIO_PLAN.md` §7.

## Stems (5 cultures × 4 layers × 60s mono OGG ~96 kbps)

| Culture | drone | pulse | melody | color |
|---|---|---|---|---|
| `islamic` | `stems/islamic/drone.ogg` | `stems/islamic/pulse.ogg` | `stems/islamic/melody.ogg` | `stems/islamic/color.ogg` |
| `east_asia` | `stems/east_asia/drone.ogg` | `stems/east_asia/pulse.ogg` | `stems/east_asia/melody.ogg` | `stems/east_asia/color.ogg` |
| `steppe` | `stems/steppe/drone.ogg` | `stems/steppe/pulse.ogg` | `stems/steppe/melody.ogg` | `stems/steppe/color.ogg` |
| `indian_ocean` | `stems/indian_ocean/drone.ogg` | `stems/indian_ocean/pulse.ogg` | `stems/indian_ocean/melody.ogg` | `stems/indian_ocean/color.ogg` |
| `latin` | `stems/latin/drone.ogg` | `stems/latin/pulse.ogg` | `stems/latin/melody.ogg` | `stems/latin/color.ogg` |

- **drone / pulse**: procedural synth (`tools/audio/generate_all.py`)
- **melody / color**: richer hybrid synth (`tools/audio/generate_melody_color.py`)

## Ambient (12 scene beds + 5 sacred_blur)

| File | Source |
|---|---|
| `ambient/wind_sand.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/waves.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/ropes_mast.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/market_crowd.ogg` | CC0 BigSoundBank → `compose_loops.py` (low-passed; no intelligible speech) |
| `ambient/camel_bells.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/horse_hooves.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/river.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/rain.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/fire.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/footsteps_echo.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/dishes.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/seabirds.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/sacred_blur_*.ogg` (×5) | procedural formant blur (`generate_all.py`) — §1 allowed gesture |

Provenance for CC0 downloads: `tools/audio/_cc0_cache/SOURCES.json` (gitignored cache; regenerate via `fetch_cc0.py`).

## Notes

- Scales are **secular gestures** (AUDIO_PLAN §1), not faithful maqām/rāga/chant.
- No adhān, Qur'ān, liturgical chant, or sacred recitation.
- Procedural UI SFX (bell, coin, dice, …) stay in `game/audio/` at runtime (§7.3).
- Unmapped ambient wiring: `horse_hooves` · `rain` · `river` → `SceneDensity.ambients()`.
