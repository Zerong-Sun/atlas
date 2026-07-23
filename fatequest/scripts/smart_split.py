#!/usr/bin/env python3
"""
Smart contact-sheet / dual-portrait splitter.

Strategies (picked by sheet type):
  1. parchment black-grid — thin dark gutters on vellum (row-wise V lines)
  2. content-gaps — floating icons on dark/transparent plate
  3. dual-blank — two figures; cut at emptiest vertical strip near center

Never stretch/squeeze cells. Optional trim of empty margins only.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image


def _luma(px, x: int, y: int) -> float:
    c = px[x, y]
    if len(c) >= 4:
        r, g, b, a = c[0], c[1], c[2], c[3]
        if a < 20:
            return -1.0
        return 0.299 * r + 0.587 * g + 0.114 * b
    return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]


def content_bbox(im: Image.Image, dark_thr: float = 28.0) -> tuple[int, int, int, int]:
    """Tight bbox of non-near-black / non-transparent pixels."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    minx, miny, maxx, maxy = w, h, -1, -1
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            m = _luma(px, x, y)
            if m >= dark_thr:
                minx = min(minx, x)
                miny = min(miny, y)
                maxx = max(maxx, x)
                maxy = max(maxy, y)
    if maxx < 0:
        return 0, 0, w, h
    pad = 2
    return max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad + 1), min(h, maxy + pad + 1)


def _line_dark_frac(
    px,
    axis: str,
    i: int,
    a0: int,
    a1: int,
    dark_thr: float,
) -> float:
    c = t = 0
    step = 2
    if axis == "x":  # vertical line at x=i, sample y in [a0,a1)
        for j in range(a0, a1, step):
            m = _luma(px, i, j)
            if m < 0:
                continue
            t += 1
            if m < dark_thr:
                c += 1
    else:
        for j in range(a0, a1, step):
            m = _luma(px, j, i)
            if m < 0:
                continue
            t += 1
            if m < dark_thr:
                c += 1
    return c / max(1, t)


def find_gutter_mids(
    im: Image.Image,
    axis: str,
    *,
    a0: int,
    a1: int,
    b0: int | None = None,
    b1: int | None = None,
    dark_thr: float = 48,
    min_dark: float = 0.55,
    max_width: int = 12,
    min_span_frac: float = 0.55,
) -> list[int]:
    """
    Find midpoints of thin dark gutters.
    axis='x': vertical gutters (x coords), sampled over y in [b0,b1)
    axis='y': horizontal gutters (y coords), sampled over x in [b0,b1)
    Only count a column/row as gutter if dark along most of the cross-span.
    """
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    if axis == "x":
        n = w
        cross0 = b0 if b0 is not None else 0
        cross1 = b1 if b1 is not None else h
    else:
        n = h
        cross0 = b0 if b0 is not None else 0
        cross1 = b1 if b1 is not None else w

    fr = [
        _line_dark_frac(px, axis, i, cross0, cross1, dark_thr)
        for i in range(a0, a1)
    ]
    # require gutters to be dark AND neighbors lighter (ink drawings alone fail this)
    lines: list[int] = []
    i = 0
    while i < len(fr):
        if fr[i] >= min_dark:
            j = i
            while j < len(fr) and fr[j] >= min_dark * 0.75:
                j += 1
            width = j - i
            if 1 <= width <= max_width:
                mid_local = (i + j) // 2
                mid = a0 + mid_local
                # flank brightness check
                L = max(0, i - 6)
                R = min(len(fr) - 1, j + 5)
                left = sum(fr[k] for k in range(L, i)) / max(1, i - L) if i > L else 0.0
                right = sum(fr[k] for k in range(j, R + 1)) / max(1, R - j + 1) if R >= j else 0.0
                # also check span: how continuous is the dark run across cross axis
                span = fr[mid_local]
                if span >= min_span_frac and (left < 0.45 or right < 0.45):
                    if not lines or mid - lines[-1] >= 18:
                        lines.append(mid)
            i = j
        else:
            i += 1
    return lines


def cell_score(im: Image.Image) -> float:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    if w * h == 0:
        return 0.0
    px = rgba.load()
    hit = tot = 0
    for y in range(0, h, 3):
        for x in range(0, w, 3):
            m = _luma(px, x, y)
            tot += 1
            if m >= 35:
                hit += 1
    return hit / max(1, tot)


