#!/usr/bin/env python3
"""
Check ranking parity between production and staging indexes.
Tests search queries to ensure ranking order is maintained.
"""

import os
import sys
import json
from typing import Dict, List, Any, Tuple
from urllib.parse import urlsplit, urlunsplit
from algoliasearch.search_client import SearchClient

def strip_anchor(url: str) -> str:
    """Remove anchor from URL for page-level comparison."""
    s = urlsplit(url)
    return urlunsplit((s.scheme, s.netloc, s.path, s.query, ""))

def load_queries(filepath: str) -> List[str]:
    """Load test queries from file."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            queries = []
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    queries.append(line)
            return queries
    except FileNotFoundError:
        # Default queries if file doesn't exist
        print(f"⚠️  {filepath} not found, using default queries")
        return [
            "CREATE TABLE",
            "backup",
            "migration",
            "performance",
            "cluster",
            "security",
            "SQL",
            "index",
            "join",
            "transaction"
        ]

def search_index(client: SearchClient, index_name: str, query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Search an index and return results."""
    try:
        index = client.init_index(index_name)
        results = index.search(query, {
            'hitsPerPage': limit,
            'distinct': True,  # One result per page
            'getRankingInfo': True,
            'attributesToRetrieve': [
                'url', 'title', 'summary', 'content',
                'version', 'doc_type', 'docs_area',
                'custom_ranking', 'headings', 'hierarchy'
            ]
        })
        
        # Convert Hit objects to dicts and extract page URLs
        hits = []
        seen_pages = set()
        
        for hit in results['hits']:
            url = hit.get('url', '')
            page_url = strip_anchor(url)
            
            # Skip if we've already seen this page
            if page_url in seen_pages:
                continue
            seen_pages.add(page_url)
            
            hits.append({
                'url': url,
                'page_url': page_url,
                'title': hit.get('title', ''),
                'summary': hit.get('summary', ''),
                'content': hit.get('content', '')[:100],  # First 100 chars
                'version': hit.get('version', ''),
                'doc_type': hit.get('doc_type', ''),
                'docs_area': hit.get('docs_area', ''),
                'custom_ranking': hit.get('custom_ranking', {}),
                '_rankingInfo': hit.get('_rankingInfo', {})
            })
        
        return hits
    except Exception as e:
        print(f"Error searching {index_name} for '{query}': {e}")
        return []

def calculate_ranking_similarity(prod_results: List[Dict], stage_results: List[Dict]) -> Tuple[float, List[str]]:
    """
    Calculate similarity between two ranking lists.
    Returns (similarity_score, differences).
    """
    if not prod_results or not stage_results:
        return 0.0, ["One or both result sets are empty"]
    
    # Extract page URLs in order
    prod_pages = [r['page_url'] for r in prod_results]
    stage_pages = [r['page_url'] for r in stage_results]
    
    # Find common pages
    common_pages = set(prod_pages) & set(stage_pages)
    if not common_pages:
        return 0.0, ["No common pages in results"]
    
    # Calculate positional differences
    differences = []
    total_score = 0
    max_possible_score = len(common_pages)
    
    for page in common_pages:
        prod_pos = prod_pages.index(page) + 1 if page in prod_pages else 999
        stage_pos = stage_pages.index(page) + 1 if page in stage_pages else 999
        
        # Calculate score (1 point if same position, partial credit for close positions)
        if prod_pos == stage_pos:
            total_score += 1.0
        elif abs(prod_pos - stage_pos) <= 2:
            total_score += 0.5
            differences.append(f"{page}: #{prod_pos} → #{stage_pos} (Δ{abs(prod_pos - stage_pos)})")
        else:
            differences.append(f"{page}: #{prod_pos} → #{stage_pos} (Δ{abs(prod_pos - stage_pos)})")
    
    similarity = (total_score / max_possible_score) * 100 if max_possible_score > 0 else 0
    
    # Add info about missing pages
    prod_only = set(prod_pages[:10]) - set(stage_pages[:10])
    stage_only = set(stage_pages[:10]) - set(prod_pages[:10])
    
    if prod_only:
        differences.append(f"Only in prod top-10: {', '.join(list(prod_only)[:3])}")
    if stage_only:
        differences.append(f"Only in stage top-10: {', '.join(list(stage_only)[:3])}")
    
    return similarity, differences

