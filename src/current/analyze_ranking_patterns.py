#!/usr/bin/env python3
"""Analyze what makes pages rank well in production for poor queries"""

import os
import asyncio
from algoliasearch.search.client import SearchClient

async def analyze_ranking_patterns():
    """Analyze production ranking patterns for poor queries"""
    
    prod_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    stage_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    
    poor_queries = ['getting started', 'alter table', 'cluster']
    
    for query in poor_queries:
        print(f"\n🔍 ANALYZING RANKING PATTERN: '{query}'")
        
        # Get top production results with full details
        prod_results = await prod_client.search_single_index("cockroachcloud_docs", {
            "query": query,
            "hitsPerPage": 5,
            "attributesToRetrieve": ["title", "content", "summary", "docs_area", "url", "headings"]
        })
        
        print(f"   Production top results analysis:")
        
        for i, hit in enumerate(prod_results.hits):
            hit_dict = hit.model_dump()
            title = hit_dict.get('title', '')
            content = hit_dict.get('content', '')
            summary = hit_dict.get('summary', '')
            docs_area = hit_dict.get('docs_area', '')
            
            # Analyze why this ranks well
            query_in_title = query.lower() in title.lower()
            query_in_summary = query.lower() in summary.lower() if summary else False
            query_in_content = query.lower() in content.lower()[:500] if content else False
            
            content_len = len(content) if content else 0
            summary_len = len(summary) if summary else 0
            
            print(f"   #{i+1}: '{title}'")
            print(f"        docs_area: {docs_area}")
            print(f"        query_in_title: {query_in_title}")
            print(f"        query_in_summary: {query_in_summary}")  
            print(f"        query_in_content_start: {query_in_content}")
            print(f"        content_length: {content_len}")
            print(f"        summary_length: {summary_len}")
        
        # Check what we have in stage for comparison
        stage_results = await stage_client.search_single_index("stage_cockroach_docs", {
            "query": query,
            "hitsPerPage": 10,
            "attributesToRetrieve": ["title", "docs_area"]
        })
        
        stage_titles = [hit.title for hit in stage_results.hits]
        print(f"\n   Our stage results: {stage_titles[:5]}")
        
        # Check if our new pages are found
        prod_titles = [hit.title for hit in prod_results.hits]
        found_new_pages = [t for t in prod_titles if t in stage_titles]
        print(f"   Found new pages in stage: {found_new_pages}")

if __name__ == '__main__':
    asyncio.run(analyze_ranking_patterns())