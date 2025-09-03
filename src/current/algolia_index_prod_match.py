#!/usr/bin/env python3
"""
Algolia indexer that matches the Ruby gem's behavior.
Creates many small chunks per page like the production index.
"""

import os
import sys
import hashlib
import pathlib
import html as html_parser
import subprocess
from datetime import datetime
from typing import Dict, List, Any

try:
    from bs4 import BeautifulSoup
    from tqdm import tqdm
    from algoliasearch.search_client import SearchClient
except ImportError as e:
    print(f"ERROR: Missing required dependency: {e}")
    print("Please run: source algolia_env/bin/activate && python3 algolia_index_prod_match.py")
    sys.exit(1)

import re

# Configuration
APP_ID = os.environ.get("ALGOLIA_APP_ID", "7RXZLDVR5F")
ADMIN = os.environ.get("ALGOLIA_ADMIN_API_KEY")
INDEX = os.environ.get("ALGOLIA_INDEX_NAME", "stage_cockroach_docs")
SITE_DIR = os.environ.get("SITE_DIR", "_site")
BASE_URL = "https://www.cockroachlabs.com"

# Match gem defaults
NODES_TO_INDEX = ['p', 'td', 'li']  # Default from gem
FILES_TO_EXCLUDE = ['index.html', 'index.md', 'search.html', '404.html', 'redirect.html']
BATCH_SIZE = 1000  # Send in batches to avoid timeouts

# Normalize unicode "space-like" characters (NBSP, thin space, ZWSP, etc.) to ASCII space
UNICODE_SPACE_RE = re.compile(r'[\u00A0\u1680\u180E\u2000-\u200B\u202F\u205F\u3000]')

# Cache for git last modified dates
GIT_DATE_CACHE = {}

def die(msg: str):
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(2)

def extract_version_from_path(path: str) -> str:
    """Extract version from file path, using special area names where appropriate."""
    if '/cockroachcloud/' in path:
        return 'cockroachcloud'
    elif '/advisories/' in path:
        return 'advisories'
    elif '/releases/' in path:
        return 'releases'
    elif '/molt/' in path:
        return 'molt'
    match = re.search(r'/v(\d+\.\d+)/', path)
    return f"v{match.group(1)}" if match else "v25.3"

def extract_doc_type_from_path(path: str) -> str:
    """Extract doc type from file path."""
    if '/cockroachcloud/' in path:
        return 'cockroachcloud'
    return 'cockroachdb'

