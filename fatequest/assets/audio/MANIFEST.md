# Audio assets

Generated / composed per `docs/AUDIO_PLAN.md` §7.

## Current music routing

East Asia (`east_asia`), West Asia (`islamic`) and Steppe (`steppe`) all use the
same neutral `intro/title_theme.wav` during gameplay. It also remains the
opening theme. The three sets of separate folk loops and their older stems
were removed after listening review. Mixed locations that contain two of
these cultures route to one shared player, so the same recording is never
layered twice.

Indian Ocean and Latin retain their own `folk/{culture}/{town,road,quiet}{,_b}.ogg`
songbooks: 12 stereo 44.1 kHz Vorbis loops. Each has A/B melodies and town,
road and quiet arrangements. `AudioDirector` rotates their A/B melodies after
two loops and crossfades between scenes.

| Culture | Main instruments | Writing / arrangement |
|---|---|---|
| `east_asia`, `islamic`, `steppe` | shared recorder, psaltery and light frame drum | one neutral 40-second loop, identical in these three regions |
| `indian_ocean` | lossless sitar and tabla strikes | two original Bhairav-inspired melodies; the MP3 tanpura is absent |
| `latin` | lossless VCSL recorder, plucked psaltery and quiet frame drum | two original D-Dorian-inspired melodies with a light dance pulse |

The active regional generator is `tools/audio/compose_modal_regional.py`; it
renders only Indian Ocean and Latin by default and rejects the three removed
cultures. Scores for the withdrawn cues remain in the script and
`docs/REGIONAL_MUSIC_SCORE.md` as design history. Source URLs and licenses are
in `assets/audio/THIRD_PARTY_CREDITS.md` and `tools/audio/samples/`.

For listening to the three shared regions, open `intro/title_theme.wav`.

## Unused supporting stems (2 cultures × 4 layers × 60s mono OGG)

| Culture | drone | pulse | melody | color |
|---|---|---|---|---|
| `indian_ocean` | `stems/indian_ocean/drone.ogg` | `stems/indian_ocean/pulse.ogg` | `stems/indian_ocean/melody.ogg` | `stems/indian_ocean/color.ogg` |
| `latin` | `stems/latin/drone.ogg` | `stems/latin/pulse.ogg` | `stems/latin/melody.ogg` | `stems/latin/color.ogg` |

- **drone / pulse**: procedural synth (`tools/audio/generate_all.py`)
- **melody / color**: older hybrid synth (`tools/audio/generate_melody_color.py`).
  These two sets remain as build history; the runtime does not play them.

## Ambient (12 scene beds + 5 sacred_blur)

| File | Source |
|---|---|
| `ambient/wind_sand.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/waves.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/ropes_mast.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/market_crowd.ogg` | CC0 BigSoundBank → `compose_loops.py` (low-passed; intelligibility not yet listening-reviewed) |
| `ambient/camel_bells.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/horse_hooves.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/river.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/rain.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/fire.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/footsteps_echo.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/dishes.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/seabirds.ogg` | CC0 BigSoundBank → `compose_loops.py` |
| `ambient/sacred_blur_*.ogg` (×5) | procedural formant blur (`generate_all.py`) — §1 allowed gesture |

## Opening theme

| File | Source and runtime role |
|---|---|
| `intro/title_theme.wav` | 40-second stereo 44.1 kHz PCM original melody rendered from recorded VCSL recorder, plucked psaltery and light frame drum by `tools/audio/generate_intro_theme.py`; loops on the opening desk and serves as the shared gameplay theme in East Asia, West Asia and Steppe. The repeating high D5 psaltery accent at beat 2.75 was removed; the remaining low answers fall on beats 1 and 3. |

The shared theme has no liturgical or regional identity. Indian Ocean and
Latin keep separate melody cues. No continuous drone plays under either path.

Provenance for CC0 downloads: `tools/audio/_cc0_cache/SOURCES.json` (gitignored cache; regenerate via `fetch_cc0.py`).

## Notes

- Scales are **secular gestures** (AUDIO_PLAN §1), not faithful maqām/rāga/chant.
- No adhān, Qur'ān, liturgical chant, or sacred recitation.
- Procedural UI SFX (bell, coin, dice, …) stay in `game/audio/` at runtime (§7.3).
- Wiring audit 2026-10-20: `horse_hooves`, `rain`, `river` are mapped in `SceneDensity.ambients()`; `seabirds` remains unmapped.

## Historical audit status 2026-10-20 (superseded for regional music)

See [inventory CSV](../../docs/library_audit/audio_inventory.csv) and [audio audit](../../docs/library_audit/AUDIO_AUDIT_2026-10-20.md). All 37 OGG decode as 44.1 kHz mono; total size is 9,740,026 bytes. File availability and generator implementation do not mean listening, cultural suitability or seamless-loop acceptance: all listening reviews are pending, and 16 files have endpoint jumps above 0.1 full-scale requiring review.

The 20 stems and 5 sacred_blur beds are synthetic candidates. The opening WAV is a separate procedural one-shot. No current city uses `latin`, and no prologue call selecting it was found. Several scene mappings are not reached on site-event changes; six SFX generator families have no runtime caller. A1–A8 are partially implemented, not uniformly accepted.

Local CC0 cache and metadata exist for 12 sources, but are gitignored; a versioned source-to-output hash/build chain is still missing. `camel_bells` uses a documented Santa/reindeer-bell substitute, and the market recording is from France. This supplements the provenance above; it does not redefine those recordings as historical location recordings. Two official detail pages (0585 and 2728) were checked for CC0 on 2026-10-20; the other ten were not revalidated online in this audit.
