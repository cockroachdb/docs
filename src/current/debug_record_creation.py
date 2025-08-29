#!/usr/bin/env python3
"""
Debug why specific files aren't creating records properly
"""

import os
import hashlib
import json
import re
from pathlib import Path
from bs4 import BeautifulSoup
from algoliasearch.search_client import SearchClient

def debug_record_creation():
    """Debug record creation for missing files"""
    
    site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
    
    # Files we know are missing from our stage results
    test_files = [
        "v25.3/orchestrate-cockroachdb-with-kubernetes-multi-cluster.html",
        "v25.3/eventlog.html", 
        "v25.3/cluster-settings.html",
        "cockroachcloud/cluster-overview-page.html"
    ]
    
    for file_path in test_files:
        print(f"\n🔍 DEBUGGING: {file_path}")
        print("="*60)
        
        full_path = site_path / file_path
        
        if not full_path.exists():
            print(f"❌ File doesn't exist: {full_path}")
            continue
        
        try:
            # Try to extract content like our script does
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # Title extraction
            title = None
            
            # Jekyll front matter
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
                print(f"📝 Front matter title: {title}")
            
            # H1 fallback
            if not title:
                h1 = soup.find('h1')
                if h1:
                    title = h1.get_text().strip()
                    title = re.sub(r'Edit.*?$', '', title).strip()
                    print(f"📝 H1 title: {title}")
            
            # Page title fallback
            if not title:
                title_elem = soup.find('title')
                if title_elem:
                    title = title_elem.get_text().strip()
                    title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title).strip()
                    print(f"📝 Page title: {title}")
            
            if not title:
                print("❌ No title found!")
                continue
            
            # Content extraction
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            if main_content:
                content_text = main_content.get_text(separator=' ')
                print(f"📄 Content length: {len(content_text)} chars")
                print(f"📄 Content preview: {content_text[:200]}...")
            else:
                print("❌ No main content found!")
                continue
            
            # Check if record would be created
            rel_path = Path(file_path)
            object_id = hashlib.md5(f"{title}_{file_path}".encode()).hexdigest()
            
            # Create minimal record to test
            test_record = {
                'objectID': object_id,
                'title': title,
                'content': content_text[:1000],
                'url': f"https://www.cockroachlabs.com/docs/{file_path}"
            }
            
            record_size = len(json.dumps(test_record).encode('utf-8'))
            print(f"📦 Estimated record size: {record_size} bytes")
            
            if record_size < 50000:
                print("✅ Record would be valid (under size limit)")
            else:
                print("⚠️ Record might be too large")
                
        except Exception as e:
            print(f"❌ Error processing {file_path}: {e}")

if __name__ == '__main__':
    debug_record_creation()