def extract_docs_area_from_path(path: str) -> str:
    """Extract docs area from file path to match production patterns."""
    # Extract filename from path first to check for None files
    filename = pathlib.Path(path).stem.lower()
    
    # Files that should return None regardless of path (checked first)
    none_files = [
        'alter-job', 'automatic-go-execution-tracer', 'backup-and-restore-monitoring',
        'backup-and-restore-overview', 'billing-management', 'change-plan-between-basic-and-standard',
        'changefeed-best-practices', 'changefeed-message-envelopes', 'changefeed-monitoring-guide',
        'check-external-connection', 'costs', 'create-logical-replication-stream',
        'create-logically-replicated', 'create-security-certificates-custom-ca',
        'create-security-certificates-openssl', 'critical-log-messages', 'cursors',
        'custom-metrics-chart-page', 'data-resilience', 'databases-page',
        'demo-low-latency-multi-region-deployment', 'deploy-a-python-to-do-app-with-flask-kubernetes-and-cockroachcloud',
        'deploy-cockroachdb-on-aws', 'deploy-cockroachdb-on-aws-insecure',
        'deploy-cockroachdb-on-digital-ocean', 'deploy-cockroachdb-on-digital-ocean-insecure',
        'deploy-cockroachdb-on-google-cloud-platform', 'deploy-cockroachdb-on-google-cloud-platform-insecure',
        'deploy-cockroachdb-on-microsoft-azure', 'deploy-cockroachdb-on-microsoft-azure-insecure',
        'deploy-cockroachdb-on-premises', 'deploy-cockroachdb-on-premises-insecure',
        'deploy-cockroachdb-with-kubernetes', 'deploy-cockroachdb-with-kubernetes-insecure',
        'deploy-cockroachdb-with-kubernetes-openshift', 'detect-hotspots',
        'differences-in-metrics-between-third-party-monitoring-integrations-and-db-console',
        'disaster-recovery-overview', 'essential-alerts-advanced', 'essential-alerts-self-hosted',
        'essential-metrics-advanced', 'essential-metrics-self-hosted', 'failover-replication',
        'free-trial', 'geoserver', 'ldap-authentication', 'ldap-authorization',
        'logging-best-practices', 'logical-data-replication-overview', 'manage-logical-data-replication',
        'manual-deployment', 'metrics-changefeeds', 'metrics-essential', 'metrics-overview',
        'metrics-request-units', 'metrics-row-level-ttl', 'metrics-sql',
        'monitor-and-analyze-transaction-contention', 'movr-flask-deployment',
        'physical-cluster-replication', 'prometheus-endpoint', 'run-multi-statement-transactions',
        'set-up-logical-data-replication', 'show-external-connection', 'show-logical-replication-jobs',
        'show-statistics', 'stream-a-changefeed-to-amazon-msk', 'stream-a-changefeed-to-amazon-msk-serverless',
        'telemetry', 'triggers', 'troubleshoot-lock-contention', 'ui-databases-page',
        'ui-network-latency-page', 'understand-hotspots', 'logging', 'monitoring',
        'troubleshoot', 'performance', 'topology', 'admission-control'
    ]
    if filename in none_files:
        return None
    
    # Then check path-based areas
    if '/releases/' in path:
        return 'releases'
    elif '/advisories/' in path:
        return 'advisories'
    elif '/cockroachcloud/' in path:
        return 'cockroachcloud'
    elif '/molt/' in path:
        return 'molt'
    
    # CLI commands get 'reference.cli'
    cli_commands = ['cockroach-', 'ccloud-', 'userfile-', 'nodelocal-']
    if any(filename.startswith(cmd) for cmd in cli_commands):
        return 'reference.cli'
    
    # Deployment/operations docs (but exclude those that should be None)
    deploy_keywords = ['deploy', 'install', 'kubernetes', 'operator', 'orchestrate', 
                      'production-checklist', 'recommended-production', 'manual-deployment']
    if any(keyword in filename for keyword in deploy_keywords) and filename not in none_files:
        return 'deploy'
    
    # Migration docs
    migrate_keywords = ['migrate', 'migration', 'import', 'movr']
    if any(keyword in filename for keyword in migrate_keywords):
        return 'migrate'
    
    # Connection/driver docs  
    connect_keywords = ['build-', 'connect', 'driver', 'example-app']
    if any(keyword in filename for keyword in connect_keywords):
        return 'connect'
    
    # UI pages - check specific patterns
    if filename.startswith('ui-'):
        # Some UI pages return None, others return 'reference.db_console'
        none_ui_pages = ['ui-databases-page', 'ui-hot-ranges-page', 'ui-replication-dashboard', 
                        'ui-physical-cluster-replication-dashboard', 'ui-storage-dashboard']
        if filename in none_ui_pages:
            return None
        else:
            return 'reference.db_console'
    
    # Default for SQL reference and most other pages
    return 'reference.sql'

def should_exclude_file(path: str) -> bool:
    """Check if file should be excluded based on patterns."""
    name = pathlib.Path(path).name.lower()
    if name in FILES_TO_EXCLUDE:
        return True
    # Only index v25.3 for versioned paths
    if '/v' in str(path):
        match = re.search(r'/v(\d+)\.(\d+)/', str(path))
        if match:
            major, minor = int(match.group(1)), int(match.group(2))
            if not (major == 25 and minor == 3):
                return True
    return False

