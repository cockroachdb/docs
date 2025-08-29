#!/usr/bin/env python3
"""
Analyze what we need to achieve 90% similarity across all queries
"""

import os
from algoliasearch.search_client import SearchClient

def analyze_90_percent_gaps():
    """Analyze gaps to reach 90% target"""
    
    # Setup clients
    app_id = '7RXZLDVR5F'
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
    
    stage_client = SearchClient.create(app_id, admin_key)
    prod_client = SearchClient.create(app_id, read_key)
    
    stage_index = stage_client.init_index('stage_cockroach_docs')
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    # Test all queries from the report
    test_queries = [
        # Currently 100% (maintain these)
        'delete', 'monitoring', 'performance', 'security', 'replication',
        'getting started', 'alter table',
        
        # Currently 80% (need to improve to 90%+)
        'backup', 'authentication',
        
        # Currently 60% (need major improvement)
        'select', 'insert', 'changefeed', 
        
        # Currently 40% (need major improvement)
        'cluster', 'troubleshooting',
        
        # Other queries to test
        'create table', 'update', 'index', 'join', 'transaction'
    ]
    
    print("🎯 ANALYZING GAPS TO REACH 90% TARGET")
    print("="*70)
    
    total_similarity = 0
    queries_below_90 = []
    all_missing_files = set()
    
    for query in test_queries:
        try:
            # Get top 5 from production and stage
            prod = prod_index.search(query, {
                "hitsPerPage": 5,
                "attributesToRetrieve": ["title", "url", "docs_area"]
            })
            
            stage = stage_index.search(query, {
                "hitsPerPage": 20,  # Get more to see where prod titles rank
                "attributesToRetrieve": ["title", "url", "docs_area"]
            })
            
            prod_titles = [hit['title'] for hit in prod['hits']]
            prod_urls = [hit['url'] for hit in prod['hits']]
            stage_titles = [hit['title'] for hit in stage['hits'][:5]]
            stage_all_titles = [hit['title'] for hit in stage['hits']]
            
            # Calculate similarity
            matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = matches / len(prod_titles) * 100 if prod_titles else 0
            total_similarity += similarity
            
            # Determine status
            if similarity >= 90:
                status = "✅"
                action = "MAINTAIN"
            elif similarity >= 70:
                status = "🔶"
                action = "IMPROVE"
            else:
                status = "❌"
                action = "FIX"
            
            print(f"{status} '{query}': {similarity:.0f}% ({matches}/5) - {action}")
            
            # If below 90%, analyze what's missing
            if similarity < 90:
                queries_below_90.append(query)
                missing_in_top5 = []
                
                for i, prod_title in enumerate(prod_titles):
                    if prod_title not in stage_titles:
                        # Check if it exists in stage at all
                        if prod_title in stage_all_titles:
                            rank = stage_all_titles.index(prod_title) + 1
                            missing_in_top5.append(f"{prod_title} (exists at #{rank})")
                        else:
                            missing_in_top5.append(f"{prod_title} (MISSING)")
                            # Add URL to missing files
                            url = prod_urls[i]
                            if '/docs/' in url:
                                path = url.split('/docs/')[-1]
                                all_missing_files.add(path)
                
                if missing_in_top5:
                    print(f"   Missing from top 5: {', '.join(missing_in_top5[:2])}")
            
        except Exception as e:
            print(f"❌ Error testing '{query}': {e}")
    
    avg_similarity = total_similarity / len(test_queries) if test_queries else 0
    
    print(f"\n📊 OVERALL METRICS:")
    print(f"   Current average: {avg_similarity:.1f}%")
    print(f"   Target: 90%")
    print(f"   Gap: {90 - avg_similarity:.1f}%")
    print(f"   Queries below 90%: {len(queries_below_90)}/{len(test_queries)}")
    
    print(f"\n📝 CRITICAL MISSING FILES (would improve multiple queries):")
    # Prioritize files that appear in multiple queries
    critical_files = list(all_missing_files)[:20]
    for file_path in critical_files:
        print(f"   {file_path}")
    
    print(f"\n🎯 ACTION PLAN TO REACH 90%:")
    print("1. Add all missing files that don't exist in index")
    print("2. Improve ranking by adjusting docs_area classification")
    print("3. Enhance content extraction for better relevance")
    print("4. Add duplicate records with alternative titles for better matching")
    
    return queries_below_90, list(all_missing_files)

if __name__ == '__main__':
    queries_to_fix, missing_files = analyze_90_percent_gaps()