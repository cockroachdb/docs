#!/usr/bin/env python3
"""
Fix 60% performing queries by adding missing records
"""

import os
import logging
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from algoliasearch.search_client import SearchClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class Fix60PercentQueries:
    def __init__(self):
        self.setup_clients()
        self.site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
        
    def setup_clients(self):
        """Setup Algolia clients"""
        app_id = '7RXZLDVR5F'
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        
        self.stage_client = SearchClient.create(app_id, admin_key)
        self.stage_index = self.stage_client.init_index('stage_cockroach_docs')

    def extract_content(self, html_file):
        """Extract content from HTML file"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Title extraction
            title = None
            
            # Jekyll front matter
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            
            # H1 fallback
            if not title:
                h1 = soup.find('h1')
                if h1:
                    title = h1.get_text().strip()
                    title = re.sub(r'Edit.*?$', '', title).strip()
            
            # Page title fallback
            if not title:
                title_elem = soup.find('title')
                if title_elem:
                    title = title_elem.get_text().strip()
                    title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title).strip()
            
            if not title:
                title = Path(html_file).stem.replace('-', ' ').title()
            
            # Content extraction
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            
            if main_content:
                # Remove UI elements
                for elem in main_content.find_all(['nav', 'aside', 'footer', 'header', 'script', 'style']):
                    elem.decompose()
                
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # Clean content
            content_text = re.sub(r'Version v\d+\.\d+.*', '', content_text)
            content_text = re.sub(r'Contribute.*?Report Doc.*', '', content_text, flags=re.DOTALL)
            content_text = ' '.join(content_text.split())
            
            # Summary extraction
            summary = None
            if main_content:
                for p in main_content.find_all('p'):
                    p_text = p.get_text().strip()
                    if (len(p_text) > 50 and 
                        not re.match(r'^Version|^Contribute|^Edit', p_text)):
                        summary = p_text[:300] + ('...' if len(p_text) > 300 else '')
                        break
            
            if not summary:
                summary = content_text[:250] + '...'
            
            # Extract headings
            headings = []
            if main_content:
                for h in main_content.find_all(['h1', 'h2', 'h3'])[:8]:
                    h_text = h.get_text().strip()
                    h_text = re.sub(r'Edit.*?$', '', h_text).strip()
                    if h_text and h_text != title:
                        headings.append(h_text)
            
            # Size limits
            if len(content_text) > 30000:
                content_text = content_text[:30000] + '...'
            if len(content_html) > 25000:
                content_html = content_html[:25000] + '...'
            
            return {
                'title': title,
                'content': content_text,
                'html': content_html,
                'summary': summary,
                'headings': headings
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None

    def get_docs_area(self, file_path, title):
        """Get appropriate docs_area for file"""
        path_str = str(file_path).lower()
        title_lower = title.lower()
        
        # Specific mappings for our missing files
        if 'delete' in path_str:
            return 'reference.sql'
        elif 'explain' in path_str:
            return 'reference.sql'
        elif 'query-data' in path_str:
            return 'develop'
        elif 'update-data' in path_str:
            return 'develop'
        elif 'insert-data' in path_str:
            return 'develop'
        elif 'connect-to' in path_str or 'connect_to' in path_str:
            return 'deploy'
        elif 'schedule' in path_str:
            return 'deploy'
        elif 'upgrade' in path_str:
            return 'manage'
        elif 'ldap' in path_str:
            return 'secure'
        elif 'cockroachcloud' in path_str:
            return 'cockroachcloud'
        elif any(term in path_str for term in ['sql', 'select', 'insert', 'delete', 'update']):
            return 'reference.sql'
        elif 'develop' in path_str or 'data' in title_lower:
            return 'develop'
        elif 'deploy' in path_str or 'kubernetes' in path_str:
            return 'deploy'
        elif 'manage' in path_str or 'monitor' in path_str:
            return 'manage'
        else:
            return 'reference'

    def create_record(self, file_path):
        """Create record for specific file"""
        
        full_path = self.site_path / file_path
        
        if not full_path.exists():
            logger.warning(f"File doesn't exist: {full_path}")
            return None
        
        # Extract content
        content_data = self.extract_content(full_path)
        if not content_data:
            return None
        
        # Get docs_area
        docs_area = self.get_docs_area(file_path, content_data['title'])
        
        # Version
        version = 'v25.3'
        parts = Path(file_path).parts
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # URLs
        canonical = f"/{file_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{file_path}"
        
        # Object ID
        object_id = hashlib.md5(f"{content_data['title']}_{file_path}".encode()).hexdigest()
        
        # Create record
        record = {
            'objectID': object_id,
            'title': content_data['title'],
            'content': content_data['content'],
            'html': content_data['html'],
            'summary': content_data['summary'],
            'url': full_url,
            'canonical': canonical,
            'type': 'page',
            'version': version,
            'doc_type': 'cockroachdb',
            'docs_area': docs_area,
            'slug': Path(file_path).stem,
            'last_modified_at': '29-Aug-25',
            'excerpt_html': f"<p>{content_data['summary']}</p>",
            'excerpt_text': content_data['summary'],
            'headings': content_data['headings'],
            'tags': [],
            'categories': []
        }
        
        # Size check
        record_size = len(json.dumps(record).encode('utf-8'))
        if record_size > 45000:
            logger.warning(f"Large record for {file_path}: {record_size} bytes, truncating")
            record['content'] = record['content'][:15000] + '...'
            record['html'] = record['html'][:10000] + '...'
        
        return record

    def add_missing_records_for_60_percent(self):
        """Add missing records to improve 60% queries"""
        logger.info("🎯 FIXING 60% PERFORMING QUERIES")
        
        # Files identified as missing from debug
        missing_files = [
            # For SELECT query
            "cockroachcloud/connect-to-a-serverless-cluster.html",
            "v25.3/delete.html",
            "cockroachcloud/connect-to-your-cluster.html",
            "v25.3/query-data.html",
            "v25.3/schedule-cockroachdb-kubernetes.html",
            
            # For INSERT query
            "v25.3/update-data.html",
            "v25.3/explain.html",
            
            # For CHANGEFEED query (already has all in top 10, just ranking issue)
            
            # For TROUBLESHOOTING query
            "cockroachcloud/upgrade-cockroach-version.html",
            "v25.3/ldap-authentication.html",
            "v25.3/upgrade-cockroach-version.html",
            "v25.3/upgrade-cockroachdb-operator.html",
            "v25.3/upgrade-cockroachdb-kubernetes.html"
        ]
        
        logger.info(f"📝 Creating {len(missing_files)} missing records")
        
        new_records = []
        successful = 0
        failed = 0
        
        for file_path in missing_files:
            logger.info(f"   Processing: {file_path}")
            
            record = self.create_record(file_path)
            if record:
                new_records.append(record)
                successful += 1
                logger.info(f"   ✅ Created: {record['title']} (Area: {record['docs_area']})")
            else:
                failed += 1
                logger.error(f"   ❌ Failed: {file_path}")
        
        logger.info(f"📊 Created {successful} records, {failed} failed")
        
        if new_records:
            logger.info(f"📤 Adding {len(new_records)} records to stage index...")
            
            try:
                # Add to existing index (don't clear)
                self.stage_index.save_objects(new_records)
                logger.info("✅ Successfully added records")
            except Exception as e:
                logger.error(f"❌ Error adding records: {e}")
                return 0
        
        return len(new_records)

    def test_improvements(self):
        """Test if 60% queries improved"""
        logger.info("🔍 TESTING 60% QUERY IMPROVEMENTS")
        
        import time
        time.sleep(20)  # Wait for indexing
        
        # Setup prod client for testing
        prod_client = SearchClient.create('7RXZLDVR5F', os.environ.get('ALGOLIA_PROD_READ_KEY'))
        prod_index = prod_client.init_index('cockroachcloud_docs')
        
        queries_60 = ['select', 'insert', 'changefeed', 'troubleshooting']
        
        for query in queries_60:
            try:
                prod = prod_index.search(query, {"hitsPerPage": 5})
                stage = self.stage_index.search(query, {"hitsPerPage": 5})
                
                prod_titles = [hit['title'] for hit in prod['hits']]
                stage_titles = [hit['title'] for hit in stage['hits']]
                
                matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = matches / len(prod_titles) * 100 if prod_titles else 0
                
                status = "🎉" if similarity >= 80 else "✅" if similarity >= 60 else "⚠️"
                improvement = "IMPROVED" if similarity > 60 else "NO CHANGE"
                logger.info(f"{status} '{query}': {similarity:.0f}% ({matches}/{len(prod_titles)}) - {improvement}")
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")

def main():
    """Run fix for 60% queries"""
    try:
        fixer = Fix60PercentQueries()
        
        # Add missing records
        added_count = fixer.add_missing_records_for_60_percent()
        
        # Test improvements
        if added_count > 0:
            fixer.test_improvements()
        
        logger.info(f"\n✅ 60% QUERY FIX COMPLETE: Added {added_count} records")
        
    except Exception as e:
        logger.error(f"❌ Fix failed: {e}")

if __name__ == '__main__':
    main()