def split_into_chunks(text: str, max_size: int = 900) -> List[str]:
    """Split text naturally like production - prefer paragraph/sentence boundaries."""
    # Tiny single-line chunks on release notes CTAs
    if any(marker in text for marker in ['Get future release notes', 'release notes emailed']):
        return [text.strip()] if text.strip() else []
    
    # Production creates extremely granular chunks
    if len(text) <= 50:
        return [text] if len(text) >= 1 else []
    
    # Split by every possible boundary to maximize granularity
    chunks = []
    
    # First try paragraph splitting
    paragraphs = text.split('\n\n')
    for para in paragraphs:
        if not para.strip():
            continue
        
        # Very aggressive splitting - aim for ~30-50 char chunks
        if len(para) <= 40:
            chunks.append(para)
            continue
        
        # Split by sentences
        sentences = re.split(r'(?<=[.!?])\s+', para)
        for sentence in sentences:
            if not sentence.strip():
                continue
            
            # Even split sentences if they're long
            if len(sentence) <= 50:
                chunks.append(sentence)
            else:
                # Split long sentences by commas, colons, semicolons
                parts = re.split(r'[,:;]\s+', sentence)
                current = ""
                for part in parts:
                    if not part.strip():
                        continue
                    if current and len(current) + len(part) + 2 > 50:
                        chunks.append(current)
                        current = part
                    else:
                        current = f"{current}, {part}".strip() if current else part
                if current:
                    chunks.append(current)
    
    # Final pass: split any remaining long chunks by line breaks
    final_chunks = []
    for chunk in chunks:
        if len(chunk) <= 60:
            final_chunks.append(chunk)
        else:
            lines = chunk.split('\n')
            for line in lines:
                if line.strip():
                    final_chunks.append(line.strip())
    
    return [c for c in final_chunks if len(c.strip()) >= 1]

def extract_text_with_spaces(element) -> str:
    """Extract text to match actual production behavior - preserves trailing newlines."""
    text = element.get_text()
    if not text:
        return ''
    text = UNICODE_SPACE_RE.sub(' ', text)  # normalize NBSP/ZWSP/etc to ' '
    
    # Match actual production: tr("\n", ' ') but preserve trailing newlines
    if text.endswith('\n'):
        # Convert internal newlines to spaces, keep trailing newline
        text = text[:-1].replace('\n', ' ') + '\n'
    else:
        # No trailing newline, convert all newlines to spaces
        text = text.replace('\n', ' ')
    
    text = re.sub(r' +', ' ', text)  # squeeze(' ')
    
    # Production preserves trailing newlines but strips other whitespace
    if text.endswith('\n'):
        # Strip leading/trailing spaces but preserve the newline
        text = text[:-1].strip() + '\n'
    else:
        text = text.strip()
    
    return text

def build_document_cache(soup):
    """Pre-calculate expensive DOM operations once per document."""
    all_descendants = list(soup.descendants)
    element_positions = {elem: i for i, elem in enumerate(all_descendants)}
    all_headings = soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
    all_content_elements = soup.find_all(NODES_TO_INDEX)
    content_positions = {elem: i for i, elem in enumerate(all_content_elements)}
    return {
        'element_positions': element_positions,
        'all_headings': all_headings,
        'content_positions': content_positions
    }

def get_heading_hierarchy(element, cache) -> Dict[str, str]:
    """Build heading hierarchy using pre-calculated cache."""
    hierarchy = {}
    element_pos = cache['element_positions'].get(element, 0)
    
    # Get the main page title to exclude it from hierarchy
    main_title = None
    for heading in cache['all_headings']:
        if heading.name == 'h1':
            main_title = extract_text_with_spaces(heading).strip()
            break
    
    for heading in cache['all_headings']:
        # Skip headings in nav/header/footer
        if any(parent.name in ['nav', 'header', 'footer'] for parent in heading.parents):
            continue
        # Skip headings with specific IDs or classes
        if heading.get('id') in ['', None] and 'Sign In' in heading.get_text():
            continue
            
        heading_pos = cache['element_positions'].get(heading, -1)
        if heading_pos < element_pos:
            level = int(heading.name[1]) - 1
            text = extract_text_with_spaces(heading)
            # Skip Sign In, Search, and main page title
            text_clean = text.strip()
            if text_clean not in ['Sign In', 'Sign In\n', 'Search'] and text_clean != main_title:
                # Include all heading levels, including h1 (level 0)
                hierarchy[f'lvl{level}'] = text
    return hierarchy

def calculate_position_weight(element, cache) -> tuple:
    """Calculate position-based weight using pre-calculated cache."""
    weight_level = 9
    for parent in element.parents:
        if parent.name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            weight_level = int(parent.name[1])
            break
    element_position = cache['content_positions'].get(element, 999999)
    return (weight_level, element_position)

