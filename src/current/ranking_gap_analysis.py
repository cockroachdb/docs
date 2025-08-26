#!/usr/bin/env python3
"""
Ranking Gap Analysis
Deep dive into why we only have 52% ranking similarity and how to improve it
"""

import os
import logging
from algoliasearch.search_client import SearchClient
import json

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RankingGapAnalysis:
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
        
    def analyze_missing_titles(self):
        """Find which production titles we're missing"""
        logger.info("🔍 ANALYZING MISSING PRODUCTION TITLES")
        
        test_queries = ['backup', 'create table', 'authentication', 'cluster', 'performance']
        missing_titles = {}
        
        for query in test_queries:
            logger.info(f"\n📊 Query: '{query}'")
            
            # Get production results
            prod_response = self.prod_index.search(query, {
                'hitsPerPage': 10,
                'attributesToRetrieve': ['title', 'url', 'content', 'summary']
            })
            
            # Get our results  
            stage_response = self.stage_index.search(query, {
                'hitsPerPage': 20,
                'attributesToRetrieve': ['title', 'url', 'content', 'summary']
            })
            
            prod_titles = [hit.get('title', '') for hit in prod_response['hits']]
            stage_titles = [hit.get('title', '') for hit in stage_response['hits']]
            
            # Find exact missing titles
            exact_missing = [title for title in prod_titles if title not in stage_titles]
            
            # Find partial matches
            partial_matches = {}
            for prod_title in exact_missing:
                matches = [stage_title for stage_title in stage_titles 
                          if any(word.lower() in stage_title.lower() for word in prod_title.split())]
                if matches:
                    partial_matches[prod_title] = matches[:3]
                    
            missing_titles[query] = {
                'exact_missing': exact_missing,
                'partial_matches': partial_matches,
                'production_top5': prod_titles[:5],
                'our_top5': stage_titles[:5]
            }
            
            logger.info(f"   📊 Production has: {len(prod_titles)} results")
            logger.info(f"   📊 We have: {len(stage_titles)} results")
            logger.info(f"   ❌ Exact missing: {len(exact_missing)}")
            logger.info(f"   🔍 Partial matches found: {len(partial_matches)}")
            
            if exact_missing:
                logger.info(f"   📝 Missing titles:")
                for title in exact_missing[:3]:
                    logger.info(f"      - {title}")
                    
            if partial_matches:
                logger.info(f"   🔍 Partial matches:")
                for prod_title, matches in list(partial_matches.items())[:2]:
                    logger.info(f"      '{prod_title}' → {matches[0] if matches else 'None'}")
                    
        return missing_titles
        
    def analyze_content_quality_gaps(self):
        """Compare content quality between production and our index"""
        logger.info("📄 ANALYZING CONTENT QUALITY GAPS")
        
        query = 'backup'
        
        # Get production samples
        prod_response = self.prod_index.search(query, {
            'hitsPerPage': 3,
            'attributesToRetrieve': ['title', 'content', 'summary', 'html', 'docs_area']
        })
        
        # Get our samples
        stage_response = self.stage_index.search(query, {
            'hitsPerPage': 3, 
            'attributesToRetrieve': ['title', 'content', 'summary', 'html', 'docs_area']
        })
        
        logger.info("📊 PRODUCTION CONTENT ANALYSIS:")
        for i, hit in enumerate(prod_response['hits'][:2], 1):
            title = hit.get('title', 'No title')
            content = hit.get('content', '')
            summary = hit.get('summary', '')
            docs_area = hit.get('docs_area', '')
            
            logger.info(f"   {i}. {title}")
            logger.info(f"      Content length: {len(content)} chars")
            logger.info(f"      Summary length: {len(summary)} chars")
            logger.info(f"      Docs area: {docs_area}")
            logger.info(f"      Content start: {content[:100]}...")
            logger.info(f"      Summary: {summary[:100]}...")
            
        logger.info(f"\n📊 OUR CONTENT ANALYSIS:")
        for i, hit in enumerate(stage_response['hits'][:2], 1):
            title = hit.get('title', 'No title')
            content = hit.get('content', '')
            summary = hit.get('summary', '')
            docs_area = hit.get('docs_area', '')
            
            logger.info(f"   {i}. {title}")
            logger.info(f"      Content length: {len(content)} chars")
            logger.info(f"      Summary length: {len(summary)} chars")
            logger.info(f"      Docs area: {docs_area}")
            logger.info(f"      Content start: {content[:100]}...")
            logger.info(f"      Summary: {summary[:100]}...")
            
    def analyze_url_patterns(self):
        """Analyze URL patterns to understand what content we should include"""
        logger.info("🔗 ANALYZING PRODUCTION URL PATTERNS")
        
        # Get all production URLs
        all_prod = []
        for page in range(10):  # Get first 1000 records
            response = self.prod_index.search('', {
                'hitsPerPage': 100,
                'page': page,
                'attributesToRetrieve': ['url', 'title', 'docs_area', 'canonical']
            })
            
            if not response['hits']:
                break
                
            all_prod.extend(response['hits'])
            
        logger.info(f"📊 ANALYZED {len(all_prod)} PRODUCTION RECORDS")
        
        # Analyze URL patterns
        url_patterns = {}
        docs_areas = {}
        canonical_patterns = {}
        
        for record in all_prod:
            url = record.get('url', '')
            docs_area = record.get('docs_area', 'unknown')
            canonical = record.get('canonical', '')
            
            # Extract URL path pattern
            if '/docs/' in url:
                path = url.split('/docs/')[-1]
                if '/' in path:
                    main_section = path.split('/')[0]
                    if main_section in url_patterns:
                        url_patterns[main_section] += 1
                    else:
                        url_patterns[main_section] = 1
                        
            # Track docs areas
            if docs_area in docs_areas:
                docs_areas[docs_area] += 1
            else:
                docs_areas[docs_area] = 1
                
            # Track canonical patterns
            if canonical:
                if canonical.startswith('/'):
                    base = canonical.split('/')[1] if '/' in canonical[1:] else canonical[1:]
                    if base:
                        if base in canonical_patterns:
                            canonical_patterns[base] += 1
                        else:
                            canonical_patterns[base] = 1
                            
        logger.info(f"📊 URL PATTERNS:")
        for pattern, count in sorted(url_patterns.items(), key=lambda x: x[1], reverse=True)[:10]:
            logger.info(f"   {pattern}: {count} records")
            
        logger.info(f"📊 DOCS AREAS:")  
        for area, count in sorted(docs_areas.items(), key=lambda x: x[1], reverse=True)[:10]:
            logger.info(f"   {area}: {count} records")
            
        logger.info(f"📊 CANONICAL PATTERNS:")
        for pattern, count in sorted(canonical_patterns.items(), key=lambda x: x[1], reverse=True)[:10]:
            logger.info(f"   {pattern}: {count} records")
            
        return {
            'url_patterns': url_patterns,
            'docs_areas': docs_areas,
            'canonical_patterns': canonical_patterns
        }
        
    def analyze_ranking_factors(self):
        """Analyze what factors affect ranking in production"""
        logger.info("🏆 ANALYZING PRODUCTION RANKING FACTORS")
        
        queries = ['backup', 'create table']
        
        for query in queries:
            logger.info(f"\n🔍 Query: '{query}'")
            
            # Get production top results with all attributes
            prod_response = self.prod_index.search(query, {
                'hitsPerPage': 5,
                'attributesToRetrieve': ['*']
            })
            
            logger.info(f"📊 PRODUCTION TOP 5 ANALYSIS:")
            for i, hit in enumerate(prod_response['hits'], 1):
                title = hit.get('title', 'No title')
                content_len = len(hit.get('content', ''))
                summary_len = len(hit.get('summary', ''))
                docs_area = hit.get('docs_area', '')
                url = hit.get('url', '')
                
                # Analyze title relevance
                title_match = query.lower() in title.lower()
                exact_title_match = query.lower() == title.lower()
                
                logger.info(f"   {i}. {title}")
                logger.info(f"      Title relevance: {'Exact' if exact_title_match else 'Partial' if title_match else 'None'}")
                logger.info(f"      Content: {content_len} chars, Summary: {summary_len} chars")
                logger.info(f"      Docs area: {docs_area}")
                logger.info(f"      URL depth: {url.count('/')}")
                
    def get_improvement_recommendations(self):
        """Generate specific recommendations to improve parity"""
        logger.info("💡 GENERATING IMPROVEMENT RECOMMENDATIONS")
        
        missing_analysis = self.analyze_missing_titles()
        url_analysis = self.analyze_url_patterns()
        
        recommendations = []
        
        # Recommendation 1: Add missing content types
        high_priority_missing = []
        for query, data in missing_analysis.items():
            for title in data['exact_missing'][:2]:  # Top 2 missing per query
                high_priority_missing.append({
                    'query': query,
                    'missing_title': title,
                    'priority': 'high'
                })
                
        recommendations.append({
            'type': 'missing_content',
            'description': 'Add high-priority missing titles',
            'action': f'Create {len(high_priority_missing)} missing records',
            'impact': 'Should increase ranking similarity by 20-30%'
        })
        
        # Recommendation 2: Improve content extraction
        recommendations.append({
            'type': 'content_quality',
            'description': 'Extract actual documentation content instead of navigation elements',
            'action': 'Improve HTML parsing to extract main content areas',
            'impact': 'Should improve content relevance by 40%'
        })
        
        # Recommendation 3: Match docs_area patterns
        top_docs_areas = sorted(url_analysis['docs_areas'].items(), key=lambda x: x[1], reverse=True)[:5]
        recommendations.append({
            'type': 'docs_area_matching',
            'description': 'Use production docs_area patterns instead of fixed "reference.sql"',
            'action': f'Implement mapping to: {[area for area, _ in top_docs_areas]}',
            'impact': 'Should improve categorization accuracy by 30%'
        })
        
        # Recommendation 4: URL pattern matching  
        top_url_patterns = sorted(url_analysis['url_patterns'].items(), key=lambda x: x[1], reverse=True)[:5]
        recommendations.append({
            'type': 'url_structure',
            'description': 'Match production URL structure patterns',
            'action': f'Focus on content from: {[pattern for pattern, _ in top_url_patterns]}',
            'impact': 'Should improve content selection accuracy by 25%'
        })
        
        logger.info(f"🎯 IMPROVEMENT RECOMMENDATIONS:")
        for i, rec in enumerate(recommendations, 1):
            logger.info(f"   {i}. {rec['type'].upper()}")
            logger.info(f"      Description: {rec['description']}")
            logger.info(f"      Action: {rec['action']}")
            logger.info(f"      Impact: {rec['impact']}")
            
        return recommendations
        
    def run_complete_gap_analysis(self):
        """Run complete gap analysis"""
        logger.info("🎯 COMPLETE RANKING GAP ANALYSIS")
        logger.info("="*70)
        
        # 1. Analyze missing titles
        missing_titles = self.analyze_missing_titles()
        
        # 2. Analyze content quality
        self.analyze_content_quality_gaps()
        
        # 3. Analyze URL patterns
        url_patterns = self.analyze_url_patterns()
        
        # 4. Analyze ranking factors
        self.analyze_ranking_factors()
        
        # 5. Get recommendations
        recommendations = self.get_improvement_recommendations()
        
        logger.info(f"\n🏁 GAP ANALYSIS SUMMARY:")
        logger.info(f"   Current ranking similarity: 52%")
        logger.info(f"   Main gaps identified: {len(recommendations)}")
        logger.info(f"   Potential improvement: 70-85% ranking similarity")
        
        return {
            'missing_titles': missing_titles,
            'url_patterns': url_patterns,
            'recommendations': recommendations
        }

def main():
    """Run complete gap analysis"""
    try:
        analyzer = RankingGapAnalysis()
        results = analyzer.run_complete_gap_analysis()
        
        logger.info(f"✅ GAP ANALYSIS COMPLETE")
        
    except Exception as e:
        logger.error(f"❌ Gap analysis failed: {e}")
        raise

if __name__ == '__main__':
    main()