def trim_empty_margins(im: Image.Image, pad: int = 2, dark_thr: float = 22.0) -> Image.Image:
    rgba = im.convert("RGBA")
    x0, y0, x1, y1 = content_bbox(rgba, dark_thr=dark_thr)
    # if almost full frame, keep as-is
    if x1 - x0 < 8 or y1 - y0 < 8:
        return rgba
    return rgba.crop((x0, y0, x1, y1))


def split_parchment_black_grid(
    im: Image.Image,
    *,
    min_cell: int = 48,
    min_score: float = 0.04,
) -> list[Image.Image] | None:
    """
    Outer black plate + vellum cells separated by thin black gutters.
    Detect H gutters globally, then V gutters per row (irregular grids OK).
    """
    rgba = im.convert("RGBA")
    bx0, by0, bx1, by1 = content_bbox(rgba, dark_thr=30)
    # expand slightly so outer frame lines are inside search
    bx0, by0 = max(0, bx0 - 4), max(0, by0 - 4)
    bx1, by1 = min(rgba.width, bx1 + 4), min(rgba.height, by1 + 4)

    h_raw = find_gutter_mids(
        rgba, "y", a0=by0, a1=by1, b0=bx0, b1=bx1,
        dark_thr=45, min_dark=0.58, max_width=14, min_span_frac=0.5,
    )
    # keep well-spaced major H lines
    H: list[int] = []
    for y in h_raw:
        if not H or y - H[-1] >= 60:
            H.append(y)
        else:
            # keep darker of cluster — approximate by mid
            H[-1] = (H[-1] + y) // 2

    bands = [by0] + H + [by1]
    # dedupe close band edges
    cleaned = [bands[0]]
    for y in bands[1:]:
        if y - cleaned[-1] >= 40:
            cleaned.append(y)
        else:
            cleaned[-1] = y
    bands = cleaned
    if len(bands) < 2:
        return None

    cells: list[Image.Image] = []
    for bi in range(len(bands) - 1):
        y0, y1 = bands[bi], bands[bi + 1]
        if y1 - y0 < min_cell:
            continue
        v_raw = find_gutter_mids(
            rgba, "x", a0=bx0, a1=bx1, b0=y0 + 2, b1=y1 - 2,
            dark_thr=45, min_dark=0.55, max_width=14, min_span_frac=0.45,
        )
        V: list[int] = []
        for x in v_raw:
            if not V or x - V[-1] >= 40:
                V.append(x)
            else:
                V[-1] = (V[-1] + x) // 2
        xs = [bx0] + V + [bx1]
        xclean = [xs[0]]
        for x in xs[1:]:
            if x - xclean[-1] >= 28:
                xclean.append(x)
            else:
                xclean[-1] = x
        xs = xclean
        for ci in range(len(xs) - 1):
            x0, x1 = xs[ci], xs[ci + 1]
            if x1 - x0 < min_cell or y1 - y0 < min_cell:
                continue
            # inset 2px past gutter center
            cell = rgba.crop((x0 + 2, y0 + 2, x1 - 2, y1 - 2))
            if cell_score(cell) < min_score:
                continue
            # skip near-empty parchment-only if tiny content? keep blank cartouche etc.
            cells.append(cell)
    return cells if len(cells) >= 2 else None


