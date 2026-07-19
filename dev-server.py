#!/usr/bin/env python3
"""Static dev server for fatequest2 with caching disabled (development only)."""
import functools
import http.server


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        super().end_headers()


if __name__ == "__main__":
    http.server.test(  # type: ignore[attr-defined]
        HandlerClass=functools.partial(NoCacheHandler, directory="fatequest2"),
        port=4173,
        bind="127.0.0.1",
    )
