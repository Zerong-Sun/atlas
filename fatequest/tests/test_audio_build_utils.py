import sys
import unittest
from pathlib import Path
import numpy as np
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'tools/audio'))
from audio_build_utils import stable_seed, close_loop_boundary

class AudioBuildTests(unittest.TestCase):
    def test_seed_known_vector(self):
        self.assertEqual(stable_seed('abc'), 0xba7816bf)
        self.assertNotEqual(stable_seed('latin'), stable_seed('islamic'))

    def test_boundary_preserves_duration_and_finite_peak(self):
        x = np.random.default_rng(7).normal(size=44100)
        y = close_loop_boundary(x)
        self.assertEqual(len(x), len(y))
        self.assertAlmostEqual(y[0], y[-1], places=12)
        self.assertLessEqual(np.max(np.abs(y)), .8500001)
        self.assertTrue(np.array_equal(x, np.random.default_rng(7).normal(size=44100)))

    def test_empty_silent_and_invalid(self):
        self.assertEqual(len(close_loop_boundary([])), 0)
        self.assertTrue(np.all(close_loop_boundary(np.zeros(20)) == 0))
        with self.assertRaises(ValueError): close_loop_boundary([np.nan])

if __name__ == '__main__': unittest.main()
