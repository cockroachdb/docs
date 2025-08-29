#!/usr/bin/env python3
"""
ITERATION 6: Robust Poor Query Fix
Fix extraction errors and focus on working files only
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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RobustPoorQueryFix:
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
    
    def verify_and_extract_content(self, html_file):
        """Verify file exists and extract content robustly"""
        try:
            if not html_file.exists():
                return None
            
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if len(content) < 100:  # Skip empty/tiny files
                return None
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # ROBUST TITLE EXTRACTION
            title = "Untitled"
            
            # Try Jekyll front matter
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            elif soup.find('h1'):
                h1 = soup.find('h1')
                title = h1.get_text().strip()
                title = re.sub(r'Edit.*?$', '', title)
            elif soup.find('title'):
                title = soup.find('title').get_text().strip()
                title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title)
            else:
                title = html_file.stem.replace('-', ' ').title()
            
            # Ensure title exists
            if not title or len(title) < 2:
                title = html_file.stem.replace('-', ' ').title()
            
            # ROBUST CONTENT EXTRACTION
            main_content = soup.find('main') or soup.find('body')
            if not main_content:
                return None
            
            # Remove unwanted elements
            for unwanted in main_content.find_all(['nav', 'aside', 'footer', 'header', 'script', 'style']):
                unwanted.decompose()
            
            content_text = main_content.get_text(separator=' ')
            
            # Basic cleaning
            content_text = re.sub(r'Version v\d+\.\d+.*', '', content_text)
            content_text = re.sub(r'Contribute.*?Report Doc.*', '', content_text)
            content_text = ' '.join(content_text.split())
            
            # ROBUST SUMMARY
            summary = "Documentation page"
            
            # Try to get first good paragraph
            for p in main_content.find_all('p'):
                p_text = p.get_text().strip()
                if len(p_text) > 50 and not re.match(r'^Version|^Contribute|^Edit', p_text):
                    summary = p_text[:200]
                    if len(p_text) > 200:
                        summary += '...'
                    break
            
            # Fallback summary
            if summary == "Documentation page" and content_text:
                summary = content_text[:200] + '...'
            
            # AGGRESSIVE SIZE CONTROL
            # Truncate to very conservative limits
            max_content = 15000
            max_html = 8000
            
            if len(content_text) > max_content:
                content_text = content_text[:max_content] + '...'
            
            content_html = str(main_content)
            if len(content_html) > max_html:
                content_html = content_html[:max_html] + '...'
            
            return {
                'title': title[:80],  # Limit title
                'content': content_text,
                'html': content_html,
                'summary': summary[:200],  # Limit summary
                'headings': []  # Skip headings to save space
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None
    
    async def get_working_production_paths(self):
        """Get production paths from our working iteration 3"""
        logger.info("📁 Getting working production paths...")
        
        # Use the known working approach from iteration 3
        paths = set()
        page = 0
        
        while page < 10:  # Limited scope
            try:
                results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": "",
                    "hitsPerPage": 1000,
                    "page": page
                })
                
                if not results.hits:
                    break
                
                for hit in results.hits:
                    try:
                        hit_dict = hit.model_dump()
                        url = hit_dict.get('url', '')
                        if url and '/docs/' in url:
                            path = url.split('/docs/')[-1]
                            paths.add(path)
                    except:
                        continue
                
                page += 1
                if len(results.hits) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error getting paths: {e}")
                break
        
        logger.info(f"✅ Got {len(paths)} production paths")
        return paths
    
    def create_minimal_record(self, html_file, production_paths):
        """Create minimal record guaranteed to fit size limits"""
        
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            return None
        
        # Only process files in production
        if str(rel_path) not in production_paths:
            return None
        
        # Extract content with verification
        content_data = self.verify_and_extract_content(html_file)
        if not content_data:
            return None
        
        # Generate metadata
        docs_area = 'reference'
        path_str = str(rel_path).lower()
        
        if 'cockroachcloud' in path_str:
            docs_area = 'cockroachcloud'
        elif 'getting-started' in path_str or 'quickstart' in path_str:
            docs_area = 'get-started'
        elif any(sql in path_str for sql in ['alter', 'create', 'table', 'sql']):
            docs_area = 'reference.sql'
        
        # URLs
        url_path = str(rel_path)
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        # Create minimal record
        title = content_data['title']
        object_id = hashlib.md5(f"{title}_{url_path}".encode()).hexdigest()
        
        record = {
            'objectID': object_id,
            'title': title,
            'content': content_data['content'],
            'html': content_data['html'],
            'summary': content_data['summary'],
            'url': full_url,
            'canonical': f"/{url_path}",
            'type': 'page',
            'version': 'v25.3',
            'doc_type': 'cockroachdb',
            'docs_area': docs_area,
            'slug': file_path.stem,
            'last_modified_at': '29-Aug-25',
            'excerpt_html': f"<p>{content_data['summary']}</p>",
            'excerpt_text': content_data['summary'],
            'headings': [],
            'tags': [],
            'categories': []
        }
        
        # Verify size
        size = len(json.dumps(record).encode('utf-8'))
        if size > 40000:  # Very conservative
            # Further truncate
            record['content'] = record['content'][:10000] + '...'
            record['html'] = record['html'][:5000] + '...'
        
        return record
    
    async def run_robust_reindex(self):
        """Run reindex with robust error handling"""
        logger.info("🎯 ITERATION 6: ROBUST POOR QUERY FIX")
        
        # Get working production paths
        production_paths = await self.get_working_production_paths()
        
        # Get HTML files and verify they work
        all_files = list(self.site_path.rglob('*.html'))
        logger.info(f"📁 Found {len(all_files)} HTML files")
        
        # Process with verification
        valid_records = []
        processed = 0
        errors = 0
        
        for html_file in all_files:
            record = self.create_minimal_record(html_file, production_paths)
            if record:
                valid_records.append(record)
            else:
                errors += 1
            
            processed += 1
            if processed % 500 == 0:
                logger.info(f"   Processed {processed}/{len(all_files)} ({len(valid_records)} valid, {errors} errors)")
        
        logger.info(f"📝 Created {len(valid_records)} valid records")
        
        # Clear and upload carefully
        await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
        logger.info("🧹 Cleared stage index")
        
        # Upload in very small batches
        batch_size = 10
        uploaded = 0
        
        for i in range(0, len(valid_records), batch_size):
            batch = valid_records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                uploaded += len(batch)
                if uploaded % 100 == 0:
                    logger.info(f"📤 Uploaded {uploaded}/{len(valid_records)}")
            except Exception as e:
                logger.error(f"Batch failed: {str(e)[:100]}...")
        
        logger.info(f"✅ Upload complete: {uploaded} records")
        return uploaded
    
    async def test_poor_query_results(self):
        """Test the poor query improvements"""
        logger.info("🔍 TESTING POOR QUERY RESULTS")
        
        await asyncio.sleep(15)
        
        queries = ['getting started', 'alter table', 'cluster', 'backup', 'authentication']
        results = {}
        
        for query in queries:
            try:
                prod = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
                stage = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
                
                prod_titles = [hit.title for hit in prod.hits]
                stage_titles = [hit.title for hit in stage.hits]
                
                matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = matches / len(prod_titles) * 100 if prod_titles else 0
                
                results[query] = similarity
                
                status = "🎉" if similarity >= 80 else "✅" if similarity >= 70 else "⚠️"
                logger.info(f"{status} '{query}': {similarity:.0f}%")
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")
        
        avg = sum(results.values()) / len(results) if results else 0
        poor_fixed = sum(1 for q in ['getting started', 'alter table', 'cluster'] if results.get(q, 0) >= 70)
        
        logger.info(f"\n🎯 RESULTS: {avg:.1f}% avg, {poor_fixed}/3 poor queries ≥70%")
        return results, avg

async def main():
    """Run robust iteration 6"""
    try:
        fixer = RobustPoorQueryFix()
        
        # Run robust reindex
        record_count = await fixer.run_robust_reindex()
        
        # Test results
        query_results, avg_sim = await fixer.test_poor_query_results()
        
        logger.info(f"\n✅ ITERATION 6 COMPLETE: {record_count} records, {avg_sim:.1f}% similarity")
        
    except Exception as e:
        logger.error(f"❌ Failed: {e}")

if __name__ == '__main__':
    asyncio.run(main())