shader_type canvas_item;

// Old-ink fog over unsurveyed country (GDD §5.3, ART_REQUIREMENTS §2.2).
//
// The mask is generated from WorldState.revealed — it is world state, not a
// render cache (docs/ROADMAP.md §3.2). This shader only decides how the edge
// LOOKS; what is revealed is decided by the kernel.
//
// N2 M1: when a place is newly surveyed, `reveal_blend` lerps from the previous
// mask to the current one so the wash dissolves locally rather than popping.

uniform sampler2D ink : filter_linear_mipmap, repeat_enable;
uniform sampler2D mask : filter_linear, repeat_disable;
uniform sampler2D mask_prev : filter_linear, repeat_disable;
uniform float reveal_blend = 1.0;   // 0 = previous wash · 1 = current
uniform float ink_scale = 1.0;
uniform float edge_softness = 0.34;
uniform float max_opacity = 0.66;   // a wash — unsurveyed must READ as unsurveyed
uniform vec4 ink_tint : source_color = vec4(0.45, 0.38, 0.28, 1.0);

void fragment() {
	float revealed_now = texture(mask, UV).r;
	float revealed_was = texture(mask_prev, UV).r;
	float revealed = mix(revealed_was, revealed_now, clamp(reveal_blend, 0.0, 1.0));

	// Break the mask edge with the ink's own grain so the boundary reads as a
	// wash rather than a circle. A clean radial gradient looks like a fog-of-war
	// tile from a strategy game; this must look like ink on vellum.
	float grain = texture(ink, UV * ink_scale).r;
	float edge = smoothstep(0.5 - edge_softness, 0.5 + edge_softness,
	                        revealed + (grain - 0.5) * 0.35);

	// A mappa mundi that is 95% ink is not a map. The wash SUGGESTS unsurveyed
	// country — the land stays legible underneath, only its detail is withheld.
	vec3 col = ink_tint.rgb * (0.72 + 0.40 * grain);
	COLOR = vec4(col, (1.0 - edge) * ink_tint.a * max_opacity);
}
