# Algolia Search Parity Implementation Plan

## Overview
Achieve 100% search parity between production (`cockroachcloud_docs`) and staging (`stage_cockroach_docs`) Algolia indexes by understanding and replicating the Jekyll Algolia gem's record extraction and ranking logic.

## Key Findings from Gem Analysis

### Custom Ranking Formula (configurator.rb:29-33)
```ruby
'customRanking' => [
  'desc(date)',                    # Most recent first
  'desc(custom_ranking.heading)',  # Higher heading scores first (70-100)
  'asc(custom_ranking.position)'   # Lower positions first (0-74)
]
```

### Field Extraction Logic (extractor.rb)
1. **Raw Records**: Uses AlgoliaHTMLExtractor to parse HTML content into sections
2. **Metadata Merge**: Combines extracted content with file metadata from FileBrowser
3. **ObjectID Generation**: Uses AlgoliaHTMLExtractor.uuid(record) for unique IDs
4. **Custom Ranking**: Generated based on content position and heading hierarchy

### Critical Settings (configurator.rb:34-56)
- `unretrievableAttributes: ['custom_ranking']` - Hidden from read-only keys
- `distinct: true` with `attributeForDistinct: 'url'` - One record per URL in search

## Phase 1: MVP Foundation ✅

### 1.1 Gem Analysis ✅
- Located custom ranking formula in configurator.rb:29-33
- Identified field extraction logic in extractor.rb and file_browser.rb
- Found objectID generation using AlgoliaHTMLExtractor.uuid()

### 1.2 Production Record Analysis ✅
- Production uses admin key to reveal custom_ranking values
- Records have position (0-74) and heading (70-100) scores
- ObjectIDs generated from all fields including custom_ranking

### 1.3 Parity Degradation Root Cause ✅
**Problem**: Manually crafted test records don't match production's actual top results
**Solution**: Extract actual production first results using admin key instead of approximations

## Phase 2: MVP Implementation

### 2.1 Build Core Extractor 🔄
Build production record extractor that:
- Uses actual production first results as templates
- Processes _site HTML files to generate matching content/metadata
- Applies Jekyll's custom ranking calculation logic
- Generates correct objectIDs matching production

### 2.2 Test with 10 Key Queries
Target queries: `backup`, `select`, `cluster`, `database`, `insert`, `create table`, `drop`, `alter`, `update`, `delete`

Success criteria: 90%+ first result parity

### 2.3 Iterate Based on Results
- Identify failing queries
- Extract additional production targets
- Refine field extraction logic

## Phase 3: Scale Up
- Process all 846 unique URLs from production
- Generate full record set (13k+ records with sections)
- Validate comprehensive query coverage
- Deploy to staging index

## Implementation Notes
- Custom ranking is HIDDEN by unretrievableAttributes in production
- Must use admin key to extract custom_ranking values
- ObjectID generation includes custom_ranking field in hash
- Deduplication via distinct=true, attributeForDistinct=url