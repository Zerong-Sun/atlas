"""Shared deterministic build primitives; numerical checks are not listening approval."""
import hashlib
import numpy as np


def stable_seed(label: str) -> int:
    return int.from_bytes(hashlib.sha256(label.encode('utf-8')).digest()[:4], 'big')


def close_loop_boundary(samples, sample_rate=44100, fade=0.1, peak=0.85):
    """Keep exact musical duration; smoothly bring both endpoints to one value.

    Unlike duplicating a head/tail crossfade at both ends, this does not create
    a second discontinuity at the fade junction. Lossy encoding can alter the
    endpoints: decode and listen to the encoded output before approval.
    """
    out = np.asarray(samples, dtype=np.float64).copy()
    if not len(out):
        return out
    if not np.isfinite(out).all():
        raise ValueError('non-finite audio samples')
    n = max(1, min(int(fade * sample_rate), len(out) // 4))
    target = (out[0] + out[-1]) * 0.5
    weight = 0.5 + 0.5 * np.cos(np.linspace(0.0, np.pi, n))
    out[:n] += (target - out[0]) * weight
    out[-n:] += (target - out[-1]) * weight[::-1]
    out -= out.mean()
    maximum = np.max(np.abs(out))
    return out / maximum * peak if maximum else out
