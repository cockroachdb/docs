#!/usr/bin/env python3
"""
Compare prod vs stage with distinct=true and EXPLAIN ranking flips.

For each query:
- Fetch top-N from PROD and STAGE with getRankingInfo=true.
- Consider only PAGES common to both (URL sans anchor if --strip_anchor).
- Compute EXPECTED order under the new policy:
    has_date DESC, date DESC, weight_level ASC, weight_position ASC.
- Output a CSV with per-result positions (prod, stage, expected) and an explanation.

Env:
  ALGOLIA_APP_ID
  ALGOLIA_SEARCH_API_KEY

Usage:
  python compare_to_prod_explain.py --prod cockroachcloud_docs \
    --stage stage_cockroach_docs --queries queries.txt --topn 10 \
    --strip_anchor --out flips.csv
"""
import os, argparse, csv, sys
from typing import Dict, Any, List
from urllib.parse import urlsplit, urlunsplit
from algoliasearch.search_client import SearchClient

def strip_anchor(u: str) -> str:
    s = urlsplit(u)
    return urlunsplit((s.scheme, s.netloc, s.path, s.query, ""))

def load_queries(path: str) -> List[str]:
    with open(path, "r", encoding="utf-8") as f:
        return [q.strip() for q in f if q.strip() and not q.strip().startswith("#")]

def fetch_hits(client, index_name: str, q: str, n: int):
    params = {
        "distinct": True,
        "getRankingInfo": True,
        "hitsPerPage": n,
        "attributesToRetrieve": [
            "url","title","hierarchy","headings",
            "date","has_date","weight_level","weight_position"
        ],
        "analytics": False, "clickAnalytics": False
    }
    index = client.init_index(index_name)
    response = index.search(q, params)
    return [dict(hit) for hit in response['hits']]

def to_page_rows(hits: List[Dict[str,Any]], strip_flag: bool) -> List[Dict[str,Any]]:
    rows = []
    seen = set()
    for h in hits:
        url = h.get("url") or ""
        page = strip_anchor(url) if strip_flag else url
        if not page or page in seen:
            continue
        seen.add(page)
        # parse ints or provide defaults
        date_val = h.get("date")
        try:
            date_num = int(date_val) if date_val is not None and str(date_val).strip() != "" else None
        except Exception:
            date_num = None
        has_date = h.get("has_date")
        has_date = int(has_date) if has_date is not None else (1 if date_num is not None else 0)
        weight_level = h.get("weight_level")
        weight_level = int(weight_level) if weight_level is not None else 9
        weight_position = h.get("weight_position")
        weight_position = int(weight_position) if weight_position is not None else 999999

        rows.append({
            "page": page,
            "url": url,
            "date": date_num,
            "has_date": has_date,
            "weight_level": weight_level,
            "weight_position": weight_position,
            "_rankingInfo": h.get("_rankingInfo"),
        })
    return rows

def expected_sorted(pages: List[Dict[str,Any]]) -> List[str]:
    ranked = sorted(
        pages,
        key=lambda r: (-int(r["has_date"]), -(r["date"] or 0), int(r["weight_level"]), int(r["weight_position"]), r["page"]) 
    )
    return [r["page"] for r in ranked]

def analyze_query(client, prod_index, stage_index, q: str, topn: int, strip_flag: bool):
    hits_prod = fetch_hits(client, prod_index, q, topn)
    hits_stage = fetch_hits(client, stage_index, q, topn)

    P = to_page_rows(hits_prod, strip_flag)
    S = to_page_rows(hits_stage, strip_flag)

    Pset = {r['page'] for r in P}
    Sset = {r['page'] for r in S}
    common = list(Pset & Sset)
    if not common:
        return [], []

    combined: Dict[str, Dict[str,Any]] = {}
    for r in P:
        if r["page"] in common:
            combined[r["page"]] = dict(r)
    for r in S:
        if r["page"] in common:
            base = combined.get(r["page"], {})
            for k in ("date","has_date","weight_level","weight_position"):
                if r.get(k) is not None:
                    base[k] = r[k]
            combined[r["page"]] = base

    prod_order = [r["page"] for r in P if r["page"] in common]
    stage_order = [r["page"] for r in S if r["page"] in common]
    exp_order = expected_sorted([combined[p] for p in common])

    posP = {p:i+1 for i,p in enumerate(prod_order)}
    posS = {p:i+1 for i,p in enumerate(stage_order)}
    posE = {p:i+1 for i,p in enumerate(exp_order)}

    rows = []
    for p in common:
        row = {
            "query": q,
            "page": p,
            "prod_pos": posP.get(p, ""),
            "stage_pos": posS.get(p, ""),
            "expected_pos": posE.get(p, ""),
            "has_date": combined[p]["has_date"],
            "date": combined[p]["date"] or 0,
            "weight_level": combined[p]["weight_level"],
            "weight_position": combined[p]["weight_position"],
            "explanation": "",
        }
        reasons = []
        if row["expected_pos"] < row["prod_pos"]:
            if combined[p]["has_date"] == 1:
                reasons.append("has_date=1")
            if combined[p]["date"]:
                reasons.append(f"newer_date={combined[p]['date']}")
            reasons.append(f"structure(level={combined[p]['weight_level']},pos={combined[p]['weight_position']})")
        row["explanation"] = "; ".join(reasons)
        rows.append(row)

    summary = [f"- {q}: common={len(common)} flips={sum(1 for r in rows if r['prod_pos'] != r['expected_pos'])}"]
    tops = sorted([r for r in rows if r["prod_pos"] != r["expected_pos"]], key=lambda x: abs(int(x["prod_pos"])-int(x["expected_pos"])), reverse=True)[:8]
    for r in tops:
        summary.append(f"    • {r['page']}  prod#{r['prod_pos']} → stage#{r['stage_pos']} (expected#{r['expected_pos']})  [{r['explanation']}]")
    return rows, summary

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prod", required=True)
    ap.add_argument("--stage", required=True)
    ap.add_argument("--queries", required=True)
    ap.add_argument("--topn", type=int, default=10)
    ap.add_argument("--strip_anchor", action="store_true")
    ap.add_argument("--out", required=True, help="CSV output (flip explanations)")
    args = ap.parse_args()

    app = os.getenv("ALGOLIA_APP_ID")
    key = '9f4faf3cee32d8e9ec5e5a70cfe3f4ca'
    if not (app and key):
        print("Missing ALGOLIA_APP_ID / ALGOLIA_SEARCH_API_KEY", file=sys.stderr)
        sys.exit(2)

    client = SearchClient.create(app, key)

    queries = load_queries(args.queries)

    all_rows = []
    print(f"\nExplaining flips for {len(queries)} queries (topN={args.topn})...\n")
    for q in queries:
        rows, summary = analyze_query(client, args.prod, args.stage, q, args.topn, args.strip_anchor)
        for line in summary: print(line)
        all_rows.extend(rows)

    fieldnames = ["query","page","prod_pos","stage_pos","expected_pos","has_date","date","weight_level","weight_position","explanation"]
    with open(args.out, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in all_rows:
            w.writerow(r)

    print(f"\n[OK] Wrote detailed flip report → {args.out}")

if __name__ == "__main__":
    main()