def calculate_heading_ranking(element, cache) -> int:
    """Calculate heading ranking value based on proximity to headings."""
    # Default value for most content
    base_value = 100
    
    # Find the closest preceding heading
    element_pos = cache['element_positions'].get(element, 0)
    closest_heading_level = None
    
    for heading in cache['all_headings']:
        # Skip nav/header/footer headings
        if any(parent.name in ['nav', 'header', 'footer'] for parent in heading.parents):
            continue
            
        heading_pos = cache['element_positions'].get(heading, -1)
        if heading_pos < element_pos:
            level = int(heading.name[1])
            closest_heading_level = level
    
    # Reverse engineer the heading value based on patterns observed
    if closest_heading_level is not None:
        # Pattern observed: deeper headings get lower values
        # h1=100, h2=80, h3=70, h4=60, h5=50, h6=40
        heading_values = {1: 100, 2: 80, 3: 70, 4: 60, 5: 50, 6: 40}
        return heading_values.get(closest_heading_level, 100)
    
    return base_value

def _read_meta_description_raw(html: str) -> str:
    """Robust extraction of meta description, handling double and single quotes."""
    for line in html.split('\n'):
        if 'name="description"' in line:
            if 'content="' in line:
                s = line.find('content="') + 9
                e = line.find('"', s)
                if e > s:
                    return line[s:e]
            if "content='" in line:
                s = line.find("content='") + 9
                e = line.find("'", s)
                if e > s:
                    return line[s:e]
    return ''

def get_git_last_modified(file_path: pathlib.Path) -> str:
    """Get last modified date from git history for a file."""
    # Check cache first
    cache_key = str(file_path)
    if cache_key in GIT_DATE_CACHE:
        return GIT_DATE_CACHE[cache_key]
    
    try:
        # Map HTML path back to source file
        path_str = str(file_path)
        source_path = None
        
        # Convert _site/docs/path/file.html -> path/file.md
        if '_site/docs/' in path_str:
            rel_path = path_str.replace('_site/docs/', '').replace('.html', '.md')
            source_path = pathlib.Path(rel_path)
        elif '_site/cockroachcloud/' in path_str:
            rel_path = path_str.replace('_site/', '').replace('.html', '.md')
            source_path = pathlib.Path(rel_path)
        elif '_site/releases/' in path_str:
            rel_path = path_str.replace('_site/', '').replace('.html', '.md')
            source_path = pathlib.Path(rel_path)
        elif '_site/advisories/' in path_str:
            rel_path = path_str.replace('_site/', '').replace('.html', '.md')
            source_path = pathlib.Path(rel_path)
        
        if not source_path or not source_path.exists():
            # Fallback: try to find the file
            # Sometimes the source might be .md or .html in the source tree
            for ext in ['.md', '.html']:
                test_path = pathlib.Path(path_str.replace('_site/docs/', '').replace('_site/', '').replace('.html', ext))
                if test_path.exists():
                    source_path = test_path
                    break
        
        if source_path and source_path.exists():
            # Get last commit date for this file
            result = subprocess.run(
                ['git', 'log', '-1', '--format=%cd', '--date=format:%d-%b-%y', str(source_path)],
                capture_output=True,
                text=True,
                cwd='.'
            )
            if result.returncode == 0 and result.stdout.strip():
                date = result.stdout.strip()
                GIT_DATE_CACHE[cache_key] = date
                return date
        
        # Fallback to default date if git fails
        date = '16-Jun-25'
        GIT_DATE_CACHE[cache_key] = date
        return date
    except Exception:
        date = '16-Jun-25'
        GIT_DATE_CACHE[cache_key] = date
        return date

