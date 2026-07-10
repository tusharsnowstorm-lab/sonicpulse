#!/usr/bin/env python3
"""Auto-crop a 430x932 Connect app screenshot to its content height.

Usage: python3 crop-screenshot.py in.png out.png [--full]

Naively scanning for the last non-background row ALWAYS returns full height,
because the tab bar's pixels sit at the bottom of every screen — that was a
real bug in this repo's history. This script excludes the tab-bar zone
(y >= 845) from the content scan, then crops to content + padding. Pass
--full to keep the whole frame (for screens where the tab bar is part of
the story, e.g. tab-navigation shots).
"""
import sys
from PIL import Image

VOID = (5, 5, 8)        # theme.void background
TAB_BAR_TOP = 845       # everything below this is chrome, not content
TOLERANCE = 12
PAD = 24
MIN_HEIGHT = 300

def main():
    src, dst = sys.argv[1], sys.argv[2]
    full = '--full' in sys.argv
    img = Image.open(src).convert('RGB')
    w, h = img.size
    if full:
        img.save(dst)
        print(f"{dst}: kept full {w}x{h}")
        return
    px = img.load()
    last = 0
    for y in range(min(h, TAB_BAR_TOP)):
        for x in range(0, w, 4):
            r, g, b = px[x, y]
            if (abs(r - VOID[0]) > TOLERANCE or abs(g - VOID[1]) > TOLERANCE
                    or abs(b - VOID[2]) > TOLERANCE):
                last = y
                break
    crop_h = max(MIN_HEIGHT, min(h, last + PAD))
    img.crop((0, 0, w, crop_h)).save(dst)
    print(f"{dst}: cropped {w}x{h} -> {w}x{crop_h}")

if __name__ == '__main__':
    main()
