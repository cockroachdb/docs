#!/usr/bin/env python3
"""
ITERATION 4: Fix Content Extraction Issues
Fix summary extraction, improve title extraction, and optimize ranking without bloat
"""

import os
import logging
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
import asyncio
from algoliasearch.search.client import SearchClient
from urllib.parse import urlparse

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ContentExtractionFixIndexer:
    def __init__(self):
        self.setup_clients()
        self.site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
        self.production_paths = set()
        
    def setup_clients(self):
        """Setup Algolia clients"""
        app_id = os.environ.get('ALGOLIA_APP_ID', '7RXZLDVR5F')
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        if not admin_key or not read_key:
            raise ValueError("Missing API keys")
            
        self.stage_client = SearchClient(app_id, admin_key)
        self.prod_client = SearchClient(app_id, read_key)
    
    async def get_production_paths(self):
        """Get production paths for exact filtering"""
        logger.info("📁 Getting production paths for filtering...")
        
        all_paths = set()
        page = 0
        
        while True:
            try:
                results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": "",
                    "hitsPerPage": 1000,
                    "page": page,
                    "attributesToRetrieve": ["url"]
                })
                
                if not results.hits:
                    break
                
                for hit in results.hits:
                    hit_dict = hit.model_dump()
                    url = hit_dict.get('url', '')
                    if url and '/docs/' in url:
                        path = url.split('/docs/')[-1]
                        all_paths.add(path)
                
                page += 1
                
                if len(results.hits) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching production paths: {e}")
                break
        
        self.production_paths = all_paths
        logger.info(f"✅ Got {len(all_paths)} production paths")
        return all_paths
    
    def is_production_match(self, html_file):
        """Check if HTML file matches production path"""
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
            file_url_path = str(rel_path)
            return file_url_path in self.production_paths
        except ValueError:
            return False
    
    def extract_improved_content(self, html_file):
        """Extract content with improved title and summary extraction"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # IMPROVED TITLE EXTRACTION
            title = None
            
            # 1. Try Jekyll front matter title first (in comments)
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            
            # 2. Try page title
            if not title:
                title_elem = soup.find('title')
                if title_elem:
                    title = title_elem.get_text().strip()
                    title = title.replace(' | CockroachDB Docs', '')
                    title = title.replace(' - CockroachDB Docs', '')
                    title = title.strip()
            
            # 3. Try main h1 (not in header/nav)
            if not title or title == 'CockroachDB Docs':
                main_h1 = soup.select_one('main h1, article h1, .content h1')
                if main_h1:
                    title = main_h1.get_text().strip()
                else:
                    # Fallback to any h1
                    h1 = soup.find('h1')
                    if h1:
                        title = h1.get_text().strip()
            
            # 4. Last resort: filename
            if not title:
                title = html_file.stem.replace('-', ' ').title()
            
            # IMPROVED CONTENT EXTRACTION
            main_content = None
            
            # Try specific Jekyll content containers first
            for selector in [
                'main .content', 'main', 'article', '.content', '.main-content', 
                '[role="main"]', '#content', '.docs-content', 'body .content'
            ]:
                main_content = soup.select_one(selector)
                if main_content:
                    break
            
            if not main_content:
                main_content = soup.find('body')
            
            if main_content:
                # Remove UI elements more aggressively
                for unwanted in main_content.find_all([
                    'nav', 'aside', 'footer', 'header', 'script', 'style', 'noscript'
                ]):
                    unwanted.decompose()
                
                # Remove by class/id
                for unwanted in main_content.find_all(attrs={
                    'class': lambda x: x and any(cls in str(x).lower() for cls in [
                        'sidebar', 'nav', 'footer', 'header', 'toc', 'breadcrumb', 
                        'pagination', 'search', 'version-selector', 'feedback'
                    ])
                }):
                    unwanted.decompose()
                
                for unwanted in main_content.find_all(attrs={
                    'id': lambda x: x and any(cls in str(x).lower() for cls in [
                        'sidebar', 'nav', 'footer', 'header', 'toc', 'search'
                    ])
                }):
                    unwanted.decompose()
                
                # Get clean content
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # IMPROVED CONTENT CLEANING
            # Remove version selectors and navigation text
            content_text = re.sub(r'Version v\d+\.\d+\.\d+.*?v\d+\.\d+\.\d+', '', content_text)
            content_text = re.sub(r'Contribute View Page Source Edit This Page Report Doc Issue', '', content_text)
            content_text = re.sub(r'On this page.*?Edit This Page', '', content_text)
            content_text = re.sub(r'Edit This Page.*?Report Doc Issue', '', content_text)
            
            # Clean whitespace
            content_text = ' '.join(content_text.split())
            
            # IMPROVED SUMMARY EXTRACTION
            # Get first meaningful paragraph, not version selector text
            summary = None
            
            # Try to find first substantial paragraph
            if main_content:
                for p in main_content.find_all('p'):
                    p_text = p.get_text().strip()
                    # Skip version selectors, navigation, short paragraphs
                    if (len(p_text) > 50 and 
                        not re.match(r'^Version v\d+', p_text) and
                        not re.match(r'^Contribute|Edit This Page|Report Doc', p_text)):
                        summary = p_text[:200].strip()
                        if len(p_text) > 200:
                            summary += '...'
                        break
            
            # Fallback to content start
            if not summary:
                clean_content = re.sub(r'^.*?(?=[A-Z][a-z])', '', content_text[:500])
                summary = clean_content[:200].strip()
                if len(clean_content) > 200:
                    summary += '...'
            
            # Ensure we have some summary
            if not summary or len(summary) < 20:
                summary = content_text[:200].strip() + '...'
            
            # Truncate content for size limits
            max_content_size = 30000
            if len(content_text) > max_content_size:
                content_text = content_text[:max_content_size] + '...'
            if len(content_html) > max_content_size:
                content_html = content_html[:max_content_size] + '...'
            
            # Extract headings
            headings = []
            if main_content:
                for h in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                    heading_text = h.get_text().strip()
                    if heading_text and heading_text != title and len(heading_text) > 3:
                        headings.append(heading_text)
            
            return {
                'title': title,
                'content': content_text,
                'html': content_html,
                'summary': summary,
                'headings': headings[:10]
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None
    
    def create_optimized_record(self, html_file):
        """Create record with optimized content extraction"""
        
        # Extract content with improvements
        content_data = self.extract_improved_content(html_file)
        if not content_data:
            return None
        
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            rel_path = file_path
        
        # Determine version from path
        version = 'v25.3'
        parts = rel_path.parts
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # Determine docs_area
        docs_area = 'reference'
        path_str = str(rel_path).lower()
        
        if 'cockroachcloud' in path_str:
            docs_area = 'cockroachcloud'
        elif any(sql_keyword in path_str for sql_keyword in ['sql', 'create', 'alter', 'select', 'backup', 'restore']):
            docs_area = 'reference.sql'
        elif any(ui_keyword in path_str for ui_keyword in ['admin-ui', 'ui-', 'monitoring', 'cluster']):
            docs_area = 'manage'
        
        # Generate URLs
        url_path = str(rel_path)
        canonical = f"/{url_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        # Use improved summary
        summary = content_data['summary']
        excerpt_text = summary
        
        # Create better excerpt HTML
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        
        # Find first meaningful paragraph for excerpt
        excerpt_html = f"<p>{summary}</p>"
        for p in soup.find_all('p'):
            p_text = p.get_text().strip()
            if len(p_text) > 50 and not re.match(r'^Version v\d+|^Contribute|^Edit This', p_text):
                p_html = str(p)
                if len(p_html) < 1000:  # Not too long
                    excerpt_html = p_html
                    break
        
        # Generate object ID
        title = content_data['title']
        object_id = hashlib.md5(f"{title}_{url_path}".encode()).hexdigest()
        
        # Create record with EXACTLY 17 fields (matching production)
        record = {
            'objectID': object_id,
            'title': title,
            'content': content_data['content'],
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
        
        # Validate record size
        record_size = len(json.dumps(record).encode('utf-8'))
        if record_size > 45000:
            logger.warning(f"Large record {title}: {record_size} bytes, truncating...")
            record['content'] = record['content'][:15000] + '...'
            record['html'] = record['html'][:15000] + '...'
            record_size = len(json.dumps(record).encode('utf-8'))
            logger.info(f"   Truncated to {record_size} bytes")
        
        return record
    
    async def index_with_improved_extraction(self):
        """Index with improved content extraction"""
        logger.info("🎯 ITERATION 4: IMPROVED CONTENT EXTRACTION")
        
        # Get production paths
        await self.get_production_paths()
        
        # Get all HTML files and filter to production matches
        all_files = list(self.site_path.rglob('*.html'))
        matching_files = [f for f in all_files if self.is_production_match(f)]
        
        logger.info(f"📁 Processing {len(matching_files)} production-matching files")
        
        # Process files with improved extraction
        records = []
        skipped = 0
        
        for i, html_file in enumerate(matching_files):
            record = self.create_optimized_record(html_file)
            if record:
                records.append(record)
                # Log first few summaries to verify improvement
                if len(records) <= 5:
                    logger.info(f"   Sample {len(records)}: '{record['title'][:40]}...' -> '{record['summary'][:50]}...'")
            else:
                skipped += 1
            
            if (i + 1) % 50 == 0:
                logger.info(f"   Processed {i + 1}/{len(matching_files)} files ({len(records)} records)")
        
        logger.info(f"📝 Created {len(records)} optimized records")
        
        # Clear and upload
        try:
            await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
            logger.info("🧹 Cleared existing stage index")
        except Exception as e:
            logger.warning(f"Could not clear stage index: {e}")
        
        # Upload in batches
        batch_size = 50
        successful_uploads = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                successful_uploads += len(batch)
                if (i//batch_size + 1) % 5 == 0:  # Every 5th batch
                    logger.info(f"📤 Uploaded batch {i//batch_size + 1}: Total {successful_uploads} records")
            except Exception as e:
                logger.error(f"Error uploading batch {i//batch_size + 1}: {e}")
        
        logger.info(f"✅ Improved extraction indexing complete: {successful_uploads} records uploaded")
        return successful_uploads
    
    async def test_improved_ranking(self):
        """Test if improved extraction fixes ranking issues"""
        logger.info("🔍 TESTING IMPROVED RANKING")
        
        # Wait for indexing
        await asyncio.sleep(15)
        
        # Test queries that had issues
        problem_queries = ['create table', 'cockroachcloud', 'backup restore']
        
        improved_results = {}
        
        for query in problem_queries:
            try:
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                
                exact_matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
                
                logger.info(f"\n📋 Query: '{query}' - {similarity:.0f}% similarity")
                logger.info(f"   Production: {', '.join(prod_titles[:3])}")
                logger.info(f"   Stage: {', '.join(stage_titles[:3])}")
                
                # Test summary quality for top result
                if stage_results.hits:
                    stage_summary = stage_results.hits[0].model_dump().get('summary', '')
                    summary_quality = "✅ Good" if len(stage_summary) > 20 and not stage_summary.startswith('Version v') else "❌ Poor"
                    logger.info(f"   Summary: {summary_quality} - '{stage_summary[:60]}...'")
                
                improved_results[query] = {
                    'similarity': similarity,
                    'prod_titles': prod_titles,
                    'stage_titles': stage_titles
                }
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")
        
        return improved_results

async def main():
    """Run iteration 4 content extraction improvements"""
    try:
        indexer = ContentExtractionFixIndexer()
        
        # Index with improved extraction
        record_count = await indexer.index_with_improved_extraction()
        
        # Test improvements
        improved_results = await indexer.test_improved_ranking()
        
        # Calculate average improvement
        similarities = [r['similarity'] for r in improved_results.values()]
        avg_similarity = sum(similarities) / len(similarities) if similarities else 0
        
        logger.info(f"\n🎯 ITERATION 4 RESULTS:")
        logger.info(f"   Records: {record_count}")
        logger.info(f"   Avg similarity: {avg_similarity:.1f}%")
        logger.info(f"   Improvement focus: Content extraction & summary quality")
        
    except Exception as e:
        logger.error(f"❌ Iteration 4 failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())