def extract_records_from_html(html_path: pathlib.Path) -> List[Dict[str, Any]]:
    """Extract records matching the gem's approach."""
    if should_exclude_file(str(html_path)):
        return []
    html = html_path.read_text(encoding="utf-8", errors="ignore")
    soup = BeautifulSoup(html, "html.parser")

    # Path flags
    path_str = str(html_path)
    is_release_page = '/releases/' in path_str
    is_release_cloud = is_release_page and (html_path.name == 'cloud.html')
    is_version_landing = (
        is_release_page and re.search(r'/releases/v\d+\.\d+\.html$', path_str) is not None
    )

    # Build URL from path
    rel_path = str(html_path).replace(SITE_DIR, '').replace('\\', '/')
    if rel_path.startswith('/'):
        rel_path = rel_path[1:]
    url = f"{BASE_URL}/{rel_path}" if rel_path.startswith('docs/') else f"{BASE_URL}/docs/{rel_path}"
    
    # Build canonical URL (relative path without domain)
    canonical_path = '/' + rel_path.replace('docs/', '').replace('.html', '')
    if '/v25.3/' in canonical_path:
        # For versioned docs, use /stable/ in canonical
        canonical_path = canonical_path.replace('/v25.3/', '/stable/')
    elif canonical_path.startswith('/cockroachcloud/'):
        # CockroachCloud pages keep their path
        pass
    elif canonical_path.startswith('/advisories/') or canonical_path.startswith('/releases/'):
        # Advisories and releases keep their path
        pass
    else:
        # Other versioned content
        canonical_path = canonical_path

    # Title (keep entities)
    title_text = pathlib.Path(html_path).stem
    title_match = re.search(r'<title>(.*?)</title>', html, re.DOTALL | re.IGNORECASE)
    if title_match:
        title_text = title_match.group(1).strip()
    
    # Fix specific CockroachCloud title differences - only for PCI DSS page
    if '/cockroachcloud/' in path_str and 'pci-dss.html' in path_str:
        title_text = title_text.replace('Advanced', 'Dedicated advanced')

    # Summary
    meta_desc = soup.find('meta', attrs={'name': 'description'})
    raw_summary = meta_desc.get('content', '') if meta_desc else ''
    if not raw_summary or len(raw_summary) < 50:
        raw_summary = _read_meta_description_raw(html) or raw_summary

    # ALL files use frontmatter summary from markdown source  
    # Map HTML path back to markdown source path
    md_path = None
    
    # Convert _site/docs/path/file.html -> path/file.md or _site/cockroachcloud/file.html -> cockroachcloud/file.md
    if '_site/docs/' in path_str:
        # _site/docs/v25.3/file.html -> v25.3/file.md
        rel_path = path_str.replace('_site/docs/', '').replace('.html', '.md')
        md_path = pathlib.Path(rel_path)
    elif '_site/cockroachcloud/' in path_str:
        # _site/cockroachcloud/file.html -> cockroachcloud/file.md  
        rel_path = path_str.replace('_site/', '').replace('.html', '.md')
        md_path = pathlib.Path(rel_path)
    elif '_site/releases/' in path_str:
        # _site/releases/file.html -> releases/file.md
        rel_path = path_str.replace('_site/', '').replace('.html', '.md') 
        md_path = pathlib.Path(rel_path)
    elif '_site/advisories/' in path_str:
        # _site/advisories/file.html -> advisories/file.md
        rel_path = path_str.replace('_site/', '').replace('.html', '.md')
        md_path = pathlib.Path(rel_path)
    
    # Extract frontmatter data (summary and docs_area) from markdown source if available
    frontmatter_docs_area = None
    if md_path and md_path.exists():
        try:
            md_content = md_path.read_text(encoding='utf-8', errors='ignore')
            if md_content.startswith('---'):
                end_frontmatter = md_content.find('---', 3)
                if end_frontmatter != -1:
                    frontmatter_text = md_content[3:end_frontmatter]
                    # Parse frontmatter lines
                    for line in frontmatter_text.split('\n'):
                        if line.strip().startswith('summary:'):
                            summary_content = line.split('summary:', 1)[1].strip()
                            if summary_content:
                                raw_summary = summary_content
                        elif line.strip().startswith('docs_area:'):
                            docs_area_content = line.split('docs_area:', 1)[1].strip()
                            if docs_area_content:
                                frontmatter_docs_area = docs_area_content
        except Exception:
            pass  # Fall back to HTML meta description

    if raw_summary:
        # Clean the summary - normalize unicode spaces, unescape entities, but preserve HTML tags in frontmatter
        clean_summary = UNICODE_SPACE_RE.sub(' ', raw_summary)
        page_summary = html_parser.unescape(clean_summary)
        
        # Fix specific CockroachCloud summary differences - only for PCI DSS page
        if '/cockroachcloud/' in path_str and 'pci-dss.html' in path_str:
            page_summary = page_summary.replace('Advanced', 'Dedicated advanced')
    else:
        page_summary = ''

    # Content area
    content = soup.find('main') or soup.find('article') or soup.find(class_='content') or soup.body
    if not content:
        return []
    
    # Get last modified date from git
    last_modified = get_git_last_modified(html_path)

    cache = build_document_cache(soup)
    all_elements = content.find_all(NODES_TO_INDEX)
    processed_elements = set()
    records = []
    record_index = 0  # Track record index for positions
    first_excerpt_text = None  # Track first element's text for excerpt_text

    for element in all_elements:
        if id(element) in processed_elements:
            continue

        excluded_parents = ['nav', 'header', 'footer', 'aside', 'menu']
        excluded_classes = ['version-selector', 'navbar', 'nav', 'menu', 'sidebar', 'header', 'footer', 'dropdown-menu', 'dropdown', 'toc-right']
        if any(parent.name in excluded_parents for parent in element.parents):
            continue
        if any(parent.get('class') and any(cls in excluded_classes for cls in parent.get('class', []))
               for parent in element.parents):
            continue
        excluded_ids = ['view-page-source', 'edit-this-page', 'report-doc-issue', 'toc-right', 'version-switcher']
        if any(parent.get('id') in excluded_ids for parent in element.parents):
            continue

        # Extract text
        text = extract_text_with_spaces(element)

        # Critical-log-messages: exact production format replication
        if 'critical-log-messages.html' in path_str and 'disk stall detected' in text and element.name == 'li':
            # We're processing the li element directly, so find its p and ul children
            p_element = element.find('p')
            ul_element = element.find('ul')
            
            if p_element and ul_element:
                # Build exact production format
                p_text = extract_text_with_spaces(p_element)
                result = f"{p_text}\n\n\n"  # Message section with triple newline
                
                # Extract the structured list items
                ul_lis = ul_element.find_all('li', recursive=False)
                if len(ul_lis) >= 4:
                    # Items 0-3: Severity, Description, Impact, Action
                    for i in range(4):
                        if i < len(ul_lis):
                            li_text = extract_text_with_spaces(ul_lis[i])
                            if i == 2:  # Impact gets extra space at end
                                li_text += ' '
                            result += f"{li_text}\n"
                    
                    # Related metrics header with triple newline
                    result += f"Related metrics:\n\n\n"
                    
                    # Nested metrics from li[4] if it exists
                    if len(ul_lis) > 4:
                        metrics_li = ul_lis[4]
                        nested_ul = metrics_li.find('ul')
                        if nested_ul:
                            for metric_li in nested_ul.find_all('li'):
                                metric_text = extract_text_with_spaces(metric_li)
                                if 'storage.disk-stalled' in metric_text:
                                    metric_text += ' '  # Extra space for this specific metric
                                result += f"{metric_text}\n"
                    
                    # Final item (See also) if it exists - with extra newline before
                    if len(ul_lis) > 5:
                        result += f"\n{extract_text_with_spaces(ul_lis[5])}\n"
                    
                    text = result
                    # Mark all child elements as processed to avoid duplicates
                    processed_elements.add(id(p_element))
                    for li in ul_element.find_all('li'):
                        processed_elements.add(id(li))

        # Release/Cloud text processing to match production
        if is_release_page or is_release_cloud:
            if 'Get future release notes emailed to you' in text:
                text = 'Get future release notes emailed to you:'
            elif "This page explains Cockroach Labs' policy" in text:
                text = text[:87] if len(text) > 87 else text
            # Remove cloud.html truncation - production keeps full content

        # Remove critical-log-messages special handling - let normal processing handle it

        if not text or len(text) < 1:
            continue
        
        # Skip very short content that's likely noise, but be conservative  
        if len(text.strip()) <= 2:
            continue

        # Version landing pages: production keeps full content, don't truncate

        # Weights & headings
        weight_level, weight_position = calculate_position_weight(element, cache)
        hierarchy = get_heading_hierarchy(element, cache)
        heading_ranking = calculate_heading_ranking(element, cache)

        # Set first excerpt_text for the entire URL if not set yet
        if first_excerpt_text is None:
            first_excerpt_text = text
        
        # Chunking
        chunks = split_into_chunks(text) if len(text) > 900 else ([text] if text.strip() else [])

        for chunk_idx, chunk in enumerate(chunks):
            if len(chunk) < 1:
                continue
            record = {
                'objectID': hashlib.sha1(f"{url}#{record_index}#{chunk[:50]}".encode()).hexdigest(),
                'url': url,
                'title': title_text,
                'content': chunk,
                'html': str(element)[:500],
                'type': 'page',
                'headings': list(hierarchy.values()) if hierarchy else [],
                'hierarchy': None,  # Production always has None for hierarchy
                'tags': [],
                'categories': [],
                'slug': pathlib.Path(html_path).stem,
                'version': extract_version_from_path(path_str),
                'doc_type': extract_doc_type_from_path(path_str),
                'docs_area': frontmatter_docs_area or extract_docs_area_from_path(path_str),
                'summary': page_summary or text[:100],
                'excerpt_text': first_excerpt_text,  # Use first element's text for all records
                'excerpt_html': str(element)[:200],
                'canonical': canonical_path,  # Relative URL path
                'custom_ranking': {
                    'position': record_index + chunk_idx,
                    'heading': heading_ranking
                },
                'last_modified_at': last_modified  # From git history, format DD-Mon-YY
            }
            records.append(record)
            record_index += 1

    return records

