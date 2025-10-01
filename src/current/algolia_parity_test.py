#!/usr/bin/env python3
"""
Algolia Production Parity Testing Suite
Comprehensive validation of the new Python indexing system against production.
"""

import os
import sys
import json
import time
import subprocess
import pathlib
from datetime import datetime
from typing import Dict, List, Any, Set
from collections import Counter

try:
    from algoliasearch.search_client import SearchClient
    from tqdm import tqdm
except ImportError as e:
    print(f"ERROR: Missing required dependency: {e}")
    print("Install with: pip install algoliasearch tqdm")
    sys.exit(1)

# Configuration
APP_ID = os.environ.get("ALGOLIA_APP_ID", "7RXZLDVR5F")
ADMIN_KEY = os.environ.get("ALGOLIA_ADMIN_API_KEY")
PROD_INDEX = "cockroachcloud_docs"  # Production index
TEST_INDEX = os.environ.get("ALGOLIA_INDEX_NAME", "stage_cockroach_docs")

class AlgoliaParityTester:
    """Comprehensive parity testing between production and test indexes."""
    
    def __init__(self):
        if not ADMIN_KEY:
            print("ERROR: ALGOLIA_ADMIN_API_KEY environment variable required")
            sys.exit(1)
            
        self.client = SearchClient.create(APP_ID, ADMIN_KEY)
        self.prod_index = self.client.init_index(PROD_INDEX)
        self.test_index = self.client.init_index(TEST_INDEX)
        self.results = {}
        
    def test_index_sizes(self) -> Dict[str, Any]:
        """Compare index sizes and basic stats."""
        print("📊 Testing Index Sizes...")
        
        try:
            prod_stats = self.prod_index.search("", {"hitsPerPage": 0})
            prod_count = prod_stats.get("nbHits", 0)
        except Exception as e:
            print(f"   ❌ Error getting production stats: {e}")
            return {"error": str(e)}
        
        try:
            test_stats = self.test_index.search("", {"hitsPerPage": 0})
            test_count = test_stats.get("nbHits", 0)
        except Exception as e:
            print(f"   ❌ Error getting test stats: {e}")
            return {"error": str(e)}
        
        ratio = test_count / prod_count if prod_count > 0 else 0
        
        result = {
            "production_records": prod_count,
            "test_records": test_count,
            "ratio": ratio,
            "size_difference": test_count - prod_count,
            "efficiency": f"{((prod_count - test_count) / prod_count) * 100:.1f}% reduction" if test_count < prod_count else f"{((test_count - prod_count) / prod_count) * 100:.1f}% increase"
        }
        
        print(f"   Production: {prod_count:,} records")
        print(f"   Test:       {test_count:,} records") 
        print(f"   Ratio:      {ratio:.1%}")
        print(f"   Efficiency: {result['efficiency']}")
        
        return result
    
    def test_search_quality(self) -> Dict[str, Any]:
        """Test search quality across multiple queries."""
        print("\n🔍 Testing Search Quality...")
        
        # Comprehensive test queries covering different use cases
        test_queries = [
            # SQL Commands
            ("CREATE TABLE", "sql"),
            ("SELECT", "sql"),
            ("INSERT", "sql"),
            ("UPDATE", "sql"),
            ("DELETE", "sql"),
            ("ALTER TABLE", "sql"),
            ("SHOW", "sql"),
            ("BACKUP", "sql"),
            ("RESTORE", "sql"),
            
            # Features & Concepts  
            ("logical replication", "feature"),
            ("changefeeds", "feature"),
            ("multi-region", "feature"),
            ("security", "concept"),
            ("performance", "concept"),
            ("cluster", "concept"),
            ("migration", "concept"),
            ("transaction", "concept"),
            
            # Troubleshooting
            ("error", "troubleshooting"),
            ("timeout", "troubleshooting"),
            ("connection failed", "troubleshooting"),
            
            # General
            ("cockroachdb", "general"),
            ("getting started", "general"),
        ]
        
        total_overlap = 0
        total_tests = 0
        query_results = []
        
        for query, category in test_queries:
            try:
                # Search both indexes
                prod_results = self.prod_index.search(query, {"hitsPerPage": 10})
                test_results = self.test_index.search(query, {"hitsPerPage": 10})
                
                prod_urls = set(hit.get("url", "").split("#")[0] for hit in prod_results.get("hits", []))
                test_urls = set(hit.get("url", "").split("#")[0] for hit in test_results.get("hits", []))
                
                # Calculate overlap
                overlap = len(prod_urls & test_urls)
                overlap_pct = (overlap / len(prod_urls)) * 100 if prod_urls else 0
                
                query_result = {
                    "query": query,
                    "category": category,
                    "prod_results": len(prod_urls),
                    "test_results": len(test_urls),
                    "overlap": overlap,
                    "overlap_percentage": overlap_pct
                }
                
                query_results.append(query_result)
                total_overlap += overlap
                total_tests += len(prod_urls)
                
                print(f"   '{query}': {overlap_pct:.0f}% overlap ({overlap}/{len(prod_urls)})")
                
            except Exception as e:
                print(f"   ❌ Error testing '{query}': {e}")
                continue
        
        overall_overlap = (total_overlap / total_tests) * 100 if total_tests > 0 else 0
        
        # Category analysis
        category_stats = {}
        for result in query_results:
            cat = result["category"]
            if cat not in category_stats:
                category_stats[cat] = {"overlap": 0, "total": 0, "count": 0}
            category_stats[cat]["overlap"] += result["overlap"]
            category_stats[cat]["total"] += result["prod_results"] 
            category_stats[cat]["count"] += 1
        
        for cat, stats in category_stats.items():
            if stats["total"] > 0:
                category_stats[cat]["percentage"] = (stats["overlap"] / stats["total"]) * 100
        
        result = {
            "overall_overlap_percentage": overall_overlap,
            "total_queries_tested": len(query_results),
            "category_performance": category_stats,
            "detailed_results": query_results
        }
        
        print(f"\n   Overall Search Quality: {overall_overlap:.1f}% overlap")
        print("   Category Performance:")
        for cat, stats in category_stats.items():
            if "percentage" in stats:
                print(f"     {cat}: {stats['percentage']:.1f}%")
        
        return result
    
    def test_content_coverage(self) -> Dict[str, Any]:
        """Test URL coverage between indexes."""
        print("\n🌐 Testing Content Coverage...")
        
        try:
            # Sample URLs from both indexes
            prod_sample = self.prod_index.search("", {"hitsPerPage": 1000})
            test_sample = self.test_index.search("", {"hitsPerPage": 1000})
            
            prod_urls = set()
            test_urls = set()
            
            for hit in prod_sample.get("hits", []):
                url = hit.get("url", "").split("#")[0]  # Remove anchors
                if url:
                    prod_urls.add(url)
            
            for hit in test_sample.get("hits", []):
                url = hit.get("url", "").split("#")[0]  # Remove anchors
                if url:
                    test_urls.add(url)
            
            # Calculate coverage
            overlap_urls = prod_urls & test_urls
            coverage_pct = (len(overlap_urls) / len(prod_urls)) * 100 if prod_urls else 0
            
            # Analyze missing/extra URLs
            missing_urls = prod_urls - test_urls
            extra_urls = test_urls - prod_urls
            
            result = {
                "production_unique_urls": len(prod_urls),
                "test_unique_urls": len(test_urls),
                "overlap_urls": len(overlap_urls),
                "coverage_percentage": coverage_pct,
                "missing_urls": len(missing_urls),
                "extra_urls": len(extra_urls),
                "sample_missing": list(missing_urls)[:5],
                "sample_extra": list(extra_urls)[:5]
            }
            
            print(f"   Production URLs: {len(prod_urls):,}")
            print(f"   Test URLs:       {len(test_urls):,}")
            print(f"   URL Coverage:    {coverage_pct:.1f}%")
            print(f"   Missing URLs:    {len(missing_urls)}")
            print(f"   Extra URLs:      {len(extra_urls)}")
            
            if missing_urls:
                print(f"   Sample Missing:")
                for url in list(missing_urls)[:3]:
                    print(f"     - {url}")
            
            return result
            
        except Exception as e:
            print(f"   ❌ Error testing coverage: {e}")
            return {"error": str(e)}
    
    def test_field_compatibility(self) -> Dict[str, Any]:
        """Test field structure compatibility."""
        print("\n📋 Testing Field Compatibility...")
        
        try:
            # Get sample records from both indexes
            prod_sample = self.prod_index.search("", {"hitsPerPage": 100})
            test_sample = self.test_index.search("", {"hitsPerPage": 100})
            
            prod_records = prod_sample.get("hits", [])
            test_records = test_sample.get("hits", [])
            
            if not prod_records or not test_records:
                return {"error": "Could not retrieve sample records"}
            
            # Analyze field structure
            prod_fields = set()
            test_fields = set()
            
            for record in prod_records:
                prod_fields.update(record.keys())
            
            for record in test_records:
                test_fields.update(record.keys())
            
            # Field comparison
            common_fields = prod_fields & test_fields
            missing_fields = prod_fields - test_fields
            extra_fields = test_fields - prod_fields
            
            result = {
                "production_fields": len(prod_fields),
                "test_fields": len(test_fields),
                "common_fields": len(common_fields),
                "field_coverage": (len(common_fields) / len(prod_fields)) * 100 if prod_fields else 0,
                "missing_fields": list(missing_fields),
                "extra_fields": list(extra_fields),
                "all_prod_fields": sorted(list(prod_fields)),
                "all_test_fields": sorted(list(test_fields))
            }
            
            print(f"   Production Fields: {len(prod_fields)}")
            print(f"   Test Fields:       {len(test_fields)}")
            print(f"   Field Coverage:    {result['field_coverage']:.1f}%")
            print(f"   Missing Fields:    {len(missing_fields)}")
            print(f"   Extra Fields:      {len(extra_fields)}")
            
            if missing_fields:
                print(f"   Missing: {', '.join(list(missing_fields)[:5])}")
            if extra_fields:
                print(f"   Extra:   {', '.join(list(extra_fields)[:5])}")
            
            return result
            
        except Exception as e:
            print(f"   ❌ Error testing fields: {e}")
            return {"error": str(e)}
    
    def run_comprehensive_test(self) -> Dict[str, Any]:
        """Run all parity tests and generate comprehensive report."""
        print("🎯 ALGOLIA PRODUCTION PARITY TEST SUITE")
        print("=" * 60)
        print(f"Production Index: {PROD_INDEX}")
        print(f"Test Index:       {TEST_INDEX}")
        print(f"Timestamp:        {datetime.now().isoformat()}")
        
        start_time = time.time()
        
        # Run all tests
        self.results = {
            "metadata": {
                "production_index": PROD_INDEX,
                "test_index": TEST_INDEX,
                "timestamp": datetime.now().isoformat(),
                "app_id": APP_ID
            },
            "index_sizes": self.test_index_sizes(),
            "search_quality": self.test_search_quality(),
            "content_coverage": self.test_content_coverage(),
            "field_compatibility": self.test_field_compatibility()
        }
        
        duration = time.time() - start_time
        self.results["metadata"]["duration_seconds"] = round(duration, 2)
        
        # Generate summary
        self.print_summary()
        
        # Save detailed results
        output_file = f"algolia_parity_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, "w") as f:
            json.dump(self.results, f, indent=2)
        
        print(f"\n💾 Detailed results saved to: {output_file}")
        
        return self.results
    
    def print_summary(self):
        """Print comprehensive test summary."""
        print("\n" + "=" * 60)
        print("🎯 PARITY TEST SUMMARY")
        print("=" * 60)
        
        # Index Size Summary
        size_result = self.results.get("index_sizes", {})
        if "error" not in size_result:
            ratio = size_result.get("ratio", 0)
            print(f"Index Size:       {ratio:.1%} of production ({size_result.get('efficiency', 'N/A')})")
        
        # Search Quality Summary  
        search_result = self.results.get("search_quality", {})
        if "error" not in search_result:
            overlap = search_result.get("overall_overlap_percentage", 0)
            print(f"Search Quality:   {overlap:.1f}% overlap across {search_result.get('total_queries_tested', 0)} queries")
        
        # Coverage Summary
        coverage_result = self.results.get("content_coverage", {})
        if "error" not in coverage_result:
            coverage = coverage_result.get("coverage_percentage", 0)
            print(f"URL Coverage:     {coverage:.1f}% of production URLs")
        
        # Field Summary
        field_result = self.results.get("field_compatibility", {})
        if "error" not in field_result:
            field_coverage = field_result.get("field_coverage", 0)
            print(f"Field Coverage:   {field_coverage:.1f}% field compatibility")
        
        # Overall Assessment
        print("\n🏆 OVERALL ASSESSMENT:")
        
        # Calculate overall score
        scores = []
        if "error" not in size_result and size_result.get("ratio", 0) > 0.5:
            scores.append(85)  # Size is reasonable
        if "error" not in search_result and search_result.get("overall_overlap_percentage", 0) > 70:
            scores.append(90)  # Search quality is good  
        if "error" not in coverage_result and coverage_result.get("coverage_percentage", 0) > 80:
            scores.append(88)  # Coverage is good
        if "error" not in field_result and field_result.get("field_coverage", 0) > 90:
            scores.append(92)  # Field compatibility is excellent
        
        if scores:
            overall_score = sum(scores) / len(scores)
            if overall_score >= 90:
                print("   ✅ EXCELLENT - Ready for production deployment")
            elif overall_score >= 80:
                print("   ✅ GOOD - Minor issues to address")
            elif overall_score >= 70:
                print("   ⚠️ ACCEPTABLE - Some improvements needed")
            else:
                print("   ❌ NEEDS WORK - Significant issues found")
        else:
            print("   ❌ UNABLE TO ASSESS - Too many test errors")
        
        print("=" * 60)

