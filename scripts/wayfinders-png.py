#!/usr/bin/env python3
"""
Render accepted Wayfinder applications as a PNG table.

Two views:
  summary  (default) name, gender, Instagram, institution, education level, birth year
  contacts           name, Instagram, phone, emergency contact name and phone

Data source, in order of preference:
  1. --input as a path to JSON, or "-" for stdin. Accepts either a bare array
     of wayfinder_applications rows or the {"applications": [...]} shape that
     /api/admin/wayfinder returns.
  2. SONICPULSE_SUPABASE_URL + SONICPULSE_SUPABASE_SERVICE_ROLE_KEY, which is
     fetched directly. These are deliberately NOT the canonical
     NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY names: this repo's
     web environment points those at the Afterhours project, while
     wayfinder_applications lives in the SonicPulse project.

Only rows with status == 'accepted' are included.

Usage:
    python3 scripts/wayfinders-png.py
    python3 scripts/wayfinders-png.py --view contacts --input export.json

Requires Chromium (present in Claude Code web sessions at the path below) and,
for tight cropping, Pillow (`pip install pillow`) - without it the PNG simply
carries extra space at the bottom.
"""
import argparse
import datetime
import html
import json
import os
import re
import subprocess
import sys
import urllib.parse
import urllib.request

CHROME = os.environ.get(
    "CHROME_PATH", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
)

FETCH_COLUMNS = (
    "full_name,gender,instagram_handle,institution,level,date_of_birth,"
    "phone,emergency_contact_name,emergency_contact_phone,status"
)

LEVELS = {
    "undergraduate_final": "Undergraduate (final year)",
    "hsc_alevel": "HSC / A Level",
    "other": "Other",
}
GENDERS = {"female": "Female", "male": "Male", "prefer_not_to_say": "Prefer not to say"}
DASH = "—"


def text(row, field):
    v = (row.get(field) or "").strip()
    return v if v else DASH


def phone(row, field):
    v = re.sub(r"\s+", " ", (row.get(field) or "").strip())
    return v if v else DASH


def gender(row):
    return GENDERS.get((row.get("gender") or "").lower(), DASH)


def level(row):
    raw = (row.get("level") or "").lower()
    return LEVELS.get(raw, (row.get("level") or DASH))


def birth_year(row):
    dob = row.get("date_of_birth")
    if not dob:
        return DASH
    try:
        return str(datetime.date.fromisoformat(str(dob)[:10]).year)
    except ValueError:
        return DASH


def handle(row):
    """Normalise a free-text Instagram field to @handle form.

    Applicants type whatever they like: a bare handle, an @handle, a full
    profile URL with tracking params, or two handles at once.
    """
    raw = (row.get("instagram_handle") or "").strip()
    if not raw:
        return DASH
    if "instagram.com/" in raw.lower():
        tail = re.split(r"instagram\.com/", raw, flags=re.I)[-1]
        name = re.split(r"[/?#]", tail)[0].lstrip("@")
        return "@" + name if name else DASH
    parts = [p.lstrip("@") for p in re.split(r"[\s/,]+", raw) if p.strip("@/, ")]
    return " / ".join("@" + p for p in parts) if parts else DASH


# Each view is a list of (header, cell function). "nowrap" headers are kept on
# one line so phone numbers and handles never break mid-value.
VIEWS = {
    "summary": [
        ("Name", lambda r: text(r, "full_name")),
        ("Gender", gender),
        ("Instagram", handle),
        ("Institution", lambda r: text(r, "institution")),
        ("Education level", level),
        ("Birth year", birth_year),
    ],
    "contacts": [
        ("Name", lambda r: text(r, "full_name")),
        ("Instagram", handle),
        ("Phone", lambda r: phone(r, "phone")),
        ("Emergency contact", lambda r: text(r, "emergency_contact_name")),
        ("Emergency phone", lambda r: phone(r, "emergency_contact_phone")),
    ],
}
NOWRAP = {"Instagram", "Phone", "Emergency phone", "Birth year"}


def build_rows(data):
    rows = [r for r in data if (r.get("status") or "accepted").lower() == "accepted"]
    rows.sort(key=lambda r: (r.get("full_name") or "").lower())
    return rows


def render_html(rows, view):
    cols = VIEWS[view]
    missing = [h for h, fn in cols if all(fn(r) == DASH for r in rows)]
    th = '<th class="idx">#</th>' + "".join(
        f'<th{" class=nw" if h in NOWRAP else ""}>{html.escape(h)}</th>' for h, _ in cols
    )
    trs = ""
    for i, r in enumerate(rows, 1):
        tds = f'<td class="idx">{i}</td>' + "".join(
            f'<td{" class=nw" if h in NOWRAP else ""}>{html.escape(fn(r))}</td>'
            for h, fn in cols
        )
        trs += f"<tr>{tds}</tr>"
    plural = "application" if len(rows) == 1 else "applications"
    title = "Accepted Wayfinders" + (" — contacts" if view == "contacts" else "")
    warn = (
        f'<p class="warn">No data in: {html.escape(", ".join(missing))}</p>'
        if missing else ""
    )
    return f"""<!doctype html><meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; }}
  body {{ margin:0; padding:40px; background:#0b0c10; color:#f4f4f5;
         font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }}
  h1 {{ margin:0 0 4px; font-size:26px; letter-spacing:-0.01em; }}
  .sub {{ margin:0 0 24px; font-size:13px; color:#9ca3af; }}
  .warn {{ margin:-16px 0 20px; font-size:13px; color:#fbbf24; }}
  table {{ border-collapse:collapse; width:100%; font-size:14px; }}
  thead th {{ text-align:left; padding:12px 14px; background:#17181f; color:#c7c9d1;
              font-size:12px; text-transform:uppercase; letter-spacing:0.06em;
              border-bottom:1px solid #2a2c36; white-space:nowrap; }}
  tbody td {{ padding:11px 14px; border-bottom:1px solid #1d1f27; vertical-align:top; }}
  tbody tr:nth-child(even) {{ background:#101118; }}
  .idx {{ color:#6b7280; width:44px; }}
  .nw {{ white-space:nowrap; }}
  tbody td:nth-child(3) {{ color:#8ab4f8; }}
</style>
<h1>Sonic Pulse &mdash; {html.escape(title)}</h1>
<p class="sub">{len(rows)} accepted {plural}</p>{warn}
<table><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table>"""


def fetch():
    base = os.environ.get("SONICPULSE_SUPABASE_URL")
    key = os.environ.get("SONICPULSE_SUPABASE_SERVICE_ROLE_KEY")
    if not base or not key:
        sys.exit(
            "No --input given and SONICPULSE_SUPABASE_URL / "
            "SONICPULSE_SUPABASE_SERVICE_ROLE_KEY are not set.\n"
            "Either set them in the web environment (they apply to NEW sessions), "
            "or pass a JSON export from /api/admin/wayfinder via --input."
        )
    url = (
        base.rstrip("/")
        + "/rest/v1/wayfinder_applications?"
        + urllib.parse.urlencode({"select": FETCH_COLUMNS, "status": "eq.accepted"})
    )
    req = urllib.request.Request(
        url, headers={"apikey": key, "Authorization": "Bearer " + key}
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        sys.exit(f"Supabase returned {e.code}: {e.read().decode()[:300]}")


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
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[1])
    ap.add_argument("--view", choices=sorted(VIEWS), default="summary")
    ap.add_argument("--input", help='JSON export path, or "-" for stdin')
    ap.add_argument("--out", default="accepted-wayfinders.png")
    args = ap.parse_args()
    out = os.path.abspath(args.out)

    if args.input is None:
        data = fetch()
    else:
        raw = sys.stdin.read() if args.input == "-" else open(args.input).read()
        data = json.loads(raw)
    if isinstance(data, dict):
        data = data.get("applications", [])
    rows = build_rows(data)
    if not rows:
        sys.exit("No accepted Wayfinder applications found.")

    tmp = out + ".html"
    with open(tmp, "w") as f:
        f.write(render_html(rows, args.view))

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
    print(f"Wrote {out} ({len(rows)} accepted, view={args.view})")


if __name__ == "__main__":
    main()
