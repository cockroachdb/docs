#!/usr/bin/env python3
"""
Generate detailed query analysis for manager report
"""

import os
import asyncio
from algoliasearch.search.client import SearchClient

async def generate_detailed_analysis():
    stage_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    prod_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    
    test_queries = [
        'backup', 'restore', 'create table', 'alter table', 'select', 'insert', 'update', 'delete',
        'authentication', 'cluster', 'monitoring', 'performance', 'security',
        'changefeed', 'transaction', 'distributed', 'replication',
        'getting started', 'quickstart', 'troubleshooting', 'migration'
    ]
    
    detailed_results = ""
    
    for query in test_queries:
        try:
            prod_results = await prod_client.search_single_index("cockroachcloud_docs", {
                "query": query, 
                "hitsPerPage": 5,
                "attributesToRetrieve": ["title", "docs_area"]
            })
            
            stage_results = await stage_client.search_single_index("stage_cockroach_docs", {
                "query": query,
                "hitsPerPage": 5,
                "attributesToRetrieve": ["title", "docs_area"]
            })
            
            prod_titles = [hit.title for hit in prod_results.hits]
            stage_titles = [hit.title for hit in stage_results.hits]
            
            exact_matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
            
            # Find which titles match and which don't
            matched_titles = [t for t in stage_titles if t in prod_titles]
            missed_prod_titles = [t for t in prod_titles if t not in stage_titles]
            
            detailed_results += f"""
**Query: "{query}"** - {similarity:.0f}% similarity ({exact_matches}/{len(prod_titles)} matches)

✅ **Matched Results:**
"""
            for title in matched_titles:
                detailed_results += f"   - {title}\n"
            
            if missed_prod_titles:
                detailed_results += f"❌ **Production Results We're Missing:**\n"
                for title in missed_prod_titles:
                    detailed_results += f"   - {title}\n"
            
            if len(stage_titles) > len(matched_titles):
                extra_titles = [t for t in stage_titles if t not in prod_titles]
                if extra_titles:
                    detailed_results += f"➕ **Our Additional Results:**\n"
                    for title in extra_titles:
                        detailed_results += f"   - {title}\n"
            
        except Exception as e:
            detailed_results += f"**Query: \"{query}\"** - Error: {e}\n"
    
    return detailed_results

# Run analysis
result = asyncio.run(generate_detailed_analysis())
print(result)