def main():
    if not ADMIN:
        die("Missing ALGOLIA_ADMIN_API_KEY")

    print(f"Indexing to: {INDEX}")
    print(f"Excluded files: {FILES_TO_EXCLUDE}")
    print(f"Nodes to index: {NODES_TO_INDEX}")

    client = SearchClient.create(APP_ID, ADMIN)

    # Find HTML files
    html_files = []
    for p in pathlib.Path(SITE_DIR).rglob("*.html"):
        if not should_exclude_file(str(p)):
            html_files.append(p)

    if not html_files:
        die(f"No HTML files found in {SITE_DIR}")

    print(f"Found {len(html_files)} HTML files to index")

    # Extract records with progress bar
    all_records = []
    pbar = tqdm(html_files, desc="Extracting records")
    for html_file in pbar:
        records = extract_records_from_html(html_file)
        all_records.extend(records)
        pbar.set_description(f"Extracting records ({len(all_records)} total)")

    print(f"\nExtracted {len(all_records)} total records")

    if not all_records:
        die("No records extracted!")

    # ---- DO NOT CHANGE: Algolia ops are known-good ----
    print(f"Clearing index {INDEX}...")
    index = client.init_index(INDEX)
    index.clear_objects()

    print(f"Pushing {len(all_records)} records in batches of {BATCH_SIZE}...")
    for i in range(0, len(all_records), BATCH_SIZE):
        batch = all_records[i:i+BATCH_SIZE]
        print(f"  Batch {i//BATCH_SIZE + 1}: Pushing {len(batch)} records...")
        response = index.save_objects(batch)
        # Handle IndexingResponse object
        if response:
            # Try to get task_id from the response
            if hasattr(response, 'task_id'):
                print(f"    Response: Task {response.task_id}")
            elif hasattr(response, 'raw_responses'):
                if isinstance(response.raw_responses, dict):
                    task_id = response.raw_responses.get('taskID', 'No taskID')
                    print(f"    Response: Task {task_id}")
                elif isinstance(response.raw_responses, list) and response.raw_responses:
                    task_id = response.raw_responses[0].get('taskID', 'No taskID')
                    print(f"    Response: Task {task_id}")
                else:
                    print(f"    Response: Success")
            else:
                print(f"    Response: Success")
        else:
            print(f"    Response: No response")

    print(f"\n✓ Successfully indexed {len(all_records)} records to {INDEX}")

if __name__ == "__main__":
    main()