def main():
    # Configuration
    APP_ID = os.environ.get("ALGOLIA_APP_ID", "7RXZLDVR5F")
    SEARCH_KEY = os.environ.get("ALGOLIA_SEARCH_API_KEY", "9f4faf3cee32d8e9ec5e5a70cfe3f4ca")
    PROD_INDEX = "cockroachcloud_docs"
    STAGE_INDEX = "stage_cockroach_docs"
    
    # Initialize client
    client = SearchClient.create(APP_ID, SEARCH_KEY)
    
    # Load test queries
    queries = load_queries('queries.txt')
    
    print(f"🔍 Testing ranking parity with {len(queries)} queries")
    print(f"   Production index: {PROD_INDEX}")
    print(f"   Staging index: {STAGE_INDEX}")
    print("="*80)
    
    # Track overall statistics
    total_similarity = 0
    perfect_matches = 0
    major_differences = []
    
    # Test each query
    for i, query in enumerate(queries, 1):
        print(f"\n📌 Query {i}/{len(queries)}: \"{query}\"")
        
        # Search both indexes
        prod_results = search_index(client, PROD_INDEX, query, limit=20)
        stage_results = search_index(client, STAGE_INDEX, query, limit=20)
        
        print(f"   Production: {len(prod_results)} results")
        print(f"   Staging: {len(stage_results)} results")
        
        # Compare rankings
        similarity, differences = calculate_ranking_similarity(prod_results, stage_results)
        total_similarity += similarity
        
        if similarity == 100:
            perfect_matches += 1
            print(f"   ✅ Perfect match! (100% similarity)")
        elif similarity >= 80:
            print(f"   ⚠️  Good match: {similarity:.1f}% similarity")
            if differences[:3]:  # Show first 3 differences
                for diff in differences[:3]:
                    print(f"      - {diff}")
        else:
            print(f"   ❌ Poor match: {similarity:.1f}% similarity")
            major_differences.append({
                'query': query,
                'similarity': similarity,
                'differences': differences
            })
            if differences[:5]:  # Show first 5 differences
                for diff in differences[:5]:
                    print(f"      - {diff}")
        
        # Show top 5 results for comparison
        if similarity < 80:  # Only show details for poor matches
            print(f"\n   Top 5 results comparison:")
            print(f"   {'Production':<50} | {'Staging':<50}")
            print(f"   {'-'*50} | {'-'*50}")
            for j in range(min(5, max(len(prod_results), len(stage_results)))):
                prod_title = prod_results[j]['title'][:47] + "..." if j < len(prod_results) else "---"
                stage_title = stage_results[j]['title'][:47] + "..." if j < len(stage_results) else "---"
                print(f"   {j+1}. {prod_title:<47} | {stage_title:<47}")
    
    # Print summary
    print("\n" + "="*80)
    print("📊 RANKING PARITY SUMMARY")
    print("="*80)
    
    avg_similarity = total_similarity / len(queries) if queries else 0
    
    print(f"\n📈 Overall statistics:")
    print(f"   Average similarity: {avg_similarity:.1f}%")
    print(f"   Perfect matches: {perfect_matches}/{len(queries)} ({perfect_matches/len(queries)*100:.1f}%)")
    print(f"   Major differences (< 80%): {len(major_differences)}")
    
    if avg_similarity >= 95:
        print(f"\n✅ EXCELLENT ranking parity!")
    elif avg_similarity >= 80:
        print(f"\n⚠️  GOOD ranking parity with some differences")
    else:
        print(f"\n❌ POOR ranking parity - investigation needed")
    
    # Show worst performing queries
    if major_differences:
        print(f"\n🔍 Queries with major ranking differences:")
        for item in sorted(major_differences, key=lambda x: x['similarity'])[:5]:
            print(f"\n   Query: \"{item['query']}\" ({item['similarity']:.1f}% similarity)")
            for diff in item['differences'][:3]:
                print(f"      - {diff}")
    
    # Save detailed report
    report = {
        'summary': {
            'total_queries': len(queries),
            'average_similarity': avg_similarity,
            'perfect_matches': perfect_matches,
            'major_differences': len(major_differences)
        },
        'queries': []
    }
    
    # Re-run to build detailed report
    for query in queries:
        prod_results = search_index(client, PROD_INDEX, query, limit=20)
        stage_results = search_index(client, STAGE_INDEX, query, limit=20)
        similarity, differences = calculate_ranking_similarity(prod_results, stage_results)
        
        report['queries'].append({
            'query': query,
            'similarity': similarity,
            'prod_count': len(prod_results),
            'stage_count': len(stage_results),
            'differences': differences[:10]  # Top 10 differences
        })
    
    with open('ranking_parity_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n📄 Detailed report saved to: ranking_parity_report.json")

if __name__ == "__main__":
    main()