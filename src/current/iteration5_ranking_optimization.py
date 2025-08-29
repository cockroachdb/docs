#!/usr/bin/env python3
"""
ITERATION 5: Fix Poor Performing Queries
Target 70-80%+ parity by analyzing and fixing specific ranking issues
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

class RankingOptimizer:
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
    
    async def analyze_poor_performing_queries(self):
        """Analyze what's wrong with poorly performing queries"""
        logger.info("🔍 ANALYZING POOR PERFORMING QUERIES")
        
        poor_queries = ['getting started', 'alter table', 'cluster', 'create table', 'cockroachcloud']
        
        analysis = {}
        
        for query in poor_queries:
            try:
                logger.info(f"\n📊 Analyzing '{query}':")
                
                # Get detailed results from both
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": query,
                    "hitsPerPage": 5,
                    "attributesToRetrieve": ["title", "content", "summary", "docs_area", "url"]
                })
                
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {
                    "query": query,
                    "hitsPerPage": 5,
                    "attributesToRetrieve": ["title", "content", "summary", "docs_area", "url"]
                })
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                
                # Find missing titles and analyze why
                missing_titles = [t for t in prod_titles if t not in stage_titles]
                
                logger.info(f"   Missing from stage: {missing_titles}")
                
                # Analyze production record characteristics
                prod_analysis = {}
                for i, hit in enumerate(prod_results.hits):
                    hit_dict = hit.model_dump()
                    title = hit_dict.get('title', '')
                    content = hit_dict.get('content', '')
                    docs_area = hit_dict.get('docs_area', '')
                    
                    # Analyze content characteristics
                    query_in_title = query.lower() in title.lower()
                    query_in_content = query.lower() in content.lower()[:500]
                    content_length = len(content)
                    
                    prod_analysis[title] = {
                        'docs_area': docs_area,
                        'query_in_title': query_in_title,
                        'query_in_content': query_in_content,
                        'content_length': content_length,
                        'rank': i + 1
                    }
                
                analysis[query] = {
                    'prod_titles': prod_titles,
                    'stage_titles': stage_titles,
                    'missing_titles': missing_titles,
                    'prod_analysis': prod_analysis
                }
                
                # Log insights
                for missing in missing_titles[:2]:  # Top 2 missing
                    if missing in prod_analysis:
                        details = prod_analysis[missing]
                        logger.info(f"   Missing '{missing}': docs_area={details['docs_area']}, query_in_title={details['query_in_title']}")
                
            except Exception as e:
                logger.error(f"Error analyzing '{query}': {e}")
        
        return analysis
    
    async def get_production_paths_detailed(self):
        """Get production paths with detailed analysis"""
        logger.info("📁 Getting production paths for optimization...")
        
        all_paths = {}  # path -> record_info
        page = 0
        
        while page < 10:  # Limit to first 10K records for analysis
            try:
                results = await self.prod_client.search_single_index("cockroachcloud_docs", {
                    "query": "",
                    "hitsPerPage": 1000,
                    "page": page,
                    "attributesToRetrieve": ["url", "title", "docs_area"]
                })
                
                if not results.hits:
                    break
                
                for hit in results.hits:
                    hit_dict = hit.model_dump()
                    url = hit_dict.get('url', '')
                    title = hit_dict.get('title', '')
                    docs_area = hit_dict.get('docs_area', '')
                    
                    if url and '/docs/' in url:
                        path = url.split('/docs/')[-1]
                        all_paths[path] = {
                            'title': title,
                            'docs_area': docs_area,
                            'url': url
                        }
                
                page += 1
                logger.info(f"   Analyzed {page * 1000} records...")
                
                if len(results.hits) < 1000:
                    break
                    
            except Exception as e:
                logger.error(f"Error fetching production paths: {e}")
                break
        
        self.production_paths = set(all_paths.keys())
        logger.info(f"✅ Analyzed {len(all_paths)} production paths")
        return all_paths
    
    def extract_optimized_content_for_ranking(self, html_file, target_queries=None):
        """Extract content optimized for specific query performance"""
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            soup = BeautifulSoup(content, 'html.parser')
            
            # ENHANCED TITLE EXTRACTION
            title = None
            
            # 1. Look for Jekyll front matter title
            title_match = re.search(r'title:\s*["\']?([^"\'>\n]+)["\']?', content)
            if title_match:
                title = title_match.group(1).strip()
            
            # 2. Look for specific heading patterns that rank well
            if not title:
                # Try main content h1 first (most relevant)
                main_h1 = soup.select_one('main h1, article h1, .content h1, [role="main"] h1')
                if main_h1:
                    title = main_h1.get_text().strip()
                else:
                    # Try page title but clean it
                    title_elem = soup.find('title')
                    if title_elem:
                        title = title_elem.get_text().strip()
                        title = re.sub(r'\s*[\|\-]\s*CockroachDB.*', '', title)
                        title = title.strip()
            
            # 3. Last resort but make it good
            if not title or len(title) < 3:
                title = html_file.stem.replace('-', ' ').title()
            
            # ENHANCED CONTENT EXTRACTION FOR RANKING
            main_content = None
            
            # Try to find the actual documentation content
            for selector in [
                'main .content', 'main', 'article', '.docs-content', '.content',
                '[role="main"]', 'body .content'
            ]:
                main_content = soup.select_one(selector)
                if main_content and len(main_content.get_text()) > 100:
                    break
            
            if not main_content:
                main_content = soup.find('body')
            
            if main_content:
                # Remove UI elements more aggressively
                for unwanted in main_content.find_all([
                    'nav', 'aside', 'footer', 'header', 'script', 'style', 'noscript', 'form'
                ]):
                    unwanted.decompose()
                
                # Remove by class/id patterns
                for unwanted in main_content.find_all(attrs={
                    'class': lambda x: x and any(cls in str(x).lower() for cls in [
                        'sidebar', 'nav', 'footer', 'header', 'toc', 'breadcrumb', 
                        'pagination', 'search', 'version-selector', 'feedback', 'edit',
                        'contribute', 'github'
                    ])
                }):
                    unwanted.decompose()
                
                # Get clean text
                content_text = main_content.get_text(separator=' ')
                content_html = str(main_content)
            else:
                content_text = soup.get_text()
                content_html = str(soup)
            
            # AGGRESSIVE CONTENT CLEANING
            # Remove version selectors completely
            content_text = re.sub(r'Version v\d+\.\d+\.\d+.*?v\d+\.\d+\.\d+[^.]*', '', content_text)
            content_text = re.sub(r'v\d+\.\d+\.\d+\s*\([^)]+\)\s*v\d+\.\d+\.\d+', '', content_text)
            
            # Remove navigation and UI text
            content_text = re.sub(r'Contribute View Page Source Edit This Page Report Doc Issue.*', '', content_text)
            content_text = re.sub(r'On this page.*?(?=\n[A-Z])', '', content_text, flags=re.DOTALL)
            content_text = re.sub(r'Edit This Page.*?Report Doc Issue', '', content_text)
            content_text = re.sub(r'View Page Source.*?Edit This Page', '', content_text)
            
            # Clean multiple spaces and normalize
            content_text = ' '.join(content_text.split())
            
            # ENHANCED SUMMARY EXTRACTION
            summary = None
            
            # Look for first substantial paragraph in main content
            if main_content:
                # Try to find introduction paragraph
                for p in main_content.find_all('p'):
                    p_text = p.get_text().strip()
                    
                    # Skip navigation, version, short paragraphs
                    if (len(p_text) > 80 and 
                        not re.match(r'^Version v\d+', p_text) and
                        not re.match(r'^Contribute|Edit This Page|Report Doc|On this page', p_text) and
                        not re.match(r'^v\d+\.\d+', p_text)):
                        
                        # Clean the paragraph text
                        p_text = re.sub(r'Version v\d+\.\d+\.\d+.*', '', p_text)
                        p_text = ' '.join(p_text.split())
                        
                        if len(p_text) > 50:
                            summary = p_text[:200].strip()
                            if len(p_text) > 200:
                                summary += '...'
                            break
            
            # Fallback: extract from clean content start
            if not summary or len(summary) < 30:
                # Skip to first real sentence
                sentences = re.split(r'[.!?]+', content_text)
                for sentence in sentences:
                    sentence = sentence.strip()
                    if (len(sentence) > 30 and 
                        not re.match(r'^Version|^Contribute|^Edit|^Report', sentence)):
                        summary = sentence[:200]
                        if len(sentence) > 200:
                            summary += '...'
                        break
            
            # Final fallback
            if not summary:
                summary = content_text[:200].strip() + '...'
            
            # Truncate content for Algolia limits
            max_content_size = 30000
            if len(content_text) > max_content_size:
                content_text = content_text[:max_content_size] + '...'
            if len(content_html) > max_content_size:
                content_html = content_html[:max_content_size] + '...'
            
            # Extract meaningful headings
            headings = []
            if main_content:
                for h in main_content.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                    heading_text = h.get_text().strip()
                    # Clean heading text
                    heading_text = re.sub(r'Edit.*?$', '', heading_text)
                    heading_text = heading_text.strip()
                    
                    if (heading_text and heading_text != title and 
                        len(heading_text) > 3 and len(heading_text) < 100):
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
    
    def create_ranking_optimized_record(self, html_file):
        """Create record optimized for search ranking"""
        
        content_data = self.extract_optimized_content_for_ranking(html_file)
        if not content_data:
            return None
        
        file_path = Path(html_file)
        
        try:
            rel_path = file_path.relative_to(self.site_path)
        except ValueError:
            rel_path = file_path
        
        # Enhanced metadata extraction
        version = 'v25.3'
        parts = rel_path.parts
        for part in parts:
            if part.startswith('v') and '.' in part:
                version = part
                break
        
        # Enhanced docs_area classification
        docs_area = 'reference'
        path_str = str(rel_path).lower()
        
        if 'cockroachcloud' in path_str:
            docs_area = 'cockroachcloud'
        elif 'getting-started' in path_str or 'quickstart' in path_str:
            docs_area = 'get-started'
        elif any(sql_keyword in path_str for sql_keyword in ['sql', 'create', 'alter', 'select', 'backup', 'restore']):
            docs_area = 'reference.sql'
        elif any(ui_keyword in path_str for ui_keyword in ['admin-ui', 'ui-', 'monitoring', 'cluster']):
            docs_area = 'manage'
        elif 'troubleshoot' in path_str:
            docs_area = 'troubleshoot'
        elif 'migrate' in path_str or 'migration' in path_str:
            docs_area = 'migrate'
        
        # Generate URLs
        url_path = str(rel_path)
        canonical = f"/{url_path}"
        full_url = f"https://www.cockroachlabs.com/docs/{url_path}"
        
        # Use optimized summary
        summary = content_data['summary']
        excerpt_text = summary
        
        # Create optimized excerpt HTML
        soup = BeautifulSoup(content_data['html'], 'html.parser')
        excerpt_html = f"<p>{summary}</p>"
        
        # Look for a good first paragraph
        for p in soup.find_all('p'):
            p_text = p.get_text().strip()
            if (len(p_text) > 50 and 
                not re.match(r'^Version|^Contribute|^Edit', p_text)):
                p_html = str(p)
                if len(p_html) < 1000:
                    excerpt_html = p_html
                    break
        
        # Generate object ID
        title = content_data['title']
        object_id = hashlib.md5(f"{title}_{url_path}".encode()).hexdigest()
        
        # Create record with exact 17 fields
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
    
    async def reindex_with_ranking_optimization(self):
        """Reindex with ranking optimizations"""
        logger.info("🎯 ITERATION 5: RANKING OPTIMIZATION")
        
        # Get production paths
        prod_paths = await self.get_production_paths_detailed()
        self.production_paths = set(prod_paths.keys())
        
        # Get matching files
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
        
        # Process with ranking optimization
        records = []
        
        for i, html_file in enumerate(matching_files):
            record = self.create_ranking_optimized_record(html_file)
            if record:
                records.append(record)
            
            if (i + 1) % 100 == 0:
                logger.info(f"   Processed {i + 1}/{len(matching_files)} files")
        
        logger.info(f"📝 Created {len(records)} ranking-optimized records")
        
        # Clear and upload
        await self.stage_client.clear_objects(index_name="stage_cockroach_docs")
        logger.info("🧹 Cleared existing stage index")
        
        # Upload in batches
        batch_size = 50
        successful_uploads = 0
        
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            try:
                await self.stage_client.save_objects(index_name="stage_cockroach_docs", objects=batch)
                successful_uploads += len(batch)
                if (i//batch_size + 1) % 10 == 0:
                    logger.info(f"📤 Uploaded {successful_uploads} records...")
            except Exception as e:
                logger.error(f"Error uploading batch: {e}")
        
        logger.info(f"✅ Ranking optimization complete: {successful_uploads} records")
        return successful_uploads
    
    async def test_ranking_improvements(self):
        """Test if ranking optimization improved poor queries"""
        logger.info("🔍 TESTING RANKING IMPROVEMENTS")
        
        # Wait for indexing
        await asyncio.sleep(20)
        
        # Test the previously poor queries
        test_queries = ['getting started', 'alter table', 'cluster', 'create table', 'cockroachcloud']
        
        results = {}
        total_improvement = 0
        
        for query in test_queries:
            try:
                prod_results = await self.prod_client.search_single_index("cockroachcloud_docs", {"query": query, "hitsPerPage": 5})
                stage_results = await self.stage_client.search_single_index("stage_cockroach_docs", {"query": query, "hitsPerPage": 5})
                
                prod_titles = [hit.title for hit in prod_results.hits]
                stage_titles = [hit.title for hit in stage_results.hits]
                
                exact_matches = sum(1 for t in stage_titles if t in prod_titles)
                similarity = exact_matches / len(prod_titles) * 100 if prod_titles else 0
                
                results[query] = {
                    'similarity': similarity,
                    'matches': exact_matches,
                    'total': len(prod_titles)
                }
                
                total_improvement += similarity
                
                status = "🎉" if similarity >= 80 else "✅" if similarity >= 70 else "⚠️"
                logger.info(f"{status} '{query}': {similarity:.0f}% ({exact_matches}/{len(prod_titles)})")
                
            except Exception as e:
                logger.error(f"Error testing '{query}': {e}")
        
        avg_improvement = total_improvement / len(results) if results else 0
        improved_queries = sum(1 for r in results.values() if r['similarity'] >= 70)
        
        logger.info(f"\n🎯 RANKING OPTIMIZATION RESULTS:")
        logger.info(f"   Average similarity: {avg_improvement:.1f}%")
        logger.info(f"   Queries ≥70%: {improved_queries}/{len(results)}")
        
        return results, avg_improvement

async def main():
    """Run ranking optimization iteration"""
    try:
        optimizer = RankingOptimizer()
        
        # Step 1: Analyze current issues
        analysis = await optimizer.analyze_poor_performing_queries()
        
        # Step 2: Reindex with optimizations
        record_count = await optimizer.reindex_with_ranking_optimization()
        
        # Step 3: Test improvements
        improved_results, avg_similarity = await optimizer.test_ranking_improvements()
        
        logger.info(f"\n✅ ITERATION 5 COMPLETE:")
        logger.info(f"   Strategy: Ranking optimization for poor queries")
        logger.info(f"   Records: {record_count}")
        logger.info(f"   Average similarity: {avg_similarity:.1f}%")
        
        if avg_similarity >= 75:
            logger.info("🎉 SUCCESS: Target 70-80%+ achieved!")
        else:
            logger.warning("⚠️ More optimization needed")
        
    except Exception as e:
        logger.error(f"❌ Iteration 5 failed: {e}")
        raise

if __name__ == '__main__':
    asyncio.run(main())