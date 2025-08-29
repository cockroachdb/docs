#!/usr/bin/env python3
"""
Check which specific files are missing from our production path filtering
"""

import os
from pathlib import Path
from algoliasearch.search_client import SearchClient

def check_missing_files():
    """Check if the missing files exist and why they're not included"""
    
    # Setup clients
    app_id = '7RXZLDVR5F'
    read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
    
    prod_client = SearchClient.create(app_id, read_key)
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
    
    # Get production paths
    print("📁 Getting production paths...")
    production_paths = set()
    
    for page in range(10):
        try:
            results = prod_index.search("", {
                "hitsPerPage": 1000,
                "page": page,
                "attributesToRetrieve": ["url"]
            })
            
            if not results['hits']:
                break
            
            for hit in results['hits']:
                url = hit.get('url', '')
                if url and '/docs/' in url:
                    path = url.split('/docs/')[-1]
                    production_paths.add(path)
            
            if len(results['hits']) < 1000:
                break
                
        except Exception as e:
            print(f"Error: {e}")
            break
    
    print(f"✅ Found {len(production_paths)} production paths")
    
    # Check specific missing files
    missing_files_from_debug = [
        # Getting started missing
        "v25.3/orchestrate-cockroachdb-with-kubernetes-multi-cluster.html",
        "v25.3/deploy-cockroachdb-with-kubernetes-insecure.html", 
        "cockroachcloud/ccloud-get-started.html",
        "cockroachcloud/free-trial.html",
        
        # ALTER TABLE missing
        "v25.3/eventlog.html",
        "v25.3/known-limitations.html", 
        "v25.3/sql-audit-logging.html",
        
        # Cluster missing
        "cockroachcloud/cluster-overview-page.html",
        "v25.3/cluster-settings.html",
        "v25.3/monitor-cockroachdb-kubernetes.html",
        "v25.3/sso-sql.html"
    ]
    
    print(f"\n🔍 Checking specific missing files:")
    
    for file_path in missing_files_from_debug:
        # Check if file exists locally
        full_local_path = site_path / file_path
        exists_locally = full_local_path.exists()
        
        # Check if path is in production
        in_production = file_path in production_paths
        
        status = "✅" if exists_locally and in_production else "❌"
        local_status = "📁 EXISTS" if exists_locally else "❌ MISSING"
        prod_status = "🏭 IN PROD" if in_production else "❌ NOT IN PROD"
        
        print(f"{status} {file_path}")
        print(f"   Local: {local_status}")
        print(f"   Production: {prod_status}")
        
        if exists_locally and not in_production:
            print(f"   🔍 Issue: File exists locally but not found in production paths")
        elif not exists_locally and in_production:
            print(f"   🔍 Issue: File in production but missing locally")
        elif not exists_locally and not in_production:
            print(f"   🔍 Issue: File missing both locally and in production paths")
        
        print()

if __name__ == '__main__':
    check_missing_files()