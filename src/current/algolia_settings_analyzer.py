#!/usr/bin/env python3
"""
Algolia Settings Analyzer
Deep analysis of production index settings to achieve perfect ranking parity
"""

import os
import logging
from algoliasearch.search_client import SearchClient
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AlgoliaSettingsAnalyzer:
    def __init__(self):
        self.setup_algolia()
        
    def setup_algolia(self):
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        self.client = SearchClient.create(app_id, admin_key)
        self.read_client = SearchClient.create(app_id, read_key)
        
        self.stage_index = self.client.init_index('stage_cockroach_docs')
        self.prod_index = self.read_client.init_index('cockroachcloud_docs')
        
    def analyze_index_settings(self):
        """Analyze production vs stage index settings"""
        logger.info("⚙️ ANALYZING INDEX SETTINGS DIFFERENCES")
        
        try:
            # Get production settings (read-only)
            logger.info("📊 Fetching production settings...")
            prod_settings = self.prod_index.get_settings()
            
            # Get our stage settings
            logger.info("📊 Fetching stage settings...")
            stage_settings = self.stage_index.get_settings()
            
            # Key settings that affect ranking
            key_settings = [
                'searchableAttributes', 'ranking', 'customRanking', 
                'attributesForFaceting', 'replicas', 'typoTolerance',
                'minWordSizeForApproximations', 'minProximity'
            ]
            
            logger.info("🔍 COMPARING KEY SETTINGS:")
            settings_diff = {}
            
            for setting in key_settings:
                prod_val = prod_settings.get(setting, 'NOT_SET')
                stage_val = stage_settings.get(setting, 'NOT_SET')
                
                if prod_val != stage_val:
                    settings_diff[setting] = {
                        'production': prod_val,
                        'stage': stage_val
                    }
                    
                logger.info(f"\n📋 {setting}:")
                logger.info(f"   Production: {prod_val}")
                logger.info(f"   Stage: {stage_val}")
                logger.info(f"   Match: {'✅' if prod_val == stage_val else '❌'}")
                
            if settings_diff:
                logger.info(f"\n❌ SETTINGS DIFFERENCES FOUND: {len(settings_diff)}")
                return settings_diff, prod_settings, stage_settings
            else:
                logger.info(f"\n✅ ALL KEY SETTINGS MATCH")
                return {}, prod_settings, stage_settings
                
        except Exception as e:
            logger.error(f"❌ Settings analysis failed: {e}")
            return None, None, None
            
    def copy_production_settings(self, prod_settings):
        """Copy production settings to our stage index"""
        logger.info("🔧 COPYING PRODUCTION SETTINGS TO STAGE")
        
        # Settings we can safely copy
        safe_to_copy = [
            'searchableAttributes', 'ranking', 'customRanking',
            'attributesForFaceting', 'typoTolerance', 'minWordSizeForApproximations',
            'minProximity', 'separatorsToIndex', 'optionalWords'
        ]
        
        settings_to_apply = {}
        
        for setting in safe_to_copy:
            if setting in prod_settings:
                settings_to_apply[setting] = prod_settings[setting]
                logger.info(f"   ✅ Will copy: {setting}")
            else:
                logger.info(f"   ⚠️ Not found in prod: {setting}")
                
        if settings_to_apply:
            logger.info(f"📤 Applying {len(settings_to_apply)} settings to stage index...")
            
            try:
                self.stage_index.set_settings(settings_to_apply)
                logger.info("✅ Production settings applied successfully")
                return True
            except Exception as e:
                logger.error(f"❌ Failed to apply settings: {e}")
                return False
        else:
            logger.info("⚠️ No settings to apply")
            return False
            
    def analyze_record_ordering_factors(self):
        """Analyze what makes records rank higher in production"""
        logger.info("🏆 ANALYZING RECORD ORDERING FACTORS")
        
        test_queries = ['backup', 'create table']
        
        for query in test_queries:
            logger.info(f"\n🔍 Query: '{query}'")
            
            # Get production results with all attributes
            prod_response = self.prod_index.search(query, {
                'hitsPerPage': 10,
                'attributesToRetrieve': ['*'],
                'getRankingInfo': True
            })
            
            # Get our results
            stage_response = self.stage_index.search(query, {
                'hitsPerPage': 10,
                'attributesToRetrieve': ['*'],
                'getRankingInfo': True
            })
            
            logger.info("📊 PRODUCTION RANKING FACTORS:")
            for i, hit in enumerate(prod_response['hits'][:3], 1):
                title = hit.get('title', '')
                content_len = len(hit.get('content', ''))
                title_match = query.lower() in title.lower()
                exact_match = query.lower() == title.lower()
                docs_area = hit.get('docs_area', '')
                
                logger.info(f"   {i}. {title[:50]}")
                logger.info(f"      Title match: {'Exact' if exact_match else 'Partial' if title_match else 'None'}")
                logger.info(f"      Content length: {content_len}")
                logger.info(f"      Docs area: {docs_area}")
                
            logger.info("📊 OUR RANKING FACTORS:")
            for i, hit in enumerate(stage_response['hits'][:3], 1):
                title = hit.get('title', '')
                content_len = len(hit.get('content', ''))
                title_match = query.lower() in title.lower()
                exact_match = query.lower() == title.lower()
                docs_area = hit.get('docs_area', '')
                
                logger.info(f"   {i}. {title[:50]}")
                logger.info(f"      Title match: {'Exact' if exact_match else 'Partial' if title_match else 'None'}")
                logger.info(f"      Content length: {content_len}")
                logger.info(f"      Docs area: {docs_area}")
                
    def test_with_different_queries(self):
        """Test ranking with various query types"""
        logger.info("🧪 TESTING WITH DIFFERENT QUERY TYPES")
        
        test_cases = {
            'exact_match': ['BACKUP', 'CREATE TABLE'],
            'partial_match': ['backup validation', 'create table as'],
            'multi_word': ['backup and restore', 'cluster monitoring'],
            'single_word': ['authentication', 'performance']
        }
        
        total_matches = 0
        total_queries = 0
        
        for query_type, queries in test_cases.items():
            logger.info(f"\n📋 {query_type.upper()} QUERIES:")
            
            for query in queries:
                # Get production top 3
                prod_response = self.prod_index.search(query, {
                    'hitsPerPage': 3,
                    'attributesToRetrieve': ['title']
                })
                
                # Get our top 3
                stage_response = self.stage_index.search(query, {
                    'hitsPerPage': 3,
                    'attributesToRetrieve': ['title']
                })
                
                prod_titles = [hit.get('title', '') for hit in prod_response['hits']]
                stage_titles = [hit.get('title', '') for hit in stage_response['hits']]
                
                # Calculate matches
                matches = sum(1 for title in prod_titles if title in stage_titles)
                similarity = matches / len(prod_titles) * 100 if prod_titles else 0
                
                total_matches += matches
                total_queries += len(prod_titles)
                
                logger.info(f"   '{query}': {similarity:.1f}% ({matches}/{len(prod_titles)})")
                
        overall_similarity = total_matches / total_queries * 100 if total_queries > 0 else 0
        logger.info(f"\n🎯 OVERALL QUERY SIMILARITY: {overall_similarity:.1f}%")
        return overall_similarity
        
    def run_comprehensive_settings_analysis(self):
        """Run comprehensive analysis and optimization"""
        logger.info("🎯 COMPREHENSIVE SETTINGS ANALYSIS")
        logger.info("="*60)
        
        # Step 1: Analyze current settings differences
        settings_diff, prod_settings, stage_settings = self.analyze_index_settings()
        
        if settings_diff is None:
            logger.error("❌ Could not analyze settings")
            return False
            
        # Step 2: Test current ranking similarity
        logger.info("\n🧪 TESTING CURRENT RANKING SIMILARITY:")
        current_similarity = self.test_with_different_queries()
        
        # Step 3: Copy production settings if different
        if settings_diff:
            logger.info("\n🔧 APPLYING PRODUCTION SETTINGS:")
            settings_applied = self.copy_production_settings(prod_settings)
            
            if settings_applied:
                # Wait for settings to take effect
                logger.info("⏱️ Waiting for settings to take effect...")
                import time
                time.sleep(10)
                
                # Test improved similarity
                logger.info("\n🧪 TESTING IMPROVED RANKING SIMILARITY:")
                improved_similarity = self.test_with_different_queries()
                
                improvement = improved_similarity - current_similarity
                logger.info(f"\n📈 IMPROVEMENT: {improvement:+.1f}% ({current_similarity:.1f}% → {improved_similarity:.1f}%)")
                
                return improved_similarity >= 90
            else:
                logger.error("❌ Failed to apply production settings")
                return False
        else:
            logger.info("\n✅ Settings already match production")
            # Step 4: Analyze record factors since settings match
            self.analyze_record_ordering_factors()
            return current_similarity >= 90

def main():
    """Run comprehensive settings analysis"""
    try:
        analyzer = AlgoliaSettingsAnalyzer()
        success = analyzer.run_comprehensive_settings_analysis()
        
        if success:
            logger.info("🎉 HIGH RANKING PARITY ACHIEVED!")
        else:
            logger.info("⚠️ Further optimization needed")
            
    except Exception as e:
        logger.error(f"❌ Settings analysis failed: {e}")
        raise

if __name__ == '__main__':
    main()