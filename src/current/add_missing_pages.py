#!/usr/bin/env python3
"""Add missing high-ranking pages for poor queries to existing index"""

import os
import logging
import hashlib
import re
from pathlib import Path
from bs4 import BeautifulSoup
import asyncio
from algoliasearch.search.client import SearchClient

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def add_missing_pages():
    """Add specific missing pages that will fix poor queries"""
    
    # Setup client
    stage_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_STAGE_ADMIN_KEY'])
    site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
    
    # Missing pages that will fix our poor queries
    missing_pages = [
        # For 'getting started' query
        'v25.3/spatial-data-overview.html',
        'v25.3/orchestrate-cockroachdb-with-kubernetes-multi-cluster.html', 
        'v25.3/deploy-cockroachdb-with-kubernetes-insecure.html',
        'cockroachcloud/ccloud-get-started.html',
        'cockroachcloud/free-trial.html',
        
        # For 'alter table' query
        'v25.3/eventlog.html',
        'v25.3/online-schema-changes.html', 
        'v25.3/known-limitations.html',
        'v25.3/sql-audit-logging.html',
        
        # For 'cluster' query
        'v25.3/cluster-settings.html',
        'v25.3/monitor-cockroachdb-kubernetes.html',
        'v25.3/sso-sql.html'
    ]
    
    logger.info(f"🎯 Adding {len(missing_pages)} missing pages for poor query optimization")
    
    new_records = []
    
    for page_path in missing_pages:
        html_file = site_path / page_path
        
        if not html_file.exists():
            logger.warning(f"❌ Missing file: {page_path}")
            continue
        
        try:
            # Extract content
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Extract title
            title = "Untitled"
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            elif soup.find('h1'):
                title = soup.find('h1').get_text().strip()
            elif soup.find('title'):
                title = soup.find('title').get_text().strip()
                title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title)
            
            # Extract content
            main = soup.find('main') or soup.find('body')
            if main:
                # Remove unwanted elements
                for unwanted in main.find_all(['nav', 'aside', 'footer', 'header', 'script', 'style']):
                    unwanted.decompose()
                
                content_text = main.get_text(separator=' ')
                content_html = str(main)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # Clean content
            content_text = re.sub(r'Version v\d+\.\d+.*', '', content_text)
            content_text = re.sub(r'Contribute.*?Report Doc.*', '', content_text, flags=re.DOTALL)
            content_text = ' '.join(content_text.split())
            
            # Extract summary
            summary = content_text[:200] + '...' if len(content_text) > 200 else content_text
            
            # Aggressive size control
            if len(content_text) > 20000:
                content_text = content_text[:20000] + '...'
            if len(content_html) > 15000:
                content_html = content_html[:15000] + '...'
            
            # Determine docs_area
            docs_area = 'reference'
            if 'cockroachcloud' in page_path:
                docs_area = 'cockroachcloud'
            elif any(term in page_path.lower() for term in ['getting', 'start', 'quickstart']):
                docs_area = 'get-started'
            elif any(term in page_path.lower() for term in ['cluster', 'monitor', 'manage']):
                docs_area = 'manage'
            
            # Generate URLs
            full_url = f"https://www.cockroachlabs.com/docs/{page_path}"
            object_id = hashlib.md5(f"{title}_{page_path}".encode()).hexdigest()
            
            # Create record with exact 17 fields
            record = {
                'objectID': object_id,
                'title': title,
                'content': content_text,
                'html': content_html,
                'summary': summary,
                'url': full_url,
                'canonical': f"/{page_path}",
                'type': 'page',
                'version': 'v25.3',
                'doc_type': 'cockroachdb',
                'docs_area': docs_area,
                'slug': Path(page_path).stem,
                'last_modified_at': '29-Aug-25',
                'excerpt_html': f"<p>{summary}</p>",
                'excerpt_text': summary,
                'headings': [],
                'tags': [],
                'categories': []
            }
            
            new_records.append(record)
            logger.info(f"✅ Prepared: {title}")
            
        except Exception as e:
            logger.error(f"❌ Error processing {page_path}: {e}")
    
    # Add new records to existing index
    if new_records:
        logger.info(f"📤 Adding {len(new_records)} records to stage index...")
        
        try:
            await stage_client.save_objects(index_name="stage_cockroach_docs", objects=new_records)
            logger.info("✅ Successfully added missing pages")
        except Exception as e:
            logger.error(f"❌ Failed to add records: {e}")
            # Try smaller batches
            for i, record in enumerate(new_records):
                try:
                    await stage_client.save_objects(index_name="stage_cockroach_docs", objects=[record])
                    logger.info(f"✅ Added: {record['title']}")
                except Exception as record_error:
                    logger.error(f"❌ Failed: {record['title']} - {record_error}")
    
    # Test improvements
    await asyncio.sleep(15)
    
    logger.info("\n🔍 TESTING IMPROVEMENTS:")
    
    # Setup prod client for testing
    prod_client = SearchClient('7RXZLDVR5F', os.environ['ALGOLIA_PROD_READ_KEY'])
    
    poor_queries = ['getting started', 'alter table', 'cluster']
    for query in poor_queries:
        try:
            prod = await prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
            stage = await stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
            
            prod_titles = [hit.title for hit in prod.hits]
            stage_titles = [hit.title for hit in stage.hits]
            
            matches = sum(1 for t in stage_titles if t in prod_titles)
            similarity = matches / len(prod_titles) * 100 if prod_titles else 0
            
            status = "🎉" if similarity >= 70 else "⚠️"
            logger.info(f"{status} '{query}': {similarity:.0f}% ({matches}/{len(prod_titles)})")
            
        except Exception as e:
            logger.error(f"Error testing '{query}': {e}")

if __name__ == '__main__':
    asyncio.run(add_missing_pages())