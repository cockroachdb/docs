#!/usr/bin/env python3
"""
Final fix for cluster query - add the remaining missing records
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

def create_record_for_file(site_path, file_path, title, docs_area):
    """Create a record for a specific file"""
    full_path = site_path / file_path
    
    if not full_path.exists():
        logger.error(f"File doesn't exist: {full_path}")
        return None
    
    try:
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Extract main content
        main = soup.find('main') or soup.find('article') or soup.find('body')
        if main:
            # Remove UI elements
            for elem in main.find_all(['nav', 'aside', 'footer', 'header', 'script', 'style']):
                elem.decompose()
            
            content_text = main.get_text(separator=' ')
            content_html = str(main)
        else:
            content_text = soup.get_text()
            content_html = str(soup)
        
        # Clean content
        content_text = re.sub(r'Version v\d+\.\d+.*', '', content_text)
        content_text = re.sub(r'Contribute.*?Report Doc.*', '', content_text, flags=re.DOTALL)
        content_text = ' '.join(content_text.split())
        
        # Summary
        summary = None
        if main:
            for p in main.find_all('p'):
                p_text = p.get_text().strip()
                if (len(p_text) > 50 and 
                    not re.match(r'^Version|^Contribute|^Edit', p_text)):
                    summary = p_text[:300] + ('...' if len(p_text) > 300 else '')
                    break
        
        if not summary:
            summary = content_text[:250] + '...'
        
        # Headings
        headings = []
        if main:
            for h in main.find_all(['h1', 'h2', 'h3'])[:8]:
                h_text = h.get_text().strip()
                h_text = re.sub(r'Edit.*?$', '', h_text).strip()
                if h_text and h_text != title:
                    headings.append(h_text)
        
        # Limit sizes
        if len(content_text) > 25000:
            content_text = content_text[:25000] + '...'
        if len(content_html) > 20000:
            content_html = content_html[:20000] + '...'
        
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
        object_id = hashlib.md5(f"{title}_{file_path}".encode()).hexdigest()
        
        # Create record
        record = {
            'objectID': object_id,
            'title': title,
            'content': content_text,
            'html': content_html,
            'summary': summary,
            'url': full_url,
            'canonical': canonical,
            'type': 'page',
            'version': version,
            'doc_type': 'cockroachdb',
            'docs_area': docs_area,
            'slug': Path(file_path).stem,
            'last_modified_at': '29-Aug-25',
            'excerpt_html': f"<p>{summary}</p>",
            'excerpt_text': summary,
            'headings': headings,
            'tags': [],
            'categories': []
        }
        
        # Size check
        record_size = len(json.dumps(record).encode('utf-8'))
        if record_size > 45000:
            record['content'] = record['content'][:12000] + '...'
            record['html'] = record['html'][:8000] + '...'
        
        return record
        
    except Exception as e:
        logger.error(f"Error creating record for {file_path}: {e}")
        return None

def main():
    """Add the remaining cluster records"""
    
    # Setup clients  
    app_id = '7RXZLDVR5F'
    admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
    
    stage_client = SearchClient.create(app_id, admin_key)
    stage_index = stage_client.init_index('stage_cockroach_docs')
    
    site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
    
    # From the debug, we're still missing these for cluster query:
    # 'Cluster Settings', 'Cluster Monitoring', 'Cluster Single Sign-on (SSO) using JSON Web Tokens (JWTs)'
    
    # But we added cluster-settings.html, monitor-cockroachdb-kubernetes.html, sso-sql.html
    # The issue might be title mismatch or we need the exact paths production uses
    
    logger.info("🎯 FINAL CLUSTER FIX")
    logger.info("These should already be indexed, checking if they need title fixes...")
    
    # Test current cluster query to see exact issue
    prod_client = SearchClient.create(app_id, os.environ.get('ALGOLIA_PROD_READ_KEY'))
    prod_index = prod_client.init_index('cockroachcloud_docs')
    
    prod = prod_index.search('cluster', {"hitsPerPage": 5})
    stage = stage_index.search('cluster', {"hitsPerPage": 5})
    
    prod_titles = [hit['title'] for hit in prod['hits']]
    stage_titles = [hit['title'] for hit in stage['hits']]
    
    print("🏭 Production titles:")
    for title in prod_titles:
        print(f"   - {title}")
    
    print("🎭 Stage titles:")
    for title in stage_titles:
        print(f"   - {title}")
    
    missing = [t for t in prod_titles if t not in stage_titles]
    print(f"❌ Still missing: {missing}")
    
    # The records were added but might not rank high enough
    # Let's check if they exist in stage at all
    for missing_title in missing:
        try:
            search_result = stage_index.search(missing_title, {"hitsPerPage": 1})
            if search_result['hits']:
                print(f"✅ Found '{missing_title}' in stage index (ranking issue)")
            else:
                print(f"❌ '{missing_title}' not found in stage index at all")
        except Exception as e:
            print(f"❌ Error searching for '{missing_title}': {e}")

if __name__ == '__main__':
    main()