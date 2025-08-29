#!/usr/bin/env python3
"""
Production vs Stage Index Comparison Report
Generate comprehensive report for presentation
"""

import os
import logging
from algoliasearch.search.client import SearchClient
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

class IndexComparisonReport:
    def __init__(self):
        self.setup_algolia()
        
    def setup_algolia(self):
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        self.stage_client = SearchClient(app_id, admin_key)
        self.prod_client = SearchClient(app_id, read_key)
        
    def get_index_stats(self):
        """Get basic index statistics"""
        logger.info("📊 Getting index statistics...")
        
        # Production stats
        prod_search = self.prod_client.search_single_index("cockroachcloud_docs", {"query": "", "hitsPerPage": 1})
        prod_count = prod_search['nbHits']
        
        # Stage stats  
        stage_search = self.stage_client.search_single_index("stage_cockroach_docs", {"query": "", "hitsPerPage": 1})
        stage_count = stage_search['nbHits']
        
        return {
            'prod_count': prod_count,
            'stage_count': stage_count,
            'coverage': stage_count / prod_count * 100 if prod_count > 0 else 0
        }
    
    def get_sample_records(self):
        """Get sample records from both indexes"""
        logger.info("📄 Getting sample records...")
        
        # Production sample
        prod_sample = self.prod_client.search_single_index("cockroachcloud_docs", {"query": "backup", "hitsPerPage": 1})
        
        # Stage sample
        stage_sample = self.stage_client.search_single_index("stage_cockroach_docs", {"query": "backup", "hitsPerPage": 1})
        
        return {
            'prod_record': prod_sample['hits'][0] if prod_sample['hits'] else None,
            'stage_record': stage_sample['hits'][0] if stage_sample['hits'] else None
        }
    
    def compare_search_rankings(self):
        """Compare search rankings for key queries"""
        logger.info("🔍 Comparing search rankings...")
        
        test_queries = ['backup', 'create table', 'performance', 'authentication', 'cluster']
        results = {}
        
        for query in test_queries:
            # Production results
            prod_response = self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
            
            # Stage results
            stage_response = self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
            
            prod_titles = [hit.get('title', '') for hit in prod_response['hits']]
            stage_titles = [hit.get('title', '') for hit in stage_response['hits']]
            
            # Calculate similarity
            exact_matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
            
            results[query] = {
                'prod_titles': prod_titles,
                'stage_titles': stage_titles,
                'similarity': similarity,
                'exact_matches': exact_matches,
                'total_results': len(prod_titles)
            }
            
            logger.info(f"   {query}: {similarity:.0f}% similarity ({exact_matches}/{len(prod_titles)} matches)")
        
        return results
    
    def analyze_field_structure(self, prod_record, stage_record):
        """Analyze field structure differences"""
        if not prod_record or not stage_record:
            return {}
            
        prod_fields = set(k for k in prod_record.keys() if not k.startswith('_'))
        stage_fields = set(k for k in stage_record.keys() if not k.startswith('_'))
        
        return {
            'prod_fields': sorted(prod_fields),
            'stage_fields': sorted(stage_fields),
            'common_fields': sorted(prod_fields & stage_fields),
            'prod_only': sorted(prod_fields - stage_fields),
            'stage_only': sorted(stage_fields - prod_fields),
            'field_parity': len(prod_fields & stage_fields) / len(prod_fields) * 100 if prod_fields else 0
        }
    
    def generate_report(self):
        """Generate comprehensive comparison report"""
        logger.info("📋 Generating comprehensive report...")
        
        # Get all data
        stats = self.get_index_stats()
        samples = self.get_sample_records()
        rankings = self.compare_search_rankings()
        field_analysis = self.analyze_field_structure(samples['prod_record'], samples['stage_record'])
        
        # Calculate overall metrics
        avg_ranking_similarity = sum(r['similarity'] for r in rankings.values()) / len(rankings)
        
        print("\n" + "="*80)
        print("🎯 ALGOLIA RUBY GEM → PYTHON API MIGRATION REPORT")
        print("="*80)
        
        print(f"\n📊 INDEX OVERVIEW")
        print(f"Production Index: cockroachcloud_docs ({stats['prod_count']:,} records)")
        print(f"Stage Index: stage_cockroach_docs ({stats['stage_count']:,} records)")
        print(f"Coverage: {stats['coverage']:.1f}%")
        
        print(f"\n🏗️ RECORD STRUCTURE")
        print(f"Field Structure Parity: {field_analysis['field_parity']:.1f}%")
        print(f"Production Fields ({len(field_analysis['prod_fields'])}): {', '.join(field_analysis['prod_fields'])}")
        print(f"Stage Fields ({len(field_analysis['stage_fields'])}): {', '.join(field_analysis['stage_fields'])}")
        if field_analysis['prod_only']:
            print(f"Missing in Stage: {', '.join(field_analysis['prod_only'])}")
        if field_analysis['stage_only']:
            print(f"Extra in Stage: {', '.join(field_analysis['stage_only'])}")
        
        print(f"\n🔍 SEARCH RANKING COMPARISON")
        print(f"Average Ranking Similarity: {avg_ranking_similarity:.1f}%")
        print("\nQuery-by-Query Results:")
        for query, data in rankings.items():
            print(f"  {query}: {data['similarity']:.0f}% ({data['exact_matches']}/{data['total_results']} matches)")
            print(f"    Production: {', '.join(data['prod_titles'][:3])}...")
            print(f"    Stage: {', '.join(data['stage_titles'][:3])}...")
        
        if samples['prod_record'] and samples['stage_record']:
            print(f"\n📄 SAMPLE RECORD COMPARISON")
            print(f"Production Sample: {samples['prod_record'].get('title', 'N/A')}")
            print(f"  URL: {samples['prod_record'].get('url', 'N/A')}")
            print(f"  Version: {samples['prod_record'].get('version', 'N/A')}")
            print(f"  Content Length: {len(samples['prod_record'].get('content', ''))}")
            
            print(f"\nStage Sample: {samples['stage_record'].get('title', 'N/A')}")
            print(f"  URL: {samples['stage_record'].get('url', 'N/A')}")
            print(f"  Version: {samples['stage_record'].get('version', 'N/A')}")
            print(f"  Content Length: {len(samples['stage_record'].get('content', ''))}")
        
        print(f"\n🎯 MIGRATION STATUS")
        if avg_ranking_similarity >= 75 and field_analysis['field_parity'] >= 95:
            status = "✅ EXCELLENT - Migration highly successful"
        elif avg_ranking_similarity >= 60 and field_analysis['field_parity'] >= 80:
            status = "✅ GOOD - Migration successful with minor gaps"
        else:
            status = "⚠️ NEEDS IMPROVEMENT - Gaps identified"
        
        print(f"Overall Assessment: {status}")
        print("="*80)

def main():
    try:
        reporter = IndexComparisonReport()
        reporter.generate_report()
    except Exception as e:
        logger.error(f"❌ Report generation failed: {e}")
        raise

if __name__ == '__main__':
    main()