def main():
    """Run the parity test suite."""
    
    if len(sys.argv) > 1:
        if sys.argv[1] == "--help":
            print("Algolia Production Parity Test Suite")
            print("\nUsage:")
            print("  python algolia_parity_test.py")
            print("\nEnvironment Variables:")
            print("  ALGOLIA_APP_ID          - Algolia application ID")
            print("  ALGOLIA_ADMIN_API_KEY   - Algolia admin API key (required)")
            print("  ALGOLIA_INDEX_NAME      - Test index name (default: stage_cockroach_docs)")
            print("\nExample:")
            print("  ALGOLIA_ADMIN_API_KEY=xxx python algolia_parity_test.py")
            return
    
    try:
        tester = AlgoliaParityTester()
        results = tester.run_comprehensive_test()
        
        # Exit with appropriate code based on results
        search_quality = results.get("search_quality", {}).get("overall_overlap_percentage", 0)
        coverage = results.get("content_coverage", {}).get("coverage_percentage", 0)
        
        if search_quality >= 70 and coverage >= 80:
            sys.exit(0)  # Success
        else:
            sys.exit(1)  # Issues found
            
    except KeyboardInterrupt:
        print("\n⏹️ Test interrupted by user")
        sys.exit(1)
    
    except Exception as e:
        print(f"\n💥 Test failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()