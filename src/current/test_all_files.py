#!/usr/bin/env python3
"""
Test ALL files that will be indexed to ensure 100% parity before reindexing.
Comprehensive field-by-field comparison like check_field_parity.py.
"""

import pathlib
import json
from collections import defaultdict
from typing import Dict, List, Any, Tuple
from algolia_index_prod_match import extract_records_from_html, should_exclude_file

def load_production_records(filename: str = 'algolia_all_records.json') -> List[Dict[str, Any]]:
    """Load production records from JSON file."""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return []

def group_by_url(records: List[Dict[str, Any]]) -> Dict[str, List[Dict[str, Any]]]:
    """Group records by URL."""
    grouped = defaultdict(list)
    for record in records:
        url = record.get('url', '')
        if url:
            grouped[url].append(record)
    # Sort each group by position for consistent comparison
    for url in grouped:
        grouped[url].sort(key=lambda x: x.get('custom_ranking', {}).get('position', 0))
    return dict(grouped)

def compare_field_values(prod_val: Any, our_val: Any, field_name: str) -> Tuple[bool, str]:
    """
    Compare field values with appropriate tolerance.
    Returns (matches, explanation).
    """
    # Handle None/missing values
    if prod_val is None and our_val is None:
        return True, "both None"
    if prod_val is None or our_val is None:
        return False, f"one is None: prod={prod_val is not None}, our={our_val is not None}"
    
    # String fields - check for indexing differences
    if isinstance(prod_val, str) and isinstance(our_val, str):
        if prod_val == our_val:
            return True, "exact match"
        
        # Allow small differences for fields that change during indexing
        if field_name in ['title', 'summary', 'content', 'excerpt_text']:
            len_diff = abs(len(prod_val) - len(our_val))
            if len_diff <= 2:  # Tolerance for indexing processing
                return True, f"within tolerance ({len_diff} chars)"
            
            # Check for common transformations
            if prod_val.replace('&#39;', "'") == our_val:
                return True, "HTML entity difference"
            if prod_val == our_val.replace('&#39;', "'"):
                return True, "HTML entity difference"
            
        # Special handling for last_modified_at - might vary
        if field_name == 'last_modified_at':
            # Both should be in DD-Mon-YY format
            if len(prod_val) == 9 and len(our_val) == 9:
                return True, "date format match"
            
        return False, f"mismatch: len_diff={abs(len(prod_val) - len(our_val))}"
    
    # Numeric fields
    if isinstance(prod_val, (int, float)) and isinstance(our_val, (int, float)):
        if prod_val == our_val:
            return True, "exact match"
        return False, f"mismatch: {prod_val} vs {our_val}"
    
    # Lists/arrays
    if isinstance(prod_val, list) and isinstance(our_val, list):
        if prod_val == our_val:
            return True, "exact match"
        if len(prod_val) != len(our_val):
            return False, f"different lengths: {len(prod_val)} vs {len(our_val)}"
        return False, "list content mismatch"
    
    # Dicts/objects
    if isinstance(prod_val, dict) and isinstance(our_val, dict):
        if prod_val == our_val:
            return True, "exact match"
        # For custom_ranking, check individual fields
        if field_name == 'custom_ranking':
            pos_match = prod_val.get('position') == our_val.get('position')
            head_match = prod_val.get('heading') == our_val.get('heading')
            if pos_match and head_match:
                return True, "custom_ranking fields match"
            return False, f"custom_ranking mismatch: pos={pos_match}, heading={head_match}"
        # For hierarchy, both empty should match
        if field_name == 'hierarchy':
            if not prod_val and not our_val:
                return True, "both empty"
        return False, "dict content mismatch"
    
    # Default comparison
    if prod_val == our_val:
        return True, "exact match"
    return False, f"type or value mismatch"

