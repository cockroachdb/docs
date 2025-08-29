#!/usr/bin/env python3
"""
Debug 60% performing queries to identify what's missing
"""

import os
from algoliasearch.search_client import SearchClient

def debug_60_percent_queries():
    """Debug the 60% performing queries"""
    
    # Setup clients
    app_id = '7RXZLDVR5F'
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
    
    stage_client = SearchClient.create(app_id, admin_key)
    prod_client = SearchClient.create(app_id, read_key)
    
    stage_index = stage_client.init_index('stage_cockroach_docs')
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    queries_60_percent = ['select', 'insert', 'changefeed', 'troubleshooting']
    
    all_missing_files = []
    
    for query in queries_60_percent:
        print(f"\n🔍 DEBUGGING '{query}' (currently 60%):")
        print("="*60)
        
        try:
            # Get production results
            prod = prod_index.search(query, {
                "hitsPerPage": 10,  # Get more to see what we're missing
                "attributesToRetrieve": ["title", "url", "docs_area", "summary"]
            })
            
            # Get stage results  
            stage = stage_index.search(query, {
                "hitsPerPage": 10,
                "attributesToRetrieve": ["title", "url", "docs_area", "summary"]
            })
            
            print("🏭 PRODUCTION TOP 10:")
            prod_titles = []
            prod_files = []
            for i, hit in enumerate(prod['hits'], 1):
                title = hit.get('title', 'No title')
                url = hit.get('url', '')
                docs_area = hit.get('docs_area', 'No area')
                path = url.split('/docs/')[-1] if '/docs/' in url else url
                prod_titles.append(title)
                prod_files.append(path)
                print(f"{i}. {title}")
                print(f"   Path: {path}")
                print(f"   Area: {docs_area}")
            
            print("\n🎭 STAGE TOP 10:")
            stage_titles = []
            for i, hit in enumerate(stage['hits'], 1):
                title = hit.get('title', 'No title')
                url = hit.get('url', '')
                docs_area = hit.get('docs_area', 'No area')
                path = url.split('/docs/')[-1] if '/docs/' in url else url
                stage_titles.append(title)
                print(f"{i}. {title}")
                print(f"   Path: {path}")
                print(f"   Area: {docs_area}")
            
            # Find missing from top 10
            missing_titles = []
            missing_files = []
            for i, title in enumerate(prod_titles):
                if title not in stage_titles:
                    missing_titles.append(title)
                    missing_files.append(prod_files[i])
            
            print(f"\n🎯 MATCHES: {len([t for t in prod_titles[:5] if t in stage_titles[:5]])}/5 in top 5")
            print(f"   {len([t for t in prod_titles if t in stage_titles])}/10 in top 10")
            
            if missing_titles:
                print(f"\n❌ MISSING FROM STAGE (would improve score):")
                for i, title in enumerate(missing_titles[:5]):  # Show top 5 missing
                    print(f"   - {title}")
                    print(f"     File: {missing_files[i]}")
                    all_missing_files.append(missing_files[i])
                
        except Exception as e:
            print(f"❌ Error debugging '{query}': {e}")
    
    print(f"\n📋 ALL MISSING FILES TO ADD:")
    print("-"*60)
    # Deduplicate
    unique_missing = list(set(all_missing_files))
    for file_path in unique_missing[:15]:  # Limit to top 15 most important
        print(f"   {file_path}")
    
    return unique_missing[:15]

if __name__ == '__main__':
    missing_files = debug_60_percent_queries()