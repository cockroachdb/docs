#!/usr/bin/env python3
"""
Actual Production Comparison
Compare with the real production index: cockroachcloud_docs
"""

import os
import logging
from algoliasearch.search_client import SearchClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ActualProductionComparison:
    def __init__(self):
        self.setup_algolia()
        
    def setup_algolia(self):
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        self.client = SearchClient.create(app_id, admin_key)
        self.read_client = SearchClient.create(app_id, read_key)
        
        self.stage_index = self.client.init_index('stage_cockroach_docs')
        self.prod_index = self.read_client.init_index('cockroachcloud_docs')  # ACTUAL PRODUCTION INDEX
        
    def compare_record_structures(self):
        """Compare actual record structures"""
        logger.info("🔍 COMPARING ACTUAL RECORD STRUCTURES")
        
        # Get production record
        prod_response = self.prod_index.search('backup', {
            'hitsPerPage': 1,
            'attributesToRetrieve': ['*']
        })
        
        # Get our stage record
        stage_response = self.stage_index.search('backup', {
            'hitsPerPage': 1,
            'attributesToRetrieve': ['*']
        })
        
        if prod_response['hits'] and stage_response['hits']:
            prod_record = prod_response['hits'][0]
            stage_record = stage_response['hits'][0]
            
            logger.info("📊 PRODUCTION RECORD STRUCTURE:")
            for field, value in prod_record.items():
                if field.startswith('_'):
                    continue
                value_preview = str(value)[:80] + "..." if len(str(value)) > 80 else str(value)
                logger.info(f"   {field}: {type(value).__name__} = {value_preview}")
                
            logger.info("\n📊 OUR STAGE RECORD STRUCTURE:")
            for field, value in stage_record.items():
                if field.startswith('_'):
                    continue
                value_preview = str(value)[:80] + "..." if len(str(value)) > 80 else str(value)
                logger.info(f"   {field}: {type(value).__name__} = {value_preview}")
                
            # Compare fields
            prod_fields = set(k for k in prod_record.keys() if not k.startswith('_'))
            stage_fields = set(k for k in stage_record.keys() if not k.startswith('_'))
            
            common_fields = prod_fields & stage_fields
            prod_only = prod_fields - stage_fields
            stage_only = stage_fields - prod_fields
            
            logger.info(f"\n📊 FIELD COMPARISON:")
            logger.info(f"   Common fields ({len(common_fields)}): {sorted(common_fields)}")
            logger.info(f"   Production only ({len(prod_only)}): {sorted(prod_only)}")
            logger.info(f"   Our stage only ({len(stage_only)}): {sorted(stage_only)}")
            
            field_parity = len(common_fields) / len(prod_fields) * 100 if prod_fields else 0
            logger.info(f"   🎯 FIELD STRUCTURE PARITY: {field_parity:.1f}%")
            
            return field_parity
            
    def compare_search_rankings(self):
        """Compare actual search rankings"""
        logger.info("\n🏆 COMPARING ACTUAL SEARCH RANKINGS")
        
        test_queries = ['backup', 'create table', 'performance', 'authentication', 'cluster']
        
        ranking_comparisons = {}
        
        for query in test_queries:
            logger.info(f"\n🔍 Query: '{query}'")
            
            # Production results
            prod_response = self.prod_index.search(query, {
                'hitsPerPage': 5,
                'attributesToRetrieve': ['title', 'url']
            })
            
            # Our results
            stage_response = self.stage_index.search(query, {
                'hitsPerPage': 5,
                'attributesToRetrieve': ['title', 'url']
            })
            
            prod_titles = [hit.get('title', '') for hit in prod_response['hits']]
            stage_titles = [hit.get('title', '') for hit in stage_response['hits']]
            
            logger.info("   📊 PRODUCTION TOP 5:")
            for i, title in enumerate(prod_titles, 1):
                logger.info(f"     {i}. {title}")
                
            logger.info("   📊 OUR STAGE TOP 5:")
            for i, title in enumerate(stage_titles, 1):
                logger.info(f"     {i}. {title}")
                
            # Calculate ranking similarity
            exact_matches = sum(1 for t in stage_titles if t in prod_titles)
            partial_matches = sum(1 for stage_t in stage_titles 
                                if any(word in prod_t.lower() for word in stage_t.lower().split() 
                                      for prod_t in prod_titles))
            
            ranking_similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
            
            logger.info(f"   🎯 Ranking similarity: {ranking_similarity:.1f}% ({exact_matches}/{len(prod_titles)} exact matches)")
            
            ranking_comparisons[query] = {
                'prod_results': len(prod_response['hits']),
                'stage_results': len(stage_response['hits']),
                'exact_matches': exact_matches,
                'ranking_similarity': ranking_similarity
            }
            
        return ranking_comparisons
        
    def compare_version_strategies(self):
        """Compare version strategies"""
        logger.info("\n📅 COMPARING VERSION STRATEGIES")
        
        # Check production versions
        prod_version_queries = ['v25.3', 'v24.3', 'v24.2', 'v23.2']
        
        logger.info("📊 PRODUCTION VERSION RESULTS:")
        for version in prod_version_queries:
            try:
                response = self.prod_index.search(version, {'hitsPerPage': 1})
                count = response.get('nbHits', 0)
                logger.info(f"   {version}: {count:,} results")
                
                if response['hits']:
                    sample = response['hits'][0]
                    title = sample.get('title', 'No title')
                    url = sample.get('url', 'No URL')
                    logger.info(f"     Sample: {title}")
                    logger.info(f"     URL: {url}")
                    
            except Exception as e:
                logger.error(f"   {version}: Error - {e}")
                
        # Check our versions
        logger.info("\n📊 OUR STAGE VERSION RESULTS:")
        for version in prod_version_queries:
            try:
                response = self.stage_index.search(version, {'hitsPerPage': 1})
                count = response.get('nbHits', 0)
                logger.info(f"   {version}: {count:,} results")
                
                if response['hits']:
                    sample = response['hits'][0]
                    title = sample.get('title', 'No title')
                    url = sample.get('url', 'No URL')
                    logger.info(f"     Sample: {title}")
                    logger.info(f"     URL: {url}")
                    
            except Exception as e:
                logger.error(f"   {version}: Error - {e}")
                
    def analyze_content_quality_differences(self):
        """Analyze content quality differences"""
        logger.info("\n📄 ANALYZING CONTENT QUALITY DIFFERENCES")
        
        query = 'backup'
        
        # Production content
        prod_response = self.prod_index.search(query, {
            'hitsPerPage': 3,
            'attributesToRetrieve': ['title', 'content', 'url']
        })
        
        # Our content
        stage_response = self.stage_index.search(query, {
            'hitsPerPage': 3,
            'attributesToRetrieve': ['title', 'content', 'url']
        })
        
        logger.info("📊 PRODUCTION CONTENT SAMPLES:")
        for i, hit in enumerate(prod_response['hits'], 1):
            title = hit.get('title', 'No title')
            content = hit.get('content', '')[:200] + '...' if len(hit.get('content', '')) > 200 else hit.get('content', '')
            logger.info(f"   {i}. {title}")
            logger.info(f"      Content: {content}")
            
        logger.info("\n📊 OUR STAGE CONTENT SAMPLES:")
        for i, hit in enumerate(stage_response['hits'], 1):
            title = hit.get('title', 'No title')
            content = hit.get('content', '')[:200] + '...' if len(hit.get('content', '')) > 200 else hit.get('content', '')
            logger.info(f"   {i}. {title}")
            logger.info(f"      Content: {content}")
            
    def get_index_sizes(self):
        """Compare index sizes"""
        logger.info("\n📊 COMPARING INDEX SIZES")
        
        # Production size
        prod_response = self.prod_index.search('', {'hitsPerPage': 1})
        prod_size = prod_response.get('nbHits', 0)
        
        # Our size
        stage_response = self.stage_index.search('', {'hitsPerPage': 1})
        stage_size = stage_response.get('nbHits', 0)
        
        coverage_ratio = stage_size / prod_size * 100 if prod_size > 0 else 0
        
        logger.info(f"   Production index: {prod_size:,} records")
        logger.info(f"   Our stage index: {stage_size:,} records")
        logger.info(f"   Coverage ratio: {coverage_ratio:.1f}%")
        
        return prod_size, stage_size, coverage_ratio
        
    def run_comprehensive_comparison(self):
        """Run comprehensive comparison with actual production"""
        logger.info("🎯 COMPREHENSIVE COMPARISON WITH ACTUAL PRODUCTION")
        logger.info("="*80)
        
        try:
            # 1. Compare record structures
            field_parity = self.compare_record_structures()
            
            # 2. Compare search rankings
            ranking_comparisons = self.compare_search_rankings()
            
            # 3. Compare version strategies
            self.compare_version_strategies()
            
            # 4. Analyze content differences
            self.analyze_content_quality_differences()
            
            # 5. Compare sizes
            prod_size, stage_size, coverage_ratio = self.get_index_sizes()
            
            # Calculate overall assessment
            avg_ranking_similarity = sum(r['ranking_similarity'] for r in ranking_comparisons.values()) / len(ranking_comparisons)
            
            logger.info(f"\n🏁 COMPREHENSIVE COMPARISON RESULTS:")
            logger.info(f"   📊 Index sizes: {stage_size:,} vs {prod_size:,} ({coverage_ratio:.1f}% coverage)")
            logger.info(f"   🏗️ Field structure parity: {field_parity:.1f}%")
            logger.info(f"   🏆 Average ranking similarity: {avg_ranking_similarity:.1f}%")
            
            # Overall assessment
            if avg_ranking_similarity >= 80 and field_parity >= 80:
                logger.info("   🎉 EXCELLENT: High production parity achieved!")
            elif avg_ranking_similarity >= 60 and field_parity >= 60:
                logger.info("   ✅ GOOD: Solid production parity achieved!")
            else:
                logger.info("   ⚠️ FAIR: Some gaps with production detected")
                
            return {
                'field_parity': field_parity,
                'ranking_similarity': avg_ranking_similarity,
                'coverage_ratio': coverage_ratio,
                'prod_size': prod_size,
                'stage_size': stage_size
            }
            
        except Exception as e:
            logger.error(f"❌ Comparison failed: {e}")
            raise

def main():
    """Run comprehensive production comparison"""
    try:
        comparator = ActualProductionComparison()
        results = comparator.run_comprehensive_comparison()
        
        logger.info(f"\n✅ ACTUAL PRODUCTION COMPARISON COMPLETE!")
        
    except Exception as e:
        logger.error(f"❌ Production comparison failed: {e}")
        raise

if __name__ == '__main__':
    main()