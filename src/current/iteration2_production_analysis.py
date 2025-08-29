#!/usr/bin/env python3
"""
ITERATION 2: Production Path Analysis & Exact Filtering
Analyze live production to understand exact paths/versions, then filter _site indexing to match
"""

import os
import logging
import hashlib
import json
from pathlib import Path
from bs4 import BeautifulSoup
import asyncio
from algoliasearch.search.client import SearchClient
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ProductionAnalysisIndexer:
    def __init__(self):
        self.setup_clients()
        self.site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
        self.production_paths = set()
        self.production_versions = set()
        
    def setup_clients(self):
        """Setup Algolia clients"""
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        if not admin_key or not read_key:
            raise ValueError("Missing API keys")
            
        self.stage_client = SearchClient(app_id, admin_key)
        self.prod_client = SearchClient(app_id, read_key)
    
    async def analyze_production_paths(self):
        """Analyze all production records to understand exact paths and versions"""
        logger.info("📊 ANALYZING LIVE PRODUCTION PATHS AND VERSIONS")
        
        all_prod_records = []
        page = 0
        
        # Fetch all production records to analyze paths
        while True:
            try:
                results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": "",
                    "hitsPerPage": 1000,
                    "page": page,
                    "attributesToRetrieve": ["url", "canonical", "version", "docs_area", "title"]
                })
                
                if not results.hits:
                    break
                
                batch_records = [hit.model_dump() for hit in results.hits]
                all_prod_records.extend(batch_records)
                page += 1
                
                logger.info(f"   Fetched page {page}: {len(batch_records)} records (Total: {len(all_prod_records)})")
                
                if len(batch_records) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching production page {page}: {e}")
                break
        
        logger.info(f"✅ Analyzed {len(all_prod_records)} production records")
        
        # Extract unique paths and versions
        versions = set()
        docs_areas = set()
        url_patterns = []
        
        for record in all_prod_records:
            url = record.get('url', '')
            canonical = record.get('canonical', '')
            version = record.get('version', '')
            docs_area = record.get('docs_area', '')
            
            if version:
                versions.add(version)
            if docs_area:
                docs_areas.add(docs_area)
            
            # Extract path pattern from URL
            if url:
                parsed = urlparse(url)
                path = parsed.path.replace('/docs/', '')
                if path:
                    url_patterns.append(path)
                    self.production_paths.add(path)
        
        self.production_versions = versions
        
        logger.info(f"📁 PRODUCTION PATH ANALYSIS:")
        logger.info(f"   Total unique paths: {len(self.production_paths)}")
        logger.info(f"   Versions: {sorted(versions)}")
        logger.info(f"   Docs areas: {sorted(docs_areas)}")
        
        # Analyze version distribution
        version_counts = {}
        for record in all_prod_records:
            v = record.get('version', 'unknown')
            version_counts[v] = version_counts.get(v, 0) + 1
        
        logger.info(f"   Version distribution:")
        for v in sorted(version_counts.keys()):
            logger.info(f"     {v}: {version_counts[v]} records")
        
        # Analyze path patterns to understand filtering
        path_prefixes = {}
        for path in list(self.production_paths)[:20]:  # Sample first 20
            prefix = path.split('/')[0] if '/' in path else path
            path_prefixes[prefix] = path_prefixes.get(prefix, 0) + 1
        
        logger.info(f"   Top path prefixes:")
        for prefix in sorted(path_prefixes.keys(), key=lambda x: path_prefixes[x], reverse=True)[:10]:
            logger.info(f"     {prefix}: {path_prefixes[prefix]} records")
        
        return {
            'total_records': len(all_prod_records),
            'versions': versions,
            'docs_areas': docs_areas,
            'version_counts': version_counts,
            'path_prefixes': path_prefixes
        }
    
    def is_production_path_match(self, html_file):
        """Check if HTML file matches any production path exactly"""
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
            file_url_path = str(rel_path)
            
            # Check if this exact path exists in production
            return file_url_path in self.production_paths
            
        except ValueError:
            return False
    
    def extract_content_jekyll_style(self, html_file):
        """Extract content exactly like Jekyll-Algolia gem"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Title extraction (Jekyll-style)
            title = None
            
            # 1. Try page title first
            title_elem = soup.find('title')
            if title_elem:
                title = title_elem.get_text().strip()
                # Clean up title like Jekyll does
                title = title.replace(' | CockroachDB Docs', '')
                title = title.replace(' - CockroachDB Docs', '')
                title = title.strip()
            
            # 2. Fallback to h1
            if not title or title == 'CockroachDB Docs':
                h1 = soup.find('h1')
                if h1:
                    title = h1.get_text().strip()
            
            # 3. Last resort: filename
            if not title:
                title = html_file.stem.replace('-', ' ').title()
            
            # Content extraction (Jekyll-style - main content only)
            main_content = None
            
            # Try different content containers
            for selector in [
                'main', 'article', '.content', '.main-content', 
                '[role="main"]', '#content', '.docs-content'
            ]:
                main_content = soup.select_one(selector)
                if main_content:
                    break
            
            if not main_content:
                # Fallback to body but exclude nav/sidebar/footer
                main_content = soup.find('body')
                if main_content:
                    # Remove navigation and UI elements like Jekyll does
                    for unwanted in main_content.find_all([
                        'nav', 'aside', 'footer', 'header', 'script', 'style',
                        '.sidebar', '.navigation', '.nav', '.footer', '.header',
                        '.toc', '.table-of-contents', '#navigation'
                    ]):
                        unwanted.decompose()
            
            if main_content:
                # Get text content (Jekyll-style)
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
                
                # Truncate to stay under Algolia limits (Jekyll does this)
                max_content_size = 30000  # Conservative limit
                if len(content_text) > max_content_size:
                    content_text = content_text[:max_content_size] + '...'
                if len(content_html) > max_content_size:
                    content_html = content_html[:max_content_size] + '...'
            else:
                content_text = 'No content found'
                content_html = '<p>No content found</p>'
            
            # Clean content like Jekyll does
            content_text = ' '.join(content_text.split())  # Normalize whitespace
            
            # Extract headings (Jekyll-style)
            headings = []
            for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                heading_text = h.get_text().strip()
                if heading_text and heading_text != title:  # Don't duplicate title
                    headings.append(heading_text)
            
            return {
                'title': title,
                'content': content_text,
                'html': content_html,
                'headings': headings[:10]  # Limit headings
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None
    
    def create_production_matching_record(self, html_file):
        """Create record that matches production structure exactly"""
        
        # Extract content Jekyll-style
        content_data = self.extract_content_jekyll_style(html_file)
        if not content_data:
            return None
        
        # Get metadata from file path
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            rel_path = file_path
        
        # Determine version from path
        version = 'v25.3'  # Default
        parts = rel_path.parts
        for part in parts:
            if part.startswith('v') and '.' in part and part in self.production_versions:
                version = part
                break
        
        # Determine docs_area (match production patterns)
        docs_area = 'reference'
        path_str = str(rel_path).lower()
        
        if 'cockroachcloud' in path_str:
            docs_area = 'cockroachcloud'
        elif any(sql_keyword in path_str for sql_keyword in ['sql', 'create', 'alter', 'select', 'backup', 'restore']):
            docs_area = 'reference.sql'
        elif any(ui_keyword in path_str for ui_keyword in ['admin-ui', 'ui-', 'monitoring', 'cluster']):
            docs_area = 'manage'
        
        # Generate URLs (match production format exactly)
        url_path = str(rel_path)
        canonical = f"/{url_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        # Create summary (Jekyll-style - first 200 chars)
        content = content_data['content']
        summary = content[:200].strip()
        if len(content) > 200:
            summary += '...'
        
        # Create excerpt (Jekyll-style)
        excerpt_text = summary
        
        # Try to get first paragraph for excerpt_html
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        first_p = soup.find('p')
        if first_p and len(str(first_p)) < 500:
            excerpt_html = str(first_p)
        else:
            excerpt_html = f"<p>{summary}</p>"
        
        # Generate object ID (stable hash)
        title = content_data['title']
        object_id = hashlib.md5(f"{title}_{url_path}".encode()).hexdigest()
        
        # Create record with EXACTLY 18 production fields (no extras)
        record = {
            'objectID': object_id,
            'title': title,
            'content': content,
            'html': content_data['html'],
            'summary': summary,
            'url': full_url,
            'canonical': canonical,
            'type': 'page',
            'version': version,
            'doc_type': 'cockroachdb',
            'docs_area': docs_area,
            'slug': file_path.stem,
            'last_modified_at': '29-Aug-25',
            'excerpt_html': excerpt_html,
            'excerpt_text': excerpt_text,
            'headings': content_data['headings'],
            'tags': [],
            'categories': []
        }
        
        # Validate record size (Algolia limit is 50KB)
        record_size = len(json.dumps(record).encode('utf-8'))
        if record_size > 45000:  # Conservative limit
            logger.warning(f"Large record {title}: {record_size} bytes, truncating...")
            
            # Truncate content fields progressively
            record['content'] = record['content'][:15000] + '...'
            record['html'] = record['html'][:15000] + '...'
            record['summary'] = record['summary'][:200] + '...'
            
            # Recheck size
            record_size = len(json.dumps(record).encode('utf-8'))
            logger.info(f"   Truncated to {record_size} bytes")
        
        return record
    
    async def discover_production_filtered_files(self):
        """Discover HTML files that exactly match production paths"""
        logger.info("🔍 DISCOVERING FILES THAT MATCH PRODUCTION PATHS")
        
        # First analyze production to get exact paths
        analysis = await self.analyze_production_paths()
        
        # Get all HTML files
        all_files = list(self.site_path.rglob('*.html'))
        logger.info(f"📁 Found {len(all_files)} total HTML files in _site")
        
        # Filter to only files that match production paths exactly
        matching_files = []
        
        for html_file in all_files:
            if self.is_production_path_match(html_file):
                matching_files.append(html_file)
        
        logger.info(f"✅ Filtered to {len(matching_files)} files that match production paths")
        logger.info(f"📊 Filtering ratio: {len(matching_files)}/{len(all_files)} = {len(matching_files)/len(all_files)*100:.1f}%")
        
        return matching_files
    
    async def index_production_filtered_files(self):
        """Index only files that match production paths exactly"""
        logger.info("🎯 ITERATION 2: PRODUCTION-FILTERED INDEXING")
        
        # Discover files that match production paths
        html_files = await self.discover_production_filtered_files()
        
        # Process files
        records = []
        skipped = 0
        
        for i, html_file in enumerate(html_files):
            record = self.create_production_matching_record(html_file)
            if record:
                records.append(record)
            else:
                skipped += 1
            
            if (i + 1) % 50 == 0:
                logger.info(f"   Processed {i + 1}/{len(html_files)} files ({len(records)} records, {skipped} skipped)")
        
        logger.info(f"📝 Created {len(records)} production-filtered records")
        
        # Clear existing stage index
        try:
            await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
            logger.info("🧹 Cleared existing stage index")
        except Exception as e:
            logger.warning(f"Could not clear stage index: {e}")
        
        # Upload in smaller batches with error handling
        batch_size = 50
        successful_uploads = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                successful_uploads += len(batch)
                logger.info(f"📤 Uploaded batch {i//batch_size + 1}: {len(batch)} records (Total: {successful_uploads})")
            except Exception as e:
                logger.error(f"Error uploading batch {i//batch_size + 1}: {e}")
                
                # Try individual records in failed batch
                for j, record in enumerate(batch):
                    try:
                        await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=[record])
                        successful_uploads += 1
                    except Exception as record_error:
                        logger.error(f"   Failed record: {record.get('title', 'unknown')} - {record_error}")
        
        logger.info(f"✅ Production-filtered indexing complete: {successful_uploads} records uploaded")
        return successful_uploads
    
    async def compare_iteration2_with_production(self):
        """Compare iteration 2 results with live production"""
        logger.info("🔍 ITERATION 2: COMPARING WITH LIVE PRODUCTION")
        
        # Get live production sample for structure analysis
        logger.info("📊 Fetching live production record structure...")
        try:
            prod_backup_results = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": "backup", "hitsPerPage": 1})
            
            if prod_backup_results.hits:
                prod_sample = prod_backup_results.hits[0]
                
                # Convert Pydantic object to dict for analysis
                prod_dict = prod_sample.model_dump()
                prod_fields = set(k for k in prod_dict.keys() if not k.startswith('_'))
                
                logger.info(f"📊 PRODUCTION SAMPLE STRUCTURE:")
                logger.info(f"   Title: {prod_dict.get('title', 'N/A')}")
                logger.info(f"   Version: {prod_dict.get('version', 'N/A')}")
                logger.info(f"   Content length: {len(prod_dict.get('content', ''))}")
                logger.info(f"   Fields ({len(prod_fields)}): {sorted(prod_fields)}")
                
        except Exception as e:
            logger.error(f"Error fetching production sample: {e}")
            prod_fields = set()
        
        # Get our stage sample
        try:
            stage_backup_results = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": "backup", "hitsPerPage": 1})
            
            if stage_backup_results.hits:
                stage_sample = stage_backup_results.hits[0]
                stage_dict = stage_sample.model_dump()
                stage_fields = set(k for k in stage_dict.keys() if not k.startswith('_'))
                
                logger.info(f"\n📊 OUR STAGE SAMPLE STRUCTURE:")
                logger.info(f"   Title: {stage_dict.get('title', 'N/A')}")
                logger.info(f"   Version: {stage_dict.get('version', 'N/A')}")
                logger.info(f"   Content length: {len(stage_dict.get('content', ''))}")
                logger.info(f"   Fields ({len(stage_fields)}): {sorted(stage_fields)}")
                
        except Exception as e:
            logger.error(f"Error fetching stage sample: {e}")
            stage_fields = set()
        
        # Calculate field parity
        if prod_fields and stage_fields:
            common_fields = prod_fields & stage_fields
            field_parity = len(common_fields) / len(prod_fields) * 100
            missing_fields = prod_fields - stage_fields
            extra_fields = stage_fields - prod_fields
            
            logger.info(f"\n🏗️ FIELD STRUCTURE ANALYSIS:")
            logger.info(f"   Production fields: {len(prod_fields)}")
            logger.info(f"   Stage fields: {len(stage_fields)}")
            logger.info(f"   Common fields: {len(common_fields)}")
            logger.info(f"   Field parity: {field_parity:.1f}%")
            
            if missing_fields:
                logger.warning(f"   ❌ Missing: {sorted(missing_fields)}")
            if extra_fields:
                logger.info(f"   ➕ Extra: {sorted(extra_fields)}")
        else:
            field_parity = 0
        
        # Get index sizes
        prod_stats = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": "", "hitsPerPage": 1})
        stage_stats = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": "", "hitsPerPage": 1})
        
        prod_count = prod_stats.nb_hits
        stage_count = stage_stats.nb_hits
        coverage = stage_count / prod_count * 100 if prod_count > 0 else 0
        
        logger.info(f"\n📊 INDEX SIZE COMPARISON:")
        logger.info(f"   Production: {prod_count:,} records")
        logger.info(f"   Stage: {stage_count:,} records")
        logger.info(f"   Coverage: {coverage:.1f}%")
        
        # Test search rankings with live data
        test_queries = ['backup', 'create table', 'performance', 'authentication', 'cluster']
        ranking_results = {}
        total_similarity = 0
        
        logger.info(f"\n🔍 RANKING COMPARISON WITH LIVE PRODUCTION:")
        
        for query in test_queries:
            try:
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                
                exact_matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
                total_similarity += similarity
                
                logger.info(f"\n   📋 Query: '{query}' - {similarity:.0f}% similarity")
                logger.info(f"      Production: {', '.join(prod_titles[:3])}...")
                logger.info(f"      Stage: {', '.join(stage_titles[:3])}...")
                
                ranking_results[query] = {
                    'prod_titles': prod_titles,
                    'stage_titles': stage_titles,
                    'similarity': similarity,
                    'exact_matches': exact_matches
                }
                
            except Exception as e:
                logger.error(f"Error testing query '{query}': {e}")
        
        avg_similarity = total_similarity / len(test_queries) if test_queries else 0
        
        logger.info(f"\n🎯 ITERATION 2 RESULTS:")
        logger.info(f"   Records indexed: {stage_count:,}")
        logger.info(f"   Coverage: {coverage:.1f}%")
        logger.info(f"   Field parity: {field_parity:.1f}%")
        logger.info(f"   Ranking similarity: {avg_similarity:.1f}%")
        
        # Assessment for next iteration
        if avg_similarity < 70:
            logger.warning("⚠️ ITERATION 3 NEEDED: Still low ranking similarity")
        elif field_parity < 95:
            logger.warning("⚠️ ITERATION 3 NEEDED: Field structure not perfect")
        elif coverage < 90:
            logger.warning("⚠️ ITERATION 3 NEEDED: Missing too many records")
        else:
            logger.info("✅ Great progress! Ready for final tuning")
        
        return {
            'stage_count': stage_count,
            'coverage': coverage,
            'field_parity': field_parity,
            'avg_similarity': avg_similarity,
            'ranking_results': ranking_results
        }

async def main():
    """Run iteration 2 of production-filtered indexing"""
    try:
        indexer = ProductionAnalysisIndexer()
        
        # Index production-filtered files
        record_count = await indexer.index_production_filtered_files()
        
        # Wait for Algolia indexing
        logger.info("⏳ Waiting for Algolia indexing (30 seconds)...")
        await asyncio.sleep(30)
        
        # Compare with live production
        results = await indexer.compare_iteration2_with_production()
        
        logger.info("\n" + "="*70)
        logger.info("🎯 ITERATION 2 COMPLETE")
        logger.info(f"Strategy: Production path-filtered _site files")
        logger.info(f"Records: {results['stage_count']:,}")
        logger.info(f"Coverage: {results['coverage']:.1f}%")
        logger.info(f"Field parity: {results['field_parity']:.1f}%") 
        logger.info(f"Ranking similarity: {results['avg_similarity']:.1f}%")
        logger.info("="*70)
        
    except Exception as e:
        logger.error(f"❌ Iteration 2 failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())