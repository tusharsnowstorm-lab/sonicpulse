#!/usr/bin/env python3
"""
Render accepted Wayfinder applications as a PNG summary table.

Data source, in order of preference:
  1. argv[1] as a path to JSON, or "-" for stdin. Accepts either a bare array
     of wayfinder_applications rows or the {"applications": [...]} shape that
     /api/admin/wayfinder returns.
  2. SONICPULSE_SUPABASE_URL + SONICPULSE_SUPABASE_SERVICE_ROLE_KEY, which is
     fetched directly. These are deliberately NOT the canonical
     NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY names: this repo's
     web environment points those at the Afterhours project, while
     wayfinder_applications lives in the SonicPulse project.

Only rows with status == 'accepted' are included.

Usage:
    python3 scripts/wayfinders-png.py                     # fetch, write accepted-wayfinders.png
    python3 scripts/wayfinders-png.py export.json out.png  # render a saved export

Requires Chromium (present in Claude Code web sessions at the path below) and,
for tight cropping, Pillow (`pip install pillow`) - without it the PNG simply
carries extra space at the bottom.
"""
import datetime
import html
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request

CHROME = os.environ.get(
    "CHROME_PATH", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
)

COLUMNS = "full_name,gender,instagram_handle,institution,level,date_of_birth,status"

LEVELS = {
    "undergraduate_final": "Undergraduate (final year)",
    "hsc_alevel": "HSC / A Level",
    "other": "Other",
}
GENDERS = {"female": "Female", "male": "Male", "prefer_not_to_say": "Prefer not to say"}
DASH = "—"


def fetch():
    base = os.environ.get("SONICPULSE_SUPABASE_URL")
    key = os.environ.get("SONICPULSE_SUPABASE_SERVICE_ROLE_KEY")
    if not base or not key:
        sys.exit(
            "No input given and SONICPULSE_SUPABASE_URL / "
            "SONICPULSE_SUPABASE_SERVICE_ROLE_KEY are not set.\n"
            "Either set them in the web environment (they apply to NEW sessions), "
            "or pass a JSON export from /api/admin/wayfinder as the first argument."
        )
    url = (
        base.rstrip("/")
        + "/rest/v1/wayfinder_applications?"
        + urllib.parse.urlencode({"select": COLUMNS, "status": "eq.accepted"})
    )
    req = urllib.request.Request(
        url, headers={"apikey": key, "Authorization": "Bearer " + key}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"Supabase returned {e.code}: {e.read().decode()[:300]}")


def birth_year(row):
    dob = row.get("date_of_birth")
    if not dob:
        return DASH
    try:
        return str(datetime.date.fromisoformat(str(dob)[:10]).year)
    except ValueError:
        return DASH


def handle(row):
    h = (row.get("instagram_handle") or "").strip()
    if not h:
        return DASH
    return h if h.startswith("@") else "@" + h


def build_rows(data):
    rows = [r for r in data if (r.get("status") or "accepted").lower() == "accepted"]
    rows.sort(key=lambda r: (r.get("full_name") or "").lower())
    return rows


def render_html(rows):
    head = ["#", "Name", "Gender", "Instagram", "Institution", "Education level", "Birth year"]
    body = []
    for i, r in enumerate(rows, 1):
        body.append([
            str(i),
            (r.get("full_name") or DASH).strip(),
            GENDERS.get((r.get("gender") or "").lower(), DASH),
            handle(r),
            (r.get("institution") or DASH).strip(),
            LEVELS.get((r.get("level") or "").lower(), (r.get("level") or DASH)),
            birth_year(r),
        ])
    th = "".join(f"<th>{html.escape(h)}</th>" for h in head)
    trs = "".join(
        "<tr>" + "".join(f"<td>{html.escape(c)}</td>" for c in row) + "</tr>"
        for row in body
    )
    plural = "application" if len(rows) == 1 else "applications"
    return f"""<!doctype html><meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; }}
  body {{ margin:0; padding:40px; background:#0b0c10; color:#f4f4f5;
         font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }}
  h1 {{ margin:0 0 4px; font-size:26px; letter-spacing:-0.01em; }}
  .sub {{ margin:0 0 24px; font-size:13px; color:#9ca3af; }}
  table {{ border-collapse:collapse; width:100%; font-size:14px; }}
  thead th {{ text-align:left; padding:12px 14px; background:#17181f; color:#c7c9d1;
              font-size:12px; text-transform:uppercase; letter-spacing:0.06em;
              border-bottom:1px solid #2a2c36; white-space:nowrap; }}
  tbody td {{ padding:11px 14px; border-bottom:1px solid #1d1f27; vertical-align:top; }}
  tbody tr:nth-child(even) {{ background:#101118; }}
  tbody td:first-child {{ color:#6b7280; width:44px; }}
  tbody td:nth-child(4) {{ color:#8ab4f8; white-space:nowrap; }}
  tbody td:last-child {{ white-space:nowrap; }}
</style>
<h1>Sonic Pulse &mdash; Accepted Wayfinders</h1>
<p class="sub">{len(rows)} accepted {plural}</p>
<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>"""


def crop(out):
    try:
        from PIL import Image, ImageChops
    except ImportError:
        print("Pillow not installed - PNG has extra space at the bottom "
              "(pip install pillow to trim it).", file=sys.stderr)
        return
    img = Image.open(out).convert("RGB")
    bg = img.getpixel((img.width - 5, img.height - 5))
    box = ImageChops.difference(img, Image.new("RGB", img.size, bg)).getbbox()
    if box:
        img.crop((0, 0, img.width, min(img.height, box[3] + 80))).save(out)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else None
    out = os.path.abspath(sys.argv[2] if len(sys.argv) > 2 else "accepted-wayfinders.png")

    if src is None:
        data = fetch()
    else:
        data = json.loads(sys.stdin.read() if src == "-" else open(src).read())
    if isinstance(data, dict):
        data = data.get("applications", [])
    rows = build_rows(data)
    if not rows:
        sys.exit("No accepted Wayfinder applications found.")

    tmp = out + ".html"
    with open(tmp, "w") as f:
        f.write(render_html(rows))

    # Render tall, then crop: row heights vary with text wrapping, so a
    # computed height would clip some tables and pad others.
    subprocess.run(
        [CHROME, "--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
         "--virtual-time-budget=3000", f"--screenshot={out}",
         f"--window-size=1400,{400 + 80 * len(rows)}",
         "--force-device-scale-factor=2", "file://" + tmp],
        check=True, capture_output=True,
    )
    os.remove(tmp)
    crop(out)
    print(f"Wrote {out} ({len(rows)} accepted)")


if __name__ == "__main__":
    main()
