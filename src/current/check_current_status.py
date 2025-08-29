#!/usr/bin/env python3
"""Check current index status and test poor queries"""

import os
import asyncio
from algoliasearch.search_client import SearchClient

def check_status():
    """Check current stage index status"""
    
    # Setup client
    stage_client = SearchClient.create('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    prod_client = SearchClient.create('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    
    stage_index = stage_client.init_index('stage_cockroach_docs')
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    # Check record counts
    stage_stats = stage_index.search("", {"hitsPerPage": 1})
    prod_stats = prod_index.search("", {"hitsPerPage": 1})
    
    print(f"📊 Current Status:")
    print(f"   Stage index: {stage_stats['nbHits']} records")
    print(f"   Prod index: {prod_stats['nbHits']} records")
    
    # Test poor queries
    poor_queries = ['getting started', 'alter table', 'cluster']
    
    print(f"\n🔍 Current Poor Query Performance:")
    total_sim = 0
    
    for query in poor_queries:
        try:
            prod = prod_index.search(query, {"hitsPerPage": 5})
            stage = stage_index.search(query, {"hitsPerPage": 5})
            
            prod_titles = [hit['title'] for hit in prod['hits']]
            stage_titles = [hit['title'] for hit in stage['hits']]
            
            matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = matches / len(prod_titles) * 100 if prod_titles else 0
            total_sim += similarity
            
            status = "🎉" if similarity >= 70 else "⚠️"
            print(f"   {status} '{query}': {similarity:.0f}% ({matches}/{len(prod_titles)})")
            
        except Exception as e:
            print(f"   ❌ '{query}': Error - {e}")
    
    avg_sim = total_sim / len(poor_queries)
    print(f"\n📈 Average poor query performance: {avg_sim:.1f}%")
    
    if avg_sim >= 70:
        print("🎉 TARGET ACHIEVED!")
    else:
        print("⚠️ Still need improvement")

if __name__ == '__main__':
    check_status()