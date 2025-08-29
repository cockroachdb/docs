#!/usr/bin/env python3
"""
ITERATION 1: Focused Site Files Indexer
Fix record size limits and match production scope (846 focused records)
"""

import os
import logging
import hashlib
import json
from pathlib import Path
from bs4 import BeautifulSoup
import asyncio
from algoliasearch.search.client import SearchClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class FocusedSiteIndexer:
    def __init__(self):
        self.setup_clients()
        self.site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
        
    def setup_clients(self):
        """Setup Algolia clients"""
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        if not admin_key or not read_key:
            raise ValueError("Missing API keys")
            
        self.stage_client = SearchClient(app_id, admin_key)
        self.prod_client = SearchClient(app_id, read_key)
    
    def is_production_worthy_file(self, html_file):
        """Filter files to match production's focused approach"""
        file_str = str(html_file)
        
        # Production focuses on:
        # 1. v25.3 primarily (current version)
        # 2. cockroachcloud docs
        # 3. Core SQL reference docs
        # 4. Essential management docs
        
        # Include v25.3 files
        if '/v25.3/' in file_str:
            return True
            
        # Include cockroachcloud files  
        if '/cockroachcloud/' in file_str:
            return True
            
        # Include key SQL reference files from other versions
        if any(keyword in html_file.name.lower() for keyword in [
            'backup', 'restore', 'create-table', 'alter-table', 'select', 'insert', 
            'update', 'delete', 'grant', 'authentication', 'cluster', 'performance'
        ]):
            return True
        
        # Exclude very old versions (keep v24.x and newer)
        if any(old_ver in file_str for old_ver in ['/v1.', '/v2.', '/v19.', '/v20.', '/v21.', '/v22.', '/v23.']):
            return False
            
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
            # Look for main content container
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
        
        # Determine version (production focuses on v25.3)
        version = 'v25.3'  # Default
        parts = rel_path.parts
        for part in parts:
            if part.startswith('v') and '.' in part:
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
        
        # Generate URLs (match production format)
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
        
        # Create record with ALL 18 production fields
        record = {
            'objectID': object_id,
            'title': title,
            'content': content,
            'html': content_data['html'],
            'summary': summary,
            'url': full_url,
            'canonical': canonical,
            'type': 'page',  # Production uses 'page' exclusively
            'version': version,
            'doc_type': 'cockroachdb',  # Production standard
            'docs_area': docs_area,
            'slug': file_path.stem,
            'last_modified_at': '29-Aug-25',  # Current date
            'excerpt_html': excerpt_html,
            'excerpt_text': excerpt_text,
            'headings': content_data['headings'],
            'tags': [],  # Production shows null/empty for most
            'categories': []  # Production shows null/empty for most
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
    
    def discover_focused_html_files(self):
        """Discover HTML files with production-like focus"""
        logger.info(f"🔍 Discovering focused HTML files in {self.site_path}")
        
        html_files = []
        
        # Get all HTML files first
        all_files = list(self.site_path.rglob('*.html'))
        
        # Filter to production-worthy files
        for html_file in all_files:
            if self.is_production_worthy_file(html_file):
                html_files.append(html_file)
        
        logger.info(f"📊 Filtered {len(all_files)} → {len(html_files)} production-focused files")
        return html_files
    
    async def index_focused_site_files(self):
        """Index focused files from _site (production scope)"""
        logger.info("🎯 ITERATION 1: FOCUSED SITE FILES INDEXING")
        
        # Discover focused files
        html_files = self.discover_focused_html_files()
        
        # Process files
        records = []
        skipped = 0
        
        for i, html_file in enumerate(html_files):
            record = self.create_production_matching_record(html_file)
            if record:
                records.append(record)
            else:
                skipped += 1
            
            if (i + 1) % 100 == 0:
                logger.info(f"   Processed {i + 1}/{len(html_files)} files ({len(records)} records, {skipped} skipped)")
        
        logger.info(f"📝 Created {len(records)} focused records from {len(html_files)} HTML files")
        
        # Clear existing stage index
        try:
            await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
            logger.info("🧹 Cleared existing stage index")
        except Exception as e:
            logger.warning(f"Could not clear stage index: {e}")
        
        # Upload in smaller batches with error handling
        batch_size = 50  # Smaller batches
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
        
        logger.info(f"✅ Focused indexing complete: {successful_uploads} records uploaded")
        return successful_uploads
    
    async def compare_iteration1_with_production(self):
        """Compare iteration 1 results with live production"""
        logger.info("🔍 ITERATION 1: COMPARING WITH LIVE PRODUCTION")
        
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
                logger.info(f"   Fields: {sorted(prod_fields)}")
                
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
                logger.info(f"   Fields: {sorted(stage_fields)}")
                
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
        
        logger.info(f"\n🎯 ITERATION 1 RESULTS:")
        logger.info(f"   Records indexed: {stage_count:,}")
        logger.info(f"   Coverage: {coverage:.1f}%")
        logger.info(f"   Field parity: {field_parity:.1f}%")
        logger.info(f"   Ranking similarity: {avg_similarity:.1f}%")
        
        # Assessment for next iteration
        if avg_similarity < 60:
            logger.warning("⚠️ ITERATION 2 NEEDED: Low ranking similarity")
        elif field_parity < 90:
            logger.warning("⚠️ ITERATION 2 NEEDED: Field structure gaps")
        else:
            logger.info("✅ Good progress! Ready for fine-tuning")
        
        return {
            'stage_count': stage_count,
            'coverage': coverage,
            'field_parity': field_parity,
            'avg_similarity': avg_similarity,
            'ranking_results': ranking_results
        }

async def main():
    """Run iteration 1 of focused indexing"""
    try:
        indexer = FocusedSiteIndexer()
        
        # Index focused files
        record_count = await indexer.index_focused_site_files()
        
        # Wait for Algolia indexing
        logger.info("⏳ Waiting for Algolia indexing (30 seconds)...")
        await asyncio.sleep(30)
        
        # Compare with live production
        results = await indexer.compare_iteration1_with_production()
        
        logger.info("\n" + "="*70)
        logger.info("🎯 ITERATION 1 COMPLETE")
        logger.info(f"Strategy: Focused _site files (production scope)")
        logger.info(f"Records: {results['stage_count']:,}")
        logger.info(f"Coverage: {results['coverage']:.1f}%")
        logger.info(f"Field parity: {results['field_parity']:.1f}%") 
        logger.info(f"Ranking similarity: {results['avg_similarity']:.1f}%")
        logger.info("="*70)
        
    except Exception as e:
        logger.error(f"❌ Iteration 1 failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())