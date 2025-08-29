#!/usr/bin/env python3
"""Final status check - simple and clean"""

import os
import asyncio
from algoliasearch.search.client import SearchClient

async def final_check():
    stage_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    prod_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    
    # Check index size
    stage_stats = await stage_client.search_single_index("stage_cockroach_docs", {"query": "", "hitsPerPage": 1})
    print(f"📊 Stage index: {stage_stats.nb_hits} records")
    
    # Test the 4 poor queries
    queries = ['getting started', 'alter table', 'cluster', 'create table']
    
    print(f"\n🎯 Poor Query Final Results:")
    total = 0
    fixed = 0
    
    for query in queries:
        try:
            prod = await prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
            stage = await stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
            
            prod_titles = [hit.title for hit in prod.hits]
            stage_titles = [hit.title for hit in stage.hits]
            
            matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = matches / len(prod_titles) * 100 if prod_titles else 0
            
            total += similarity
            if similarity >= 70:
                fixed += 1
            
            status = "🎉" if similarity >= 70 else "⚠️"
            print(f"   {status} {query}: {similarity:.0f}%")
            
        except Exception as e:
            print(f"   ❌ {query}: Error")
    
    avg = total / len(queries)
    print(f"\n📈 Final Results:")
    print(f"   Average: {avg:.1f}%")
    print(f"   Fixed (≥70%): {fixed}/4")
    
    if fixed >= 3:
        print("🎉 SUCCESS: Target achieved!")
    elif avg >= 50:
        print("✅ Significant improvement made") 
    else:
        print("⚠️ Limited improvement")

if __name__ == '__main__':
    asyncio.run(final_check())