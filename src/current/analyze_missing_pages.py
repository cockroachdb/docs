#!/usr/bin/env python3
"""Analyze what specific pages are missing for poor queries"""

import os
import asyncio
from algoliasearch.search.client import SearchClient
from pathlib import Path

async def analyze_missing():
    """Find what pages are missing for poor queries"""
    
    stage_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    prod_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    
    poor_queries = ['getting started', 'alter table', 'cluster']
    site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
    
    for query in poor_queries:
        print(f"\n📊 ANALYZING: '{query}'")
        
        # Get production top results
        prod_results = await prod_client.search_single_index("cockroachcloud_docs", {
            "query": query,
            "hitsPerPage": 5,
            "attributesToRetrieve": ["title", "url", "docs_area"]
        })
        
        stage_results = await stage_client.search_single_index("stage_cockroach_docs", {
            "query": query,
            "hitsPerPage": 5,
            "attributesToRetrieve": ["title", "url"]
        })
        
        prod_titles = [hit.title for hit in prod_results.hits]
        stage_titles = [hit.title for hit in stage_results.hits]
        
        print(f"   Production top 5: {prod_titles}")
        print(f"   Stage top 5: {stage_titles}")
        
        # Find missing pages
        missing = [t for t in prod_titles if t not in stage_titles]
        print(f"   Missing: {missing}")
        
        # Check if we have local files for these missing pages
        for i, hit in enumerate(prod_results.hits):
            if hit.title in missing:
                url = hit.url
                if '/docs/' in url:
                    path = url.split('/docs/')[-1]
                    local_file = site_path / path
                    
                    exists = "✅" if local_file.exists() else "❌"
                    print(f"   {exists} Rank {i+1}: '{hit.title}' -> {path}")

if __name__ == '__main__':
    asyncio.run(analyze_missing())