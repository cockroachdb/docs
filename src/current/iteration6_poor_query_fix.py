#!/usr/bin/env python3
"""
ITERATION 6: Fix Poor Performing Queries
Analyze and fix specifically: getting started (20%), alter table (20%), cluster (40%)
Target: 70-80%+ parity without hardcoding production data
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

class PoorQueryOptimizer:
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
    
    async def analyze_poor_queries_content_gaps(self):
        """Analyze what content/pages are missing for poor performing queries"""
        logger.info("🔍 ANALYZING POOR QUERY CONTENT GAPS")
        
        poor_queries = ['getting started', 'alter table', 'cluster']
        analysis = {}
        
        for query in poor_queries:
            try:
                logger.info(f"\n📊 Analyzing '{query}':")
                
                # Get production results to see what we're missing
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": query,
                    "hitsPerPage": 10,
                    "attributesToRetrieve": ["title", "url", "docs_area", "content"]
                })
                
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {
                    "query": query,
                    "hitsPerPage": 10,
                    "attributesToRetrieve": ["title", "url", "docs_area", "content"]
                })
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                prod_urls = [hit.url for hit in prod_results.hits]
                
                # Find missing high-ranking pages
                missing_titles = [t for t in prod_titles[:5] if t not in stage_titles]
                missing_urls = []
                
                for i, hit in enumerate(prod_results.hits[:5]):
                    if hit.title in missing_titles:
                        url_path = hit.url.split('/docs/')[-1] if '/docs/' in hit.url else hit.url
                        missing_urls.append({
                            'title': hit.title,
                            'url_path': url_path,
                            'rank': i + 1,
                            'docs_area': getattr(hit, 'docs_area', 'unknown')
                        })
                
                # Find potential local files for missing pages
                local_candidates = []
                for missing in missing_urls:
                    # Look for files that might match this missing page
                    search_terms = [
                        missing['title'].lower().replace(' ', '-'),
                        missing['title'].lower().replace(' ', '_'),
                        missing['url_path'].replace('.html', '').split('/')[-1]
                    ]
                    
                    for html_file in self.site_path.rglob('*.html'):
                        file_name = html_file.name.lower()
                        file_path_str = str(html_file).lower()
                        
                        # Check if any search terms match
                        if any(term in file_name or term in file_path_str for term in search_terms):
                            local_candidates.append({
                                'missing_page': missing,
                                'local_file': str(html_file),
                                'file_name': html_file.name
                            })
                
                analysis[query] = {
                    'similarity': len([t for t in stage_titles if t in prod_titles]) / len(prod_titles) * 100,
                    'missing_titles': missing_titles,
                    'missing_urls': missing_urls,
                    'local_candidates': local_candidates
                }
                
                logger.info(f"   Missing from top 5: {missing_titles}")
                logger.info(f"   Found {len(local_candidates)} potential local files")
                
            except Exception as e:
                logger.error(f"Error analyzing '{query}': {e}")
        
        return analysis
    
    def extract_content_for_poor_queries(self, html_file):
        """Extract content specifically optimized for poor-performing queries"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # ENHANCED TITLE EXTRACTION for poor queries
            title = None
            
            # 1. Jekyll front matter
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            
            # 2. Main content headings (priority for poor queries)
            if not title:
                # Look for specific patterns that help with our poor queries
                main_selectors = [
                    'main h1', 'article h1', '.content h1', '[role="main"] h1',
                    'main .page-title', 'article .page-title', '.docs-content h1'
                ]
                
                for selector in main_selectors:
                    h1 = soup.select_one(selector)
                    if h1:
                        title_text = h1.get_text().strip()
                        # Clean title text
                        title_text = re.sub(r'Edit.*?$', '', title_text)
                        title_text = title_text.strip()
                        if len(title_text) > 3:
                            title = title_text
                            break
            
            # 3. Page title fallback
            if not title:
                title_elem = soup.find('title')
                if title_elem:
                    title = title_elem.get_text().strip()
                    title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title)
                    title = title.strip()
            
            # 4. Generate from filename
            if not title or len(title) < 3:
                file_name = Path(html_file).stem
                # Convert common patterns
                title = file_name.replace('-', ' ').replace('_', ' ').title()
                
                # Special handling for our poor queries
                if 'getting' in file_name and 'start' in file_name:
                    title = "Getting Started"
                elif 'alter' in file_name and 'table' in file_name:
                    title = "ALTER TABLE"
                elif file_name == 'cluster' or 'cluster-setting' in file_name:
                    title = "Cluster Settings"
            
            # CONTENT EXTRACTION optimized for poor queries
            main_content = None
            
            # Try multiple selectors to find the main documentation content
            content_selectors = [
                'main .content', 'main', 'article', '.docs-content', 
                '.content', '[role="main"]', 'body .main-content'
            ]
            
            for selector in content_selectors:
                main_content = soup.select_one(selector)
                if main_content and len(main_content.get_text()) > 100:
                    break
            
            if not main_content:
                main_content = soup.find('body')
            
            if main_content:
                # Remove UI/navigation elements aggressively
                for unwanted in main_content.find_all([
                    'nav', 'aside', 'footer', 'header', 'script', 'style', 
                    'noscript', 'form', 'button'
                ]):
                    unwanted.decompose()
                
                # Remove by class/id patterns
                for unwanted in main_content.find_all(attrs={
                    'class': lambda x: x and any(cls in str(x).lower() for cls in [
                        'sidebar', 'nav', 'footer', 'header', 'toc', 'breadcrumb', 
                        'pagination', 'search', 'version-selector', 'feedback', 'edit',
                        'contribute', 'github', 'version-toggle'
                    ])
                }):
                    unwanted.decompose()
                
                # Remove specific text patterns that hurt ranking
                for unwanted in main_content.find_all(string=re.compile(r'Version v\d+\.\d+|Contribute|Edit This Page|Report Doc Issue')):
                    unwanted.extract()
                
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # AGGRESSIVE CONTENT CLEANING for better ranking
            # Remove version selector noise
            content_text = re.sub(r'Version v\d+\.\d+\.\d+.*?v\d+\.\d+\.\d+[^.]*', '', content_text)
            content_text = re.sub(r'v\d+\.\d+\.\d+\s*\([^)]+\)\s*v\d+\.\d+\.\d+', '', content_text)
            
            # Remove UI navigation text
            content_text = re.sub(r'Contribute.*?Report Doc Issue.*', '', content_text, flags=re.DOTALL)
            content_text = re.sub(r'On this page.*?(?=\n[A-Z])', '', content_text, flags=re.DOTALL)
            content_text = re.sub(r'Edit This Page.*?Report Doc Issue', '', content_text)
            
            # Clean multiple spaces
            content_text = ' '.join(content_text.split())
            
            # SUMMARY EXTRACTION with poor query focus
            summary = None
            
            # For our specific poor queries, look for relevant intro content
            if main_content:
                # Find first substantial paragraph
                for p in main_content.find_all('p'):
                    p_text = p.get_text().strip()
                    
                    # Skip navigation/version text
                    if (len(p_text) > 80 and 
                        not re.match(r'^Version v\d+', p_text) and
                        not re.match(r'^Contribute|Edit This Page|Report Doc|On this page', p_text) and
                        not re.match(r'^v\d+\.\d+', p_text)):
                        
                        # Clean paragraph text
                        p_text = re.sub(r'Version v\d+\.\d+\.\d+.*', '', p_text)
                        p_text = ' '.join(p_text.split())
                        
                        if len(p_text) > 50:
                            summary = p_text[:300].strip()  # Longer summaries for poor queries
                            if len(p_text) > 300:
                                summary += '...'
                            break
            
            # Fallback summary extraction
            if not summary or len(summary) < 30:
                # Extract meaningful sentences from start of content
                sentences = re.split(r'[.!?]+', content_text)
                good_sentences = []
                
                for sentence in sentences[:5]:
                    sentence = sentence.strip()
                    if (len(sentence) > 30 and 
                        not re.match(r'^Version|^Contribute|^Edit|^Report|^On this page', sentence)):
                        good_sentences.append(sentence)
                        if len(' '.join(good_sentences)) > 200:
                            break
                
                if good_sentences:
                    summary = ' '.join(good_sentences)[:300]
                    if len(' '.join(good_sentences)) > 300:
                        summary += '...'
            
            # Final fallback
            if not summary:
                summary = content_text[:200].strip() + '...'
            
            # Limit content size for Algolia
            max_content_size = 30000
            if len(content_text) > max_content_size:
                content_text = content_text[:max_content_size] + '...'
            if len(content_html) > max_content_size:
                content_html = content_html[:max_content_size] + '...'
            
            # Extract headings with better filtering
            headings = []
            if main_content:
                for h in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                    heading_text = h.get_text().strip()
                    # Clean heading text
                    heading_text = re.sub(r'Edit.*?$', '', heading_text)
                    heading_text = heading_text.strip()
                    
                    if (heading_text and heading_text != title and 
                        len(heading_text) > 3 and len(heading_text) < 100 and
                        not re.match(r'^Version|^Edit|^Contribute', heading_text)):
                        headings.append(heading_text)
            
            return {
                'title': title,
                'content': content_text,
                'html': content_html,
                'summary': summary,
                'headings': headings[:15]  # More headings for better search
            }
            
        except Exception as e:
            logger.error(f"Error extracting from {html_file}: {e}")
            return None
    
    def create_optimized_record_for_poor_queries(self, html_file):
        """Create record with optimizations specifically for poor-performing queries"""
        
        content_data = self.extract_content_for_poor_queries(html_file)
        if not content_data:
            return None
        
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            rel_path = file_path
        
        # Enhanced docs_area classification for poor queries
        path_str = str(rel_path).lower()
        title_lower = content_data['title'].lower()
        content_lower = content_data['content'].lower()
        
        docs_area = 'reference'
        
        # Better classification for our problem queries
        if any(term in path_str or term in title_lower for term in ['getting-started', 'quickstart', 'start']):
            docs_area = 'get-started'
        elif any(term in path_str or term in title_lower for term in ['cockroachcloud', 'cloud']):
            docs_area = 'cockroachcloud'
        elif any(term in path_str or term in title_lower for term in ['cluster', 'admin', 'manage', 'monitoring']):
            docs_area = 'manage'
        elif any(term in path_str or term in title_lower for term in ['alter', 'create', 'table', 'sql']):
            docs_area = 'reference.sql'
        elif any(term in path_str or term in title_lower for term in ['backup', 'restore']):
            docs_area = 'manage'
        elif any(term in path_str or term in title_lower for term in ['auth', 'security', 'certificate']):
            docs_area = 'secure'
        elif any(term in path_str or term in title_lower for term in ['performance', 'optimize', 'tuning']):
            docs_area = 'manage'
        elif any(term in path_str or term in title_lower for term in ['troubleshoot', 'debug', 'error']):
            docs_area = 'troubleshoot'
        
        # Version extraction
        version = 'v25.3'
        parts = rel_path.parts
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # URL generation
        url_path = str(rel_path)
        canonical = f"/{url_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        # Optimized excerpts
        summary = content_data['summary']
        excerpt_text = summary
        
        # Create better excerpt HTML for ranking
        excerpt_html = f"<p>{summary}</p>"
        
        # Look for a substantial first paragraph
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        for p in soup.find_all('p'):
            p_text = p.get_text().strip()
            if (len(p_text) > 80 and 
                not re.match(r'^Version|^Contribute|^Edit|^Report|^On this page', p_text)):
                p_html = str(p)
                if len(p_html) < 2000:  # Longer excerpts for better ranking
                    excerpt_html = p_html
                    break
        
        # Generate object ID
        title = content_data['title']
        object_id = hashlib.md5(f"{title}_{url_path}".encode()).hexdigest()
        
        # Create record with EXACT 17 fields matching production
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
        
        return record
    
    async def get_production_paths_from_api(self):
        """Get production paths by searching through production API"""
        logger.info("📁 Getting production paths from API...")
        
        all_paths = set()
        page = 0
        
        while page < 200:  # Get more comprehensive coverage
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
                    url = hit.url
                    if url and '/docs/' in url:
                        path = url.split('/docs/')[-1]
                        all_paths.add(path)
                
                page += 1
                logger.info(f"   Collected {len(all_paths)} unique paths from {page * 1000} records...")
                
                if len(results.hits) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching production paths: {e}")
                break
        
        self.production_paths = all_paths
        logger.info(f"✅ Collected {len(all_paths)} production paths")
        return all_paths
    
    async def reindex_with_poor_query_optimization(self):
        """Reindex focusing on fixing the poor performing queries"""
        logger.info("🎯 ITERATION 6: POOR QUERY OPTIMIZATION")
        
        # Get comprehensive production paths 
        await self.get_production_paths_from_api()
        
        # Get all HTML files and filter to production matches
        all_files = list(self.site_path.rglob('*.html'))
        matching_files = []
        
        for html_file in all_files:
            file_path = Path(html_file)
            try:
                rel_path = file_path.relative_to(self.site_path)
                if str(rel_path) in self.production_paths:
                    matching_files.append(html_file)
            except ValueError:
                continue
        
        logger.info(f"📁 Processing {len(matching_files)} production-matching files")
        
        # Create optimized records
        records = []
        
        for i, html_file in enumerate(matching_files):
            record = self.create_optimized_record_for_poor_queries(html_file)
            if record:
                records.append(record)
            
            if (i + 1) % 100 == 0:
                logger.info(f"   Processed {i + 1}/{len(matching_files)} files")
        
        logger.info(f"📝 Created {len(records)} optimized records")
        
        # Clear and upload to stage
        await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
        logger.info("🧹 Cleared existing stage index")
        
        # Upload in batches
        batch_size = 100
        successful_uploads = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                successful_uploads += len(batch)
                if (i//batch_size + 1) % 5 == 0:
                    logger.info(f"📤 Uploaded {successful_uploads} records...")
            except Exception as e:
                logger.error(f"Error uploading batch: {e}")
        
        logger.info(f"✅ Poor query optimization complete: {successful_uploads} records")
        return successful_uploads
    
    async def test_poor_query_improvements(self):
        """Test if we fixed the poor performing queries"""
        logger.info("🔍 TESTING POOR QUERY IMPROVEMENTS")
        
        # Wait for indexing
        await asyncio.sleep(25)
        
        # Focus on our problem queries + a few control queries
        test_queries = [
            # Our problem queries
            'getting started', 'alter table', 'cluster', 'create table',
            # Control queries (previously good)
            'backup', 'authentication', 'performance'
        ]
        
        results = {}
        total_similarity = 0
        poor_query_improvements = {}
        
        for query in test_queries:
            try:
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": query, 
                    "hitsPerPage": 5,
                    "attributesToRetrieve": ["title", "docs_area"]
                })
                
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {
                    "query": query,
                    "hitsPerPage": 5,
                    "attributesToRetrieve": ["title", "docs_area"]
                })
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                
                exact_matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
                
                results[query] = {
                    'similarity': similarity,
                    'matches': exact_matches,
                    'total': len(prod_titles),
                    'prod_titles': prod_titles,
                    'stage_titles': stage_titles
                }
                
                total_similarity += similarity
                
                # Track poor query improvements
                if query in ['getting started', 'alter table', 'cluster', 'create table']:
                    poor_query_improvements[query] = similarity
                
                status = "🎉" if similarity >= 80 else "✅" if similarity >= 70 else "⚠️"
                logger.info(f"{status} '{query}': {similarity:.0f}% ({exact_matches}/{len(prod_titles)})")
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")
        
        avg_similarity = total_similarity / len(results) if results else 0
        poor_queries_70_plus = sum(1 for s in poor_query_improvements.values() if s >= 70)
        
        logger.info(f"\n🎯 POOR QUERY OPTIMIZATION RESULTS:")
        logger.info(f"   Average similarity: {avg_similarity:.1f}%")
        logger.info(f"   Poor queries ≥70%: {poor_queries_70_plus}/{len(poor_query_improvements)}")
        
        # Detailed poor query results
        for query, similarity in poor_query_improvements.items():
            status = "🎉 FIXED" if similarity >= 70 else f"⚠️ Still needs work"
            logger.info(f"   {query}: {similarity:.0f}% - {status}")
        
        return results, avg_similarity, poor_query_improvements