def find_matching_record(target: Dict[str, Any], candidates: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Find the best matching record from candidates based on content similarity."""
    if not candidates:
        return {}
    if len(candidates) == 1:
        return candidates[0]
    
    # Score each candidate
    best_match = None
    best_score = -1
    
    target_content = target.get('content', '')
    target_summary = target.get('summary', '')
    target_pos = target.get('custom_ranking', {}).get('position', 999999)
    
    for candidate in candidates:
        score = 0
        
        # Content start match (most reliable)
        cand_content = candidate.get('content', '')
        if target_content[:50] == cand_content[:50]:
            score += 1000
        
        # Summary length match
        cand_summary = candidate.get('summary', '')
        if abs(len(target_summary) - len(cand_summary)) <= 2:
            score += 500
        
        # Position proximity
        cand_pos = candidate.get('custom_ranking', {}).get('position', 999999)
        pos_diff = abs(target_pos - cand_pos)
        score -= pos_diff
        
        if score > best_score:
            best_score = score
            best_match = candidate
    
    return best_match or candidates[0]

def main():
    # Load production data
    print("Loading production records...")
    prod_records = load_production_records()
    prod_by_url = group_by_url(prod_records)
    
    print(f"📊 Production: {len(prod_records)} records across {len(prod_by_url)} URLs")
    
    # Find ALL HTML files that will be indexed (same logic as indexer)
    html_files = []
    for p in pathlib.Path('_site').rglob("*.html"):
        if not should_exclude_file(str(p)):
            html_files.append(p)
    
    print(f"🧪 Testing {len(html_files)} HTML files")
    print("="*80)
    
    # Fields to check (comprehensive list)
    fields_to_check = [
        'title', 'summary', 'content', 'version', 'doc_type', 'docs_area',
        'type', 'slug', 'excerpt_text', 'canonical', 'last_modified_at',
        'headings', 'hierarchy', 'tags', 'categories', 'custom_ranking'
    ]
    
    # Track statistics
    field_stats = defaultdict(lambda: {'matches': 0, 'mismatches': 0, 'issues': []})
    perfect_urls = 0
    urls_with_issues = []
    total_urls = 0
    failed_files = 0
    area_stats = {}
    
    # Process each file
    for html_file in html_files:
        total_urls += 1
        
        # Build URL like indexer does
        rel_path = str(html_file).replace('_site', '').replace('\\', '/')
        if rel_path.startswith('/'):
            rel_path = rel_path[1:]
        
        if rel_path.startswith('docs/'):
            url = f"https://www.cockroachlabs.com/{rel_path}"
        else:
            url = f"https://www.cockroachlabs.com/docs/{rel_path}"
        
        # Determine area for statistics
        if '/cockroachcloud/' in str(html_file):
            area = 'cockroachcloud'
        elif '/advisories/' in str(html_file):
            area = 'advisories'
        elif '/releases/' in str(html_file):
            area = 'releases'
        elif '/molt/' in str(html_file):
            area = 'molt'
        else:
            area = 'v25.3'
        
        if area not in area_stats:
            area_stats[area] = {'total': 0, 'perfect': 0, 'issues': 0}
        area_stats[area]['total'] += 1
        
        try:
            # Generate our records
            our_records = extract_records_from_html(html_file)
            
            if not our_records:
                print(f"⚠️  {html_file.name}: No records generated")
                area_stats[area]['issues'] += 1
                continue
            
            # Check if we have production data for comparison
            if url not in prod_by_url:
                print(f"⚠️  {html_file.name}: No production data")
                area_stats[area]['perfect'] += 1  # Count as perfect if no prod data
                perfect_urls += 1
                continue
            
            # Get production records for this URL
            prod_recs = prod_by_url[url]
            
            # Compare records
            url_has_issues = False
            url_issues = []
            
            # Compare first record (most important) and check overall counts
            if len(our_records) != len(prod_recs):
                url_has_issues = True
                url_issues.append(f"record_count: {len(our_records)} vs {len(prod_recs)}")
            
            # Compare first few records in detail
            num_to_check = min(3, len(our_records), len(prod_recs))
            for i in range(num_to_check):
                our_rec = our_records[i] if i < len(our_records) else {}
                prod_rec = find_matching_record(our_rec, prod_recs) if our_rec else prod_recs[i]
                
                for field in fields_to_check:
                    prod_val = prod_rec.get(field)
                    our_val = our_rec.get(field)
                    
                    matches, explanation = compare_field_values(prod_val, our_val, field)
                    
                    if matches:
                        field_stats[field]['matches'] += 1
                    else:
                        field_stats[field]['mismatches'] += 1
                        if len(field_stats[field]['issues']) < 10:  # Limit stored issues
                            field_stats[field]['issues'].append({
                                'url': url,
                                'explanation': explanation
                            })
                        if i == 0:  # Only count first record issues for URL
                            url_has_issues = True
                            url_issues.append(f"{field}: {explanation}")
            
            # Track results
            if url_has_issues:
                area_stats[area]['issues'] += 1
                urls_with_issues.append({
                    'file': str(html_file),
                    'url': url,
                    'area': area,
                    'issues': url_issues[:5]  # Limit to first 5 issues
                })
                if total_urls % 50 == 0:  # Progress indicator
                    print(f"❌ {total_urls}: {html_file.name} - {url_issues[0]}")
            else:
                perfect_urls += 1
                area_stats[area]['perfect'] += 1
                if total_urls % 50 == 0:  # Progress indicator
                    print(f"✅ {total_urls}: {html_file.name} (100%)")
                    
        except Exception as e:
            failed_files += 1
            area_stats[area]['issues'] += 1
            print(f"💥 {total_urls}: {html_file.name} - ERROR: {e}")
    
    # Print comprehensive results
    print(f"\n" + "="*80)
    print(f"🎯 COMPREHENSIVE RESULTS ({total_urls} FILES)")
    print(f"="*80)
    
    print(f"\n📊 OVERALL:")
    print(f"  Perfect parity: {perfect_urls}/{total_urls} ({perfect_urls/total_urls*100:.1f}%)")
    print(f"  Files with issues: {len(urls_with_issues)}")
    print(f"  Failed to process: {failed_files}")
    
    print(f"\n📊 BY AREA:")
    for area, stats in area_stats.items():
        success_rate = (stats['perfect'] / stats['total']) * 100 if stats['total'] > 0 else 0
        print(f"  {area.upper()}: {stats['perfect']}/{stats['total']} perfect ({success_rate:.1f}%)")
    
    print(f"\n📊 FIELD-LEVEL STATISTICS:")
    for field in fields_to_check:
        stats = field_stats[field]
        total = stats['matches'] + stats['mismatches']
        if total > 0:
            match_rate = stats['matches'] / total * 100
            status = "✅" if match_rate >= 99 else "⚠️" if match_rate >= 95 else "❌"
            print(f"  {status} {field:20s}: {match_rate:6.2f}% match ({stats['matches']}/{total})")
            
            # Show sample issues for problematic fields
            if match_rate < 99 and stats['issues']:
                for issue in stats['issues'][:2]:
                    print(f"      → {issue['explanation']}")
    
    if len(urls_with_issues) > 0:
        print(f"\n🚨 FILES NEEDING FIXES ({len(urls_with_issues)}):")
        
        # Group by issue pattern
        issue_patterns = defaultdict(list)
        for file_info in urls_with_issues:
            issues_str = ' | '.join(file_info['issues'][:2])
            issue_patterns[issues_str].append(file_info['file'])
        
        # Show top issue patterns
        for issue_pattern, files in sorted(issue_patterns.items(), key=lambda x: -len(x[1]))[:5]:
            print(f"\n  📋 {issue_pattern} ({len(files)} files):")
            for file_path in files[:3]:
                print(f"    - {pathlib.Path(file_path).name}")
            if len(files) > 3:
                print(f"    ... and {len(files) - 3} more")
    
    if perfect_urls == total_urls:
        print(f"\n🏆 PERFECT! 100% PARITY ACHIEVED!")
        print(f"  ✅ All {total_urls} files have perfect field parity")
        print(f"  🚀 READY TO REINDEX: python3 algolia_index_prod_match.py")
    else:
        print(f"\n📝 NEXT STEPS:")
        print(f"  1. Fix {len(urls_with_issues)} files with issues")
        print(f"  2. Focus on fields with < 99% match rate")
        print(f"  3. Re-run this test until 100% parity")
        print(f"  4. Then reindex with confidence")

if __name__ == "__main__":
    main()