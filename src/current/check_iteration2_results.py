#!/usr/bin/env python3
"""
Check results of Iteration 2
"""

import os
import asyncio
from algoliasearch.search.client import SearchClient

async def check_results():
    # Setup client
    app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    
    client = SearchClient(app_id, admin_key)
    
    # Check stage index
    try:
        results = await client.search_single_index("stage_cockroach_docs", {"query": "", "hitsPerPage": 1})
        print(f"Stage index records: {results.nb_hits}")
        
        if results.hits:
            sample = results.hits[0].model_dump()
            fields = [k for k in sample.keys() if not k.startswith('_')]
            print(f"Sample fields ({len(fields)}): {sorted(fields)}")
            print(f"Sample title: {sample.get('title', 'N/A')}")
            print(f"Sample version: {sample.get('version', 'N/A')}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    asyncio.run(check_results())