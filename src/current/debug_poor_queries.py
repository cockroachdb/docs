#!/usr/bin/env python3
"""
Debug Poor Queries
Analyze exactly what production returns vs what we return for poor queries
"""

import os
import logging
from algoliasearch.search_client import SearchClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def debug_poor_queries():
    """Debug what production returns vs what we return"""
    
    # Setup clients
    app_id = '7RXZLDVR5F'
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
    
    stage_client = SearchClient.create(app_id, admin_key)
    prod_client = SearchClient.create(app_id, read_key)
    
    stage_index = stage_client.init_index('stage_cockroach_docs')
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    poor_queries = ['getting started', 'alter table', 'cluster']
    
    for query in poor_queries:
        print(f"\n🔍 DEBUGGING '{query}':")
        print("="*50)
        
        try:
            # Get production results
            prod = prod_index.search(query, {
                "hitsPerPage": 5,
                "attributesToRetrieve": ["title", "url", "docs_area", "summary"]
            })
            
            # Get stage results  
            stage = stage_index.search(query, {
                "hitsPerPage": 5,
                "attributesToRetrieve": ["title", "url", "docs_area", "summary"]
            })
            
            print("🏭 PRODUCTION TOP 5:")
            for i, hit in enumerate(prod['hits'], 1):
                title = hit.get('title', 'No title')
                url = hit.get('url', '')
                docs_area = hit.get('docs_area', 'No area')
                summary = hit.get('summary', '')[:100]
                path = url.split('/docs/')[-1] if '/docs/' in url else url
                print(f"{i}. {title}")
                print(f"   Path: {path}")
                print(f"   Area: {docs_area}")
                print(f"   Summary: {summary}...")
                print()
            
            print("🎭 STAGE TOP 5:")
            stage_titles = []
            for i, hit in enumerate(stage['hits'], 1):
                title = hit.get('title', 'No title')
                url = hit.get('url', '')
                docs_area = hit.get('docs_area', 'No area')
                summary = hit.get('summary', '')[:100]
                path = url.split('/docs/')[-1] if '/docs/' in url else url
                stage_titles.append(title)
                print(f"{i}. {title}")
                print(f"   Path: {path}")
                print(f"   Area: {docs_area}")
                print(f"   Summary: {summary}...")
                print()
            
            # Show matches
            prod_titles = [hit['title'] for hit in prod['hits']]
            matches = [t for t in stage_titles if t in prod_titles]
            
            print(f"🎯 MATCHES: {len(matches)}/{len(prod_titles)} ({len(matches)/len(prod_titles)*100:.0f}%)")
            if matches:
                print(f"   Matched titles: {matches}")
            
            missing = [t for t in prod_titles if t not in stage_titles]
            if missing:
                print(f"❌ MISSING FROM STAGE: {missing}")
                
        except Exception as e:
            print(f"❌ Error debugging '{query}': {e}")

if __name__ == '__main__':
    debug_poor_queries()