def content_density(im: Image.Image) -> tuple[list[float], list[float]]:
    """Non-black content density per col/row for dark-plate icon sheets."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    col = [0.0] * w
    row = [0.0] * h
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            m = _luma(px, x, y)
            if m >= 35:
                col[x] += 1
                row[y] += 1
    nh = max(1, (h + 1) // 2)
    nw = max(1, (w + 1) // 2)
    return [c / nh for c in col], [r / nw for r in row]


def _strongest_gap_mids(dens: list[float], n_cuts: int, thr: float = 0.04, min_gap: int = 10) -> list[int]:
    gaps = []
    i = 0
    n = len(dens)
    while i < n:
        if dens[i] < thr:
            j = i
            while j < n and dens[j] < thr:
                j += 1
            if j - i >= min_gap:
                # ignore edge gutters that are just outer margin
                mid = (i + j) // 2
                if i > 8 and j < n - 8:
                    gaps.append((j - i, mid))
            i = j
        else:
            i += 1
    gaps.sort(reverse=True)
    mids = sorted(m for _, m in gaps[:n_cuts])
    return mids


def split_content_gaps(
    im: Image.Image,
    expect_cols: int,
    expect_rows: int,
    *,
    min_score: float = 0.02,
) -> list[Image.Image] | None:
    col_d, row_d = content_density(im)
    xs = [0] + _strongest_gap_mids(col_d, expect_cols - 1) + [im.width]
    ys = [0] + _strongest_gap_mids(row_d, expect_rows - 1) + [im.height]
    if len(xs) != expect_cols + 1 or len(ys) != expect_rows + 1:
        # fallback equal
        return None
    cells = []
    for r in range(expect_rows):
        for c in range(expect_cols):
            cell = im.crop((xs[c], ys[r], xs[c + 1], ys[r + 1]))
            if cell_score(cell) < min_score:
                continue
            cells.append(trim_empty_margins(cell, dark_thr=28))
    return cells if cells else None


def split_equal_grid(im: Image.Image, cols: int, rows: int) -> list[Image.Image]:
    bx0, by0, bx1, by1 = content_bbox(im, dark_thr=28)
    w, h = bx1 - bx0, by1 - by0
    cw, ch = w // cols, h // rows
    cells = []
    for r in range(rows):
        for c in range(cols):
            cell = im.crop(
                (bx0 + c * cw + 2, by0 + r * ch + 2, bx0 + (c + 1) * cw - 2, by0 + (r + 1) * ch - 2)
            )
            cells.append(cell)
    return cells


def _merge_positions(vals: list[int], min_gap: int) -> list[int]:
    if not vals:
        return []
    out = [vals[0]]
    for v in vals[1:]:
        if v - out[-1] >= min_gap:
            out.append(v)
        else:
            out[-1] = (out[-1] + v) // 2
    return out


def split_row_cols(
    im: Image.Image,
    row_cols: list[int],
    *,
    dark_thr: float = 20,
    min_dark: float = 0.55,
    min_cell: int = 40,
) -> list[Image.Image] | None:
    """Irregular grids: H gutters + per-row V gutters (or equal width)."""
    rgba = im.convert("RGBA")
    bx0, by0, bx1, by1 = content_bbox(rgba, dark_thr=max(18, dark_thr - 5))
    rows_n = len(row_cols)
    h_raw = find_gutter_mids(
        rgba, "y", a0=by0, a1=by1, b0=bx0, b1=bx1,
        dark_thr=dark_thr, min_dark=min_dark, max_width=18, min_span_frac=0.45,
    )
    h_raw += find_gutter_mids(
        rgba, "y", a0=by0, a1=by1, b0=bx0, b1=bx1,
        dark_thr=45, min_dark=0.55, max_width=14, min_span_frac=0.5,
    )
    h_raw = _merge_positions(sorted(set(h_raw)), min_gap=50)
    if len(h_raw) >= rows_n - 1:
        target: list[int] = []
        for i in range(1, rows_n):
            ideal = by0 + (by1 - by0) * i / rows_n
            best = min(h_raw, key=lambda y: abs(y - ideal))
            if best not in target:
                target.append(best)
            else:
                rest = [y for y in h_raw if y not in target]
                if rest:
                    target.append(min(rest, key=lambda y: abs(y - ideal)))
        H = sorted(target)[: rows_n - 1]
    else:
        H = [by0 + (by1 - by0) * i // rows_n for i in range(1, rows_n)]

    bands = [by0] + H + [by1]
    cells: list[Image.Image] = []
    for bi, ncols in enumerate(row_cols):
        y0, y1 = bands[bi], bands[bi + 1]
        if y1 - y0 < min_cell:
            continue
        v_raw = find_gutter_mids(
            rgba, "x", a0=bx0, a1=bx1, b0=y0 + 2, b1=y1 - 2,
            dark_thr=dark_thr, min_dark=min_dark, max_width=16, min_span_frac=0.4,
        )
        v_raw += find_gutter_mids(
            rgba, "x", a0=bx0, a1=bx1, b0=y0 + 2, b1=y1 - 2,
            dark_thr=45, min_dark=0.55, max_width=14, min_span_frac=0.45,
        )
        min_gap = max(36, (bx1 - bx0) // (ncols * 3))
        V = _merge_positions(sorted(set(v_raw)), min_gap=min_gap)
        V = [x for x in V if bx0 + 20 < x < bx1 - 20]
        if len(V) >= ncols - 1:
            picks: list[int] = []
            for i in range(1, ncols):
                ideal = bx0 + (bx1 - bx0) * i / ncols
                candidates = [x for x in V if x not in picks] or V
                picks.append(min(candidates, key=lambda x: abs(x - ideal)))
            xs = [bx0] + sorted(picks)[: ncols - 1] + [bx1]
        else:
            xs = [bx0 + (bx1 - bx0) * i // ncols for i in range(ncols + 1)]
        # if resulting widths too uneven / tiny, fall back to equal
        widths = [xs[i + 1] - xs[i] for i in range(len(xs) - 1)]
        if widths and (min(widths) < min_cell * 2 or min(widths) < 0.45 * (sum(widths) / len(widths))):
            xs = [bx0 + (bx1 - bx0) * i // ncols for i in range(ncols + 1)]
        row_cells: list[Image.Image] = []
        for ci in range(len(xs) - 1):
            x0, x1 = xs[ci], xs[ci + 1]
            if x1 - x0 < min_cell:
                continue
            cell = rgba.crop((x0 + 2, y0 + 2, x1 - 2, y1 - 2))
            if cell_score(cell) < 0.015:
                continue
            row_cells.append(cell)
        # Prefer equal if gutter pick produced wrong count
        if len(row_cells) != ncols:
            xs = [bx0 + (bx1 - bx0) * i // ncols for i in range(ncols + 1)]
            row_cells = []
            for ci in range(ncols):
                cell = rgba.crop((xs[ci] + 2, y0 + 2, xs[ci + 1] - 2, y1 - 2))
                row_cells.append(cell)
        cells.extend(row_cells)
    return cells if cells else None


def split_islands(
    im: Image.Image,
    *,
    dark_thr: float = 28,
    min_area: int = 3000,
    min_w: int = 70,
    min_h: int = 70,
    step: int = 2,
    dilate: int = 5,
    row_tol: int = 100,
) -> list[Image.Image] | None:
    """Floating icons on dark plate: dilate + connected components, row-major order."""
    from collections import deque
    from PIL import ImageFilter

    rgba = im.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    bw = Image.new("L", (w, h), 0)
    bp = bw.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a >= 20 and (r + g + b) / 3 >= dark_thr:
                bp[x, y] = 255
    for _ in range(max(0, dilate)):
        bw = bw.filter(ImageFilter.MaxFilter(3))
    bp = bw.load()
    mw, mh = (w + step - 1) // step, (h + step - 1) // step
    mask = [
        [bp[min(w - 1, gx * step), min(h - 1, gy * step)] > 0 for gx in range(mw)]
        for gy in range(mh)
    ]
    visited = [[False] * mw for _ in range(mh)]
    boxes: list[tuple[int, int, int, int]] = []
    for gy in range(mh):
        for gx in range(mw):
            if not mask[gy][gx] or visited[gy][gx]:
                continue
            q = deque([(gx, gy)])
            visited[gy][gx] = True
            minx = maxx = gx
            miny = maxy = gy
            area = 0
            while q:
                cx, cy = q.popleft()
                area += 1
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < mw and 0 <= ny < mh and mask[ny][nx] and not visited[ny][nx]:
                        visited[ny][nx] = True
                        q.append((nx, ny))
                        minx = min(minx, nx)
                        maxx = max(maxx, nx)
                        miny = min(miny, ny)
                        maxy = max(maxy, ny)
            bw_, bh_ = (maxx - minx + 1) * step, (maxy - miny + 1) * step
            if area * step * step >= min_area and bw_ >= min_w and bh_ >= min_h:
                boxes.append(
                    (miny * step, minx * step, min(h, (maxy + 1) * step), min(w, (maxx + 1) * step))
                )
    if len(boxes) < 2:
        return None
    centers = [((b[0] + b[2]) // 2, (b[1] + b[3]) // 2, b) for b in boxes]
    centers.sort(key=lambda t: t[0])
    rows: list[list[tuple[int, tuple[int, int, int, int]]]] = []
    row_y = None
    for cy, cx, b in centers:
        if row_y is None or cy - row_y > row_tol:
            rows.append([])
            row_y = cy
        rows[-1].append((cx, b))
    cells: list[Image.Image] = []
    for row in rows:
        row.sort(key=lambda t: t[0])
        for _, (y0, x0, y1, x1) in row:
            pad = 4
            cells.append(
                rgba.crop((max(0, x0 - pad), max(0, y0 - pad), min(w, x1 + pad), min(h, y1 + pad)))
            )
    return cells


def split_dual_at_blank(im: Image.Image) -> list[Image.Image] | None:
    rgba = im.convert("RGBA")
    w, h = rgba.size
    if w < h * 1.05:
        return None
    col_d, _ = content_density(rgba)
    px = rgba.load()
    for x in range(w):
        empty = 0
        samples = 0
        for y in range(0, h, 2):
            samples += 1
            a = px[x, y][3]
            m = _luma(px, x, y)
            if a < 24 or m < 18:
                empty += 1
        col_d[x] = col_d[x] * 0.5 + (1.0 - empty / max(1, samples)) * 0.5

    x0, x1 = int(w * 0.30), int(w * 0.70)
    win = max(6, w // 60)
    best_x, best_s = w // 2, 1e18
    for x in range(x0, x1):
        s = sum(col_d[max(0, x - win) : min(w, x + win + 1)])
        if s < best_s:
            best_s = s
            best_x = x
    left = trim_empty_margins(rgba.crop((0, 0, best_x, h)))
    right = trim_empty_margins(rgba.crop((best_x, 0, w, h)))
    if cell_score(left) < 0.02 or cell_score(right) < 0.02:
        return None
    return [left, right]


def smart_split(
    im: Image.Image,
    *,
    expect_cols: int | None = None,
    expect_rows: int | None = None,
    row_cols: list[int] | None = None,
    prefer_dual: bool = False,
    mode: str | None = None,
) -> tuple[list[Image.Image], str]:
    """
    mode: 'parchment' | 'gaps' | 'dual' | None(auto)
    row_cols: e.g. [4, 6] or [3, 4, 2] for irregular sheets
    Returns (cells, method). Cells keep native pixel size (no stretch).
    """
    im = im.convert("RGBA")
    expected = (expect_cols or 0) * (expect_rows or 0)
    if row_cols:
        expected = sum(row_cols)

    if prefer_dual or mode == "dual" or (expect_cols == 2 and expect_rows == 1):
        dual = split_dual_at_blank(im)
        if dual:
            return dual, "dual-blank"

    if row_cols:
        irregular = split_row_cols(im, row_cols)
        if irregular and abs(len(irregular) - expected) <= 1:
            return irregular, "row-cols"
        # soft-dark pass already default; if count wrong try equal-per-row via forced H
        if irregular and abs(len(irregular) - expected) <= 3:
            return irregular, "row-cols"

    if mode == "islands":
        islands = split_islands(im)
        if islands:
            return islands, "islands"

    parchment = split_parchment_black_grid(im)
    if parchment:
        if expected == 0 or abs(len(parchment) - expected) <= max(2, expected // 4):
            return parchment, "parchment-grid"
        parch_candidate = parchment
    else:
        parch_candidate = None

    if mode == "gaps" and expect_cols and expect_rows:
        gaps = split_content_gaps(im, expect_cols, expect_rows)
        if gaps:
            return gaps, "content-gaps"
        islands = split_islands(im)
        if islands and abs(len(islands) - expected) <= 2:
            return islands, "islands"

    if expect_cols and expect_rows:
        gaps = split_content_gaps(im, expect_cols, expect_rows)
        if gaps and (expected == 0 or abs(len(gaps) - expected) <= 2):
            return gaps, "content-gaps"
        islands = split_islands(im)
        if islands and abs(len(islands) - expected) <= 2:
            return islands, "islands"
        eq = split_equal_grid(im, expect_cols, expect_rows)
        if eq:
            if parch_candidate and abs(len(parch_candidate) - expected) <= abs(len(eq) - expected):
                return parch_candidate, "parchment-grid"
            return [trim_empty_margins(c) for c in eq], "equal-grid"

    if parch_candidate:
        return parch_candidate, "parchment-grid"

    dual = split_dual_at_blank(im)
    if dual:
        return dual, "dual-blank"

    return [trim_empty_margins(im)], "single"


def save_cell_native(
    cell: Image.Image,
    path: Path,
    *,
    transparent: bool,
    description: str = "",
) -> None:
    from batch_art_utils import has_usable_alpha, prepare_transparent_cell, image_to_webp_bytes

    if transparent:
        cell = prepare_transparent_cell(cell)
        data = image_to_webp_bytes(cell, True, 90, description)
    else:
        if cell.mode == "RGBA" and has_usable_alpha(cell):
            bg = Image.new("RGB", cell.size, (233, 219, 184))
            bg.paste(cell, mask=cell.split()[-1])
            cell = bg
        else:
            cell = cell.convert("RGB")
        data = image_to_webp_bytes(cell, False, 90, description)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
