#!/usr/bin/env python3
"""
Site Files Indexer - Jekyll-Style Approach
Index from _site HTML files like Jekyll-Algolia gem does
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

class SiteFilesIndexer:
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
    
    def extract_content_from_html(self, html_file):
        """Extract content from HTML file like Jekyll-Algolia does"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title (like Jekyll does)
            title_elem = soup.find('title')
            if title_elem:
                title = title_elem.get_text().strip()
                # Remove site name suffix if present
                if ' | CockroachDB Docs' in title:
                    title = title.replace(' | CockroachDB Docs', '').strip()
            else:
                # Fallback to h1
                h1 = soup.find('h1')
                title = h1.get_text().strip() if h1 else html_file.stem.replace('-', ' ').title()
            
            # Extract main content (similar to Jekyll-Algolia extraction)
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            if not main_content:
                # Fallback to body content
                main_content = soup.find('body')
            
            if main_content:
                # Remove navigation, sidebars, footers
                for unwanted in main_content.find_all(['nav', 'aside', 'footer', 'script', 'style']):
                    unwanted.decompose()
                
                # Remove common UI elements
                for unwanted in main_content.find_all(class_=['sidebar', 'navigation', 'nav', 'footer', 'header']):
                    unwanted.decompose()
                    
                content_text = main_content.get_text()
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # Clean up content text
            content_text = ' '.join(content_text.split())  # Normalize whitespace
            
            # Extract headings for search
            headings = []
            for h in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                heading_text = h.get_text().strip()
                if heading_text and heading_text not in headings:
                    headings.append(heading_text)
            
            return {
                'title': title,
                'content': content_text,
                'html': content_html,
                'headings': headings
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None
    
    def determine_metadata_from_path(self, html_file):
        """Determine metadata from file path like Jekyll does"""
        file_path = Path(html_file)
        
        # Get relative path from docs root
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            rel_path = file_path
        
        # Determine version from path
        version = 'v25.3'  # Default to latest
        parts = rel_path.parts
        
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # Determine docs area
        docs_area = 'reference'
        if 'cockroachcloud' in str(rel_path):
            docs_area = 'cockroachcloud'
        elif any(keyword in str(rel_path).lower() for keyword in ['sql', 'statement', 'function']):
            docs_area = 'reference.sql'
        elif 'admin-ui' in str(rel_path) or 'ui-' in str(rel_path):
            docs_area = 'manage'
        
        # Generate URLs
        url_path = str(rel_path).replace('.html', '.html')
        canonical = f"/{url_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        return {
            'version': version,
            'docs_area': docs_area,
            'slug': file_path.stem,
            'url': full_url,
            'canonical': canonical,
            'type': 'page',
            'doc_type': 'cockroachdb'
        }
    
    def create_jekyll_style_record(self, html_file):
        """Create a record in Jekyll-Algolia style from HTML file"""
        
        # Extract content
        content_data = self.extract_content_from_html(html_file)
        if not content_data:
            return None
        
        # Get metadata
        metadata = self.determine_metadata_from_path(html_file)
        
        # Create Jekyll-style summary (first 200 chars of content)
        summary = content_data['content'][:200].strip()
        if len(content_data['content']) > 200:
            summary += '...'
        
        # Create excerpt HTML (first paragraph)
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        first_p = soup.find('p')
        excerpt_html = str(first_p) if first_p else content_data['html'][:200] + '...'
        
        # Generate object ID
        title = content_data['title']
        url = metadata['url']
        object_id = hashlib.md5(f"{title}_{url}".encode()).hexdigest()
        
        # Create record with all production fields
        record = {
            'objectID': object_id,
            'title': title,
            'content': content_data['content'],
            'html': content_data['html'],
            'summary': summary,
            'url': metadata['url'],
            'canonical': metadata['canonical'],
            'type': metadata['type'],
            'version': metadata['version'],
            'doc_type': metadata['doc_type'],
            'docs_area': metadata['docs_area'],
            'slug': metadata['slug'],
            'last_modified_at': '29-Aug-25',  # Current date
            'excerpt_html': excerpt_html,
            'excerpt_text': summary,
            'headings': content_data['headings'] or [],
            'tags': [],  # Jekyll would populate from frontmatter
            'categories': []  # Jekyll would populate from frontmatter
        }
        
        return record
    
    def discover_html_files(self):
        """Discover all HTML files in _site like Jekyll does"""
        logger.info(f"🔍 Discovering HTML files in {self.site_path}")
        
        html_files = []
        
        # Look for HTML files (excluding certain patterns)
        exclude_patterns = ['404.html', 'search.html', 'index.html']
        
        for html_file in self.site_path.rglob('*.html'):
            # Skip certain files
            if any(pattern in html_file.name for pattern in exclude_patterns):
                continue
                
            # Skip internal/system files
            if '/_internal/' in str(html_file) or html_file.name.startswith('_'):
                continue
                
            html_files.append(html_file)
        
        logger.info(f"✅ Discovered {len(html_files)} HTML files")
        return html_files
    
    async def index_from_site_files(self):
        """Index all content from _site files"""
        logger.info("🚀 INDEXING FROM _SITE FILES")
        
        # Discover HTML files
        html_files = self.discover_html_files()
        
        # Process each file
        records = []
        for i, html_file in enumerate(html_files):
            record = self.create_jekyll_style_record(html_file)
            if record:
                records.append(record)
            
            if (i + 1) % 50 == 0:
                logger.info(f"   Processed {i + 1}/{len(html_files)} files")
        
        logger.info(f"📝 Created {len(records)} records from HTML files")
        
        # Clear existing stage index
        try:
            await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
            logger.info("🧹 Cleared existing stage index")
        except Exception as e:
            logger.warning(f"Could not clear stage index: {e}")
        
        # Upload in batches
        batch_size = 100
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                logger.info(f"📤 Uploaded batch {i//batch_size + 1}: {len(batch)} records")
            except Exception as e:
                logger.error(f"Error uploading batch: {e}")
        
        logger.info(f"✅ Indexing complete: {len(records)} records")
        return len(records)
    
    async def compare_with_production(self):
        """Compare our _site-based index with production"""
        logger.info("🔍 COMPARING _SITE INDEX WITH PRODUCTION")
        
        # Get index sizes
        prod_stats = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": "", "hitsPerPage": 1})
        stage_stats = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": "", "hitsPerPage": 1})
        
        prod_count = prod_stats.nb_hits
        stage_count = stage_stats.nb_hits
        coverage = stage_count / prod_count * 100 if prod_count > 0 else 0
        
        logger.info(f"📊 INDEX SIZES:")
        logger.info(f"   Production: {prod_count:,} records")
        logger.info(f"   Stage: {stage_count:,} records") 
        logger.info(f"   Coverage: {coverage:.1f}%")
        
        # Test search rankings
        test_queries = ['backup', 'create table', 'performance', 'authentication', 'cluster']
        ranking_results = {}
        
        for query in test_queries:
            logger.info(f"\n🔍 Testing query: '{query}'")
            
            prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
            stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
            
            prod_titles = [hit.title for hit in prod_results.hits]
            stage_titles = [hit.title for hit in stage_results.hits]
            
            exact_matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
            
            logger.info(f"   Production: {', '.join(prod_titles[:3])}...")
            logger.info(f"   Stage: {', '.join(stage_titles[:3])}...")
            logger.info(f"   Similarity: {similarity:.0f}% ({exact_matches}/{len(prod_titles)})")
            
            ranking_results[query] = {
                'prod_titles': prod_titles,
                'stage_titles': stage_titles,
                'similarity': similarity
            }
        
        avg_similarity = sum(r['similarity'] for r in ranking_results.values()) / len(ranking_results)
        logger.info(f"\n🎯 AVERAGE RANKING SIMILARITY: {avg_similarity:.1f}%")
        
        # Check record structure parity
        if prod_results.hits and stage_results.hits:
            prod_record = prod_results.hits[0]
            stage_record = stage_results.hits[0]
            
            # Convert to dict for comparison (handling Pydantic objects)
            prod_fields = set(prod_record.model_dump().keys())
            stage_fields = set(stage_record.model_dump().keys())
            
            field_parity = len(prod_fields & stage_fields) / len(prod_fields) * 100
            logger.info(f"🏗️ FIELD STRUCTURE PARITY: {field_parity:.1f}%")
        
        return {
            'coverage': coverage,
            'avg_similarity': avg_similarity,
            'ranking_results': ranking_results,
            'prod_count': prod_count,
            'stage_count': stage_count
        }

async def main():
    """Run site files indexing and comparison"""
    try:
        indexer = SiteFilesIndexer()
        
        # Step 1: Index from _site files
        record_count = await indexer.index_from_site_files()
        
        # Step 2: Wait for indexing
        logger.info("⏳ Waiting for Algolia indexing...")
        await asyncio.sleep(10)
        
        # Step 3: Compare with production
        results = await indexer.compare_with_production()
        
        logger.info("\n" + "="*60)
        logger.info("🎯 ITERATION 1 RESULTS:")
        logger.info(f"   Records created: {record_count}")
        logger.info(f"   Coverage: {results['coverage']:.1f}%") 
        logger.info(f"   Ranking similarity: {results['avg_similarity']:.1f}%")
        logger.info("="*60)
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Site files indexing failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())