#!/usr/bin/env python3
"""
Comprehensive fix to achieve 90% similarity target
Focus on: 
1. Adding critical missing files
2. Improving ranking by optimizing docs_area and content
3. Enhanced content extraction for better relevance
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

class Achieve90Percent:
    def __init__(self):
        self.setup_clients()
        self.site_path = Path("/Users/eeshan/Desktop/docs/src/current/_site/docs")
        
    def setup_clients(self):
        """Setup Algolia clients"""
        app_id = '7RXZLDVR5F'
        admin_key = os.environ.get('ALGOLIA_STAGE_ADMIN_KEY')
        read_key = os.environ.get('ALGOLIA_PROD_READ_KEY')
        
        self.stage_client = SearchClient.create(app_id, admin_key)
        self.prod_client = SearchClient.create(app_id, read_key)
        
        self.stage_index = self.stage_client.init_index('stage_cockroach_docs')
        self.prod_index = self.prod_client.init_index('cockroachcloud_docs')

    def get_all_missing_files(self):
        """Get comprehensive list of files that would improve our scores"""
        logger.info("🔍 Getting comprehensive missing files analysis...")
        
        # Test many queries to find all missing files
        comprehensive_queries = [
            'backup', 'authentication', 'select', 'insert', 'changefeed', 'cluster', 
            'troubleshooting', 'update', 'index', 'join', 'transaction', 'create table',
            'performance', 'security', 'monitoring', 'replication', 'delete',
            # Additional queries for comprehensive coverage
            'sql', 'database', 'table', 'node', 'deploy', 'kubernetes', 'cloud',
            'migration', 'restore', 'export', 'import', 'admin', 'user'
        ]
        
        all_missing = set()
        
        for query in comprehensive_queries:
            try:
                prod = self.prod_index.search(query, {
                    "hitsPerPage": 10,
                    "attributesToRetrieve": ["title", "url"]
                })
                
                stage = self.stage_index.search(query, {
                    "hitsPerPage": 20,
                    "attributesToRetrieve": ["title", "url"]
                })
                
                prod_titles = [hit['title'] for hit in prod['hits']]
                stage_titles = [hit['title'] for hit in stage['hits']]
                
                # Find missing titles
                for i, hit in enumerate(prod['hits'][:5]):  # Focus on top 5
                    if hit['title'] not in stage_titles:
                        url = hit['url']
                        if '/docs/' in url:
                            path = url.split('/docs/')[-1]
                            all_missing.add(path)
                
            except Exception as e:
                logger.error(f"Error analyzing '{query}': {e}")
        
        logger.info(f"📋 Found {len(all_missing)} unique missing files across all queries")
        return list(all_missing)

    def extract_enhanced_content(self, html_file):
        """Enhanced content extraction for better ranking"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # ENHANCED TITLE EXTRACTION
            title = None
            
            # 1. Jekyll front matter (highest priority)
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            
            # 2. Main heading
            if not title:
                h1 = soup.find('h1')
                if h1:
                    title = h1.get_text().strip()
                    title = re.sub(r'Edit.*?$', '', title).strip()
            
            # 3. Page title
            if not title:
                title_elem = soup.find('title')
                if title_elem:
                    title = title_elem.get_text().strip()
                    title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title).strip()
            
            # 4. Filename fallback
            if not title or len(title) < 3:
                title = Path(html_file).stem.replace('-', ' ').title()
            
            # ENHANCED CONTENT EXTRACTION for better search relevance
            main_content = soup.find('main') or soup.find('article') or soup.find('.content') or soup.find('body')
            
            if main_content:
                # Remove UI elements more aggressively
                for elem in main_content.find_all([
                    'nav', 'aside', 'footer', 'header', 'script', 'style', 'noscript'
                ]):
                    elem.decompose()
                
                # Remove by class patterns
                for elem in main_content.find_all(attrs={
                    'class': lambda x: x and any(cls in str(x).lower() for cls in [
                        'sidebar', 'nav', 'footer', 'breadcrumb', 'version', 'edit', 'contribute'
                    ])
                }):
                    elem.decompose()
                
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # AGGRESSIVE CONTENT CLEANING for better search
            content_text = re.sub(r'Version v\d+\.\d+.*?v\d+\.\d+.*', '', content_text)
            content_text = re.sub(r'Contribute.*?Report Doc Issue.*', '', content_text, flags=re.DOTALL)
            content_text = re.sub(r'Edit This Page.*', '', content_text)
            content_text = re.sub(r'On this page.*?(?=\n[A-Z])', '', content_text, flags=re.DOTALL)
            content_text = ' '.join(content_text.split())
            
            # ENHANCED SUMMARY for better ranking
            summary = None
            
            if main_content:
                # Look for the best descriptive paragraph
                paragraphs = main_content.find_all('p')
                
                for p in paragraphs:
                    p_text = p.get_text().strip()
                    
                    # Skip UI/navigation text
                    if (len(p_text) > 60 and 
                        not re.match(r'^Version|^Contribute|^Edit|^Report|^On this page|^Note:|^Warning:', p_text) and
                        not 'cockroachdb.com' in p_text.lower()):
                        
                        # Prefer paragraphs with key terms
                        key_terms = ['cockroachdb', 'statement', 'command', 'use', 'allows', 'provides', 'enables']
                        if any(term in p_text.lower() for term in key_terms):
                            summary = p_text[:350] + ('...' if len(p_text) > 350 else '')
                            break
                        elif not summary and len(p_text) > 80:
                            summary = p_text[:300] + ('...' if len(p_text) > 300 else '')
            
            # Fallback summary
            if not summary:
                # Extract from start of clean content
                sentences = re.split(r'[.!?]+', content_text)
                good_sentences = []
                
                for sentence in sentences[:4]:
                    sentence = sentence.strip()
                    if (len(sentence) > 30 and 
                        not re.match(r'^Version|^Contribute|^Edit', sentence)):
                        good_sentences.append(sentence)
                        if len(' '.join(good_sentences)) > 250:
                            break
                
                if good_sentences:
                    summary = '. '.join(good_sentences) + '.'
                else:
                    summary = content_text[:200] + '...'
            
            # Enhanced headings extraction
            headings = []
            if main_content:
                for h in main_content.find_all(['h1', 'h2', 'h3', 'h4'])[:12]:
                    h_text = h.get_text().strip()
                    h_text = re.sub(r'Edit.*?$', '', h_text).strip()
                    
                    if (h_text and h_text != title and len(h_text) > 2 and len(h_text) < 100 and
                        not re.match(r'^Version|^Edit|^Contribute', h_text)):
                        headings.append(h_text)
            
            # Size control with better limits
            max_content = 35000
            max_html = 30000
            
            if len(content_text) > max_content:
                content_text = content_text[:max_content] + '...'
            if len(content_html) > max_html:
                content_html = content_html[:max_html] + '...'
            
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

    def get_optimal_docs_area(self, file_path, title, content):
        """Get optimal docs_area for better ranking"""
        path_str = str(file_path).lower()
        title_lower = title.lower()
        content_lower = content.lower()[:2000]
        
        # Strategic docs_area mapping for better ranking
        
        # High-priority SQL commands
        if any(term in title_lower for term in ['delete', 'insert', 'select', 'update', 'alter', 'create']):
            return 'reference.sql'
        
        # Getting started and learning content
        if (any(term in path_str for term in ['learn', 'tutorial', 'getting-start', 'quickstart']) or
            any(term in title_lower for term in ['learn', 'tutorial', 'getting started', 'overview'])):
            return 'get-started'
        
        # Development and data manipulation
        if (any(term in path_str for term in ['query-data', 'insert-data', 'update-data']) or
            any(term in title_lower for term in ['query data', 'insert data', 'update data'])):
            return 'develop'
        
        # Connection and deployment
        if (any(term in path_str for term in ['connect', 'deploy', 'kubernetes']) or
            any(term in title_lower for term in ['connect', 'deploy', 'kubernetes'])):
            return 'deploy'
        
        # CockroachCloud specific
        if 'cockroachcloud' in path_str:
            return 'cockroachcloud'
        
        # Management operations
        if (any(term in path_str for term in ['backup', 'restore', 'upgrade', 'monitor']) or
            any(term in title_lower for term in ['backup', 'restore', 'upgrade', 'monitor'])):
            return 'manage'
        
        # Security
        if (any(term in path_str for term in ['auth', 'ldap', 'sso', 'security', 'certificate']) or
            any(term in title_lower for term in ['authentication', 'ldap', 'sso', 'security'])):
            return 'secure'
        
        # Performance and optimization
        if (any(term in path_str for term in ['performance', 'optimize', 'tuning']) or
            any(term in title_lower for term in ['performance', 'optimization', 'best practices'])):
            return 'develop'
        
        # Reference documentation
        if (any(term in path_str for term in ['reference', 'sql', 'cluster-settings']) or
            any(term in title_lower for term in ['reference', 'settings', 'configuration'])):
            return 'reference'
        
        # Default
        return 'reference'

    def create_optimized_record(self, file_path):
        """Create optimized record for better ranking"""
        
        full_path = self.site_path / file_path
        
        if not full_path.exists():
            return None
        
        # Extract content
        content_data = self.extract_enhanced_content(full_path)
        if not content_data:
            return None
        
        # Get optimal docs_area
        docs_area = self.get_optimal_docs_area(
            file_path,
            content_data['title'],
            content_data['content']
        )
        
        # Version handling
        version = 'v25.3'
        parts = Path(file_path).parts
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # URL generation
        canonical = f"/{file_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{file_path}"
        
        # Enhanced excerpts for better ranking
        summary = content_data['summary']
        
        # Create richer excerpt HTML
        excerpt_html = f"<p>{summary}</p>"
        
        # Look for code examples or structured content
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        first_content = ""
        
        for elem in soup.find_all(['p', 'div', 'pre'])[:2]:
            elem_text = elem.get_text().strip()
            if len(elem_text) > 50 and not re.match(r'^Version|^Contribute', elem_text):
                first_content = str(elem)[:2000]
                break
        
        if first_content:
            excerpt_html = first_content
        
        # Object ID
        object_id = hashlib.md5(f"{content_data['title']}_{file_path}".encode()).hexdigest()
        
        # Create optimized record
        record = {
            'objectID': object_id,
            'title': content_data['title'],
            'content': content_data['content'],
            'html': content_data['html'],
            'summary': summary,
            'url': full_url,
            'canonical': canonical,
            'type': 'page',
            'version': version,
            'doc_type': 'cockroachdb',
            'docs_area': docs_area,
            'slug': Path(file_path).stem,
            'last_modified_at': '29-Aug-25',
            'excerpt_html': excerpt_html,
            'excerpt_text': summary,
            'headings': content_data['headings'],
            'tags': [],
            'categories': []
        }
        
        # Size optimization
        record_size = len(json.dumps(record).encode('utf-8'))
        if record_size > 45000:
            record['content'] = record['content'][:18000] + '...'
            record['html'] = record['html'][:12000] + '...'
            if len(record['excerpt_html']) > 1500:
                record['excerpt_html'] = record['excerpt_html'][:1500] + '...'
        
        return record

    def get_production_paths_comprehensive(self):
        """Get comprehensive production paths"""
        logger.info("📁 Getting comprehensive production paths...")
        
        paths = set()
        
        # Get more comprehensive coverage
        for page in range(20):  # Increased from 10
            try:
                results = self.prod_index.search("", {
                    "hitsPerPage": 1000,
                    "page": page,
                    "attributesToRetrieve": ["url"]
                })
                
                if not results['hits']:
                    break
                
                for hit in results['hits']:
                    url = hit.get('url', '')
                    if url and '/docs/' in url:
                        path = url.split('/docs/')[-1]
                        paths.add(path)
                
                if len(results['hits']) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error getting paths: {e}")
                break
        
        logger.info(f"✅ Found {len(paths)} comprehensive production paths")
        return paths

    def reindex_for_90_percent(self):
        """Comprehensive reindex targeting 90% similarity"""
        logger.info("🎯 COMPREHENSIVE REINDEX FOR 90% TARGET")
        
        # Get comprehensive production paths
        production_paths = self.get_production_paths_comprehensive()
        
        # Process all HTML files
        all_files = list(self.site_path.rglob('*.html'))
        logger.info(f"📁 Processing {len(all_files)} files against {len(production_paths)} production paths")
        
        records = []
        skipped = 0
        
        for i, html_file in enumerate(all_files):
            file_path = Path(html_file)
            
            try:
                rel_path = file_path.relative_to(self.site_path)
                
                # Include if in production
                if str(rel_path) in production_paths:
                    record = self.create_optimized_record(rel_path)
                    if record:
                        records.append(record)
                    else:
                        skipped += 1
                else:
                    skipped += 1
                
            except ValueError:
                skipped += 1
                continue
            
            if (i + 1) % 1000 == 0:
                logger.info(f"   Processed {i + 1}/{len(all_files)} ({len(records)} valid, {skipped} skipped)")
        
        logger.info(f"📝 Created {len(records)} optimized records for 90% target")
        
        # Clear and reindex completely
        self.stage_index.clear_objects()
        logger.info("🧹 Cleared stage index for complete rebuild")
        
        # Upload in optimized batches
        batch_size = 100
        uploaded = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                self.stage_index.save_objects(batch)
                uploaded += len(batch)
                
                if uploaded % 500 == 0:
                    logger.info(f"📤 Uploaded {uploaded}/{len(records)}")
                    
            except Exception as e:
                logger.error(f"Error uploading batch: {e}")
                # Try individual uploads for failed batch
                for record in batch:
                    try:
                        self.stage_index.save_objects([record])
                        uploaded += 1
                    except:
                        pass
        
        logger.info(f"✅ Comprehensive reindex complete: {uploaded} records")
        return uploaded

    def test_90_percent_achievement(self):
        """Test if we achieved 90% target"""
        logger.info("🔍 TESTING 90% TARGET ACHIEVEMENT")
        
        import time
        time.sleep(45)  # Longer wait for comprehensive indexing
        
        # Test all queries
        test_queries = [
            'backup', 'authentication', 'select', 'insert', 'changefeed', 
            'cluster', 'troubleshooting', 'update', 'index', 'join', 'transaction',
            'delete', 'monitoring', 'performance', 'security', 'replication',
            'getting started', 'alter table', 'create table'
        ]
        
        results = {}
        total_similarity = 0
        queries_90_plus = 0
        
        for query in test_queries:
            try:
                prod = self.prod_index.search(query, {"hitsPerPage": 5})
                stage = self.stage_index.search(query, {"hitsPerPage": 5})
                
                prod_titles = [hit['title'] for hit in prod['hits']]
                stage_titles = [hit['title'] for hit in stage['hits']]
                
                matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = matches / len(prod_titles) * 100 if prod_titles else 0
                
                results[query] = similarity
                total_similarity += similarity
                
                if similarity >= 90:
                    queries_90_plus += 1
                
                status = "🎉" if similarity >= 90 else "✅" if similarity >= 80 else "🔶" if similarity >= 70 else "⚠️"
                logger.info(f"{status} '{query}': {similarity:.0f}% ({matches}/5)")
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")
        
        avg_similarity = total_similarity / len(test_queries) if test_queries else 0
        success = avg_similarity >= 90
        
        logger.info(f"\n🎯 90% TARGET RESULTS:")
        logger.info(f"   Average similarity: {avg_similarity:.1f}%")
        logger.info(f"   Target: 90%")
        logger.info(f"   Queries ≥90%: {queries_90_plus}/{len(test_queries)}")
        
        if success:
            logger.info("🎉 SUCCESS: 90% TARGET ACHIEVED!")
        else:
            gap = 90 - avg_similarity
            logger.info(f"📊 Gap remaining: {gap:.1f}%")
        
        return results, avg_similarity, success

def main():
    """Run comprehensive 90% achievement fix"""
    try:
        achiever = Achieve90Percent()
        
        logger.info("🚀 TARGETING 90% SIMILARITY")
        
        # Comprehensive reindex
        record_count = achiever.reindex_for_90_percent()
        
        # Test 90% achievement
        results, avg_sim, success = achiever.test_90_percent_achievement()
        
        logger.info(f"\n✅ 90% TARGET ATTEMPT COMPLETE:")
        logger.info(f"   Records: {record_count}")
        logger.info(f"   Average similarity: {avg_sim:.1f}%")
        logger.info(f"   90% Target: {'ACHIEVED' if success else 'NOT YET'}")
        
    except Exception as e:
        logger.error(f"❌ 90% target attempt failed: {e}")

if __name__ == '__main__':
    main()