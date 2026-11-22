"""Reconstruct the original Shiny CSV from the single bundled dataset snapshot."""
import csv
import json
from pathlib import Path

root = Path(__file__).resolve().parent
meta = json.loads((root / "docs/data/index.json").read_text())
rows = []
for path in sorted((root / "docs/data").glob("*.json")):
    if path.name != "index.json":
        for values in json.loads(path.read_text()).values():
            rows.extend(values)
assert len(rows) == meta["rows"]
target = root / "original/data/gpa.csv"
target.parent.mkdir(parents=True, exist_ok=True)
with target.open("w", newline="") as handle:
    writer = csv.writer(handle)
    writer.writerow(meta["columns"])
    writer.writerows(rows)
print(f"Restored {len(rows):,} records to {target}")