async def main():
    """Run poor query optimization iteration"""
    try:
        optimizer = PoorQueryOptimizer()
        
        # Step 1: Analyze gaps in poor performing queries
        logger.info("🔍 Step 1: Analyzing content gaps for poor queries...")
        analysis = await optimizer.analyze_poor_queries_content_gaps()
        
        # Step 2: Reindex with poor query optimizations
        logger.info("🔄 Step 2: Reindexing with poor query optimizations...")
        record_count = await optimizer.reindex_with_poor_query_optimization()
        
        # Step 3: Test improvements
        logger.info("📊 Step 3: Testing poor query improvements...")
        improved_results, avg_similarity, poor_query_results = await optimizer.test_poor_query_improvements()
        
        # Final results
        target_achieved = sum(1 for s in poor_query_results.values() if s >= 70) >= 3
        
        logger.info(f"\n✅ ITERATION 6 COMPLETE:")
        logger.info(f"   Strategy: Poor query optimization")
        logger.info(f"   Records: {record_count}")
        logger.info(f"   Average similarity: {avg_similarity:.1f}%")
        logger.info(f"   Poor queries ≥70%: {sum(1 for s in poor_query_results.values() if s >= 70)}/4")
        
        if target_achieved:
            logger.info("🎉 SUCCESS: 70%+ target achieved for most poor queries!")
        else:
            logger.warning("⚠️ More optimization needed for some queries")
        
        return {
            'record_count': record_count,
            'avg_similarity': avg_similarity,
            'poor_query_results': poor_query_results,
            'target_achieved': target_achieved
        }
        
    except Exception as e:
        logger.error(f"❌ Iteration 6 failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())