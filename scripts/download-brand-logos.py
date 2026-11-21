"""Prepare local brand assets used by the development catalog.

Run from any directory with: python scripts/download-brand-logos.py
The source catalog is maintained by the backend and migrated into CarBrands.
"""

import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT.parent / "Topcar_backEnd" / "src" / "TopCar.Infra.Data" / "Brands" / "brand-catalog.json"
DEST = ROOT / "public" / "brands"
DATASET = "https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos"
WIKIMEDIA = {
    "ora": "Ora logo.svg",
}
SPECIAL_URLS = {
    "jaecoo": "https://raw.githubusercontent.com/vehiclespecs/brand-logos/main/jaecoo-logo.svg",
    "effa": "https://static.wixstatic.com/media/32847a_c77bf2704f9649d8902ddc1c36c4d8d5~mv2.png",
    "shineray": "https://www.shineray.com.br/wp-content/uploads/2023/04/logo_shineray_final.png",
}


def fetch(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "TopCarBrandCatalog/1.0"})
    with urlopen(request, timeout=25) as response:
        return response.read()


def prepare(brand: dict) -> str:
    slug = brand["slug"]
    source = brand.get("source", slug)
    if source:
        destination = DEST / f"{slug}.png"
        if not destination.exists():
            destination.write_bytes(fetch(SPECIAL_URLS.get(slug, f"{DATASET}/thumb/{source}.png")))
    else:
        destination = DEST / f"{slug}.svg"
        if slug in SPECIAL_URLS:
            destination.write_bytes(fetch(SPECIAL_URLS[slug]))
        elif slug in WIKIMEDIA:
            title = quote(WIKIMEDIA[slug].replace(" ", "_"))
            destination.write_bytes(fetch(f"https://commons.wikimedia.org/wiki/Special:Redirect/file/{title}"))
        else:
            raise ValueError(f"Logo SVG sem origem: {slug}")
    return destination.name


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    brands = json.loads(CATALOG.read_text(encoding="utf-8"))
    with ThreadPoolExecutor(max_workers=8) as pool:
        jobs = {pool.submit(prepare, brand): brand["name"] for brand in brands}
        for job in as_completed(jobs):
            print(f"{jobs[job]}: {job.result()}")
    print(f"{len(brands)} logos preparados.")


if __name__ == "__main__":
    main()
