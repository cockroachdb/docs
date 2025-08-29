#!/usr/bin/env python3
"""
Check if the added records exist and where they rank
"""

import os
from algoliasearch.search_client import SearchClient

def check_60_percent_status():
    """Check status of 60% queries"""
    
    # Setup clients
    app_id = '7RXZLDVR5F'
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
    
    stage_client = SearchClient.create(app_id, admin_key)
    prod_client = SearchClient.create(app_id, read_key)
    
    stage_index = stage_client.init_index('stage_cockroach_docs')
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    # Check specific records we added
    added_records = [
        "DELETE",
        "Connect to a CockroachDB Standard Cluster",
        "Query Data",
        "Pod Scheduling",
        "Update Data",
        "EXPLAIN",
        "Upgrade a cluster in CockroachDB Cloud",
        "Configure LDAP Authentication",
        "Upgrade CockroachDB self-hosted",
        "Upgrade a cluster in Kubernetes with the CockroachDB Operator",
        "Upgrade a cluster in Kubernetes"
    ]
    
    print("🔍 CHECKING IF ADDED RECORDS EXIST IN INDEX:")
    print("="*60)
    
    for title in added_records:
        try:
            result = stage_index.search(title, {"hitsPerPage": 1})
            if result['hits'] and result['hits'][0]['title'] == title:
                print(f"✅ Found: {title}")
            else:
                print(f"⚠️ Not exact match: {title}")
        except:
            print(f"❌ Not found: {title}")
    
    print("\n🔍 CHECKING QUERY PERFORMANCE IN DETAIL:")
    print("="*60)
    
    queries = ['select', 'insert', 'changefeed', 'troubleshooting']
    
    for query in queries:
        print(f"\n📊 Query: '{query}'")
        
        # Get more results to see where our records rank
        prod = prod_index.search(query, {"hitsPerPage": 10})
        stage = stage_index.search(query, {"hitsPerPage": 10})
        
        prod_titles = [hit['title'] for hit in prod['hits'][:5]]
        stage_titles_10 = [hit['title'] for hit in stage['hits'][:10]]
        stage_titles_5 = stage_titles_10[:5]
        
        # Check matches in top 5
        matches_5 = sum(1 for t in stage_titles_5 if t in prod_titles)
        similarity_5 = matches_5 / len(prod_titles) * 100 if prod_titles else 0
        
        print(f"   Top 5 similarity: {similarity_5:.0f}% ({matches_5}/5)")
        
        # Check if production's top 5 exist anywhere in our top 10
        for i, prod_title in enumerate(prod_titles, 1):
            if prod_title in stage_titles_10:
                rank = stage_titles_10.index(prod_title) + 1
                status = "✅" if rank <= 5 else "⚠️"
                print(f"   {status} Prod #{i} '{prod_title}' → Stage #{rank}")
            else:
                print(f"   ❌ Prod #{i} '{prod_title}' → Not in top 10")

if __name__ == '__main__':
    check_60_percent_status()