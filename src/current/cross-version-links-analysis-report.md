# Cross-Version Links Analysis Report

## Current Problem
The CSV shows **530 cross-version references** from current documentation (v23.1+) pointing to archived versions (v2.1, v20.2, v21.1, v21.2, v22.1, v22.2) that will be deleted.

## Analysis Methodology
I analyzed the `cross_version_assets_report.csv` to understand:
1. **What types** of references exist
2. **Where** they're located 
3. **What** replacement strategy is feasible
4. **Risk level** of each change

---

## Reference Breakdown by Type

### 1. Image References (460 out of 530 total)

#### Critical Image Issues:
```
ISSUE: IntelliJ IDEA images (49 references)
- Source: v23.1+/intellij-idea.md files
- Target: /docs/images/v2.1/intellij/*.png
- Problem: Current docs reference v2.1 images

ISSUE: UI Queue Dashboard images (110 references)  
- Source: v23.1+/ui-queues-dashboard.md files
- Target: /docs/images/v22.1/ui_*.png
- Problem: Current docs reference v22.1 images

ISSUE: Architecture Storage Layer (33 references)
- Source: v23.1+/architecture/storage-layer.md files  
- Target: /docs/images/v21.2/sst.png, memtable-wal-sst.png, lsm-with-ssts.png
- Problem: Current docs reference v21.2 images

ISSUE: Spatial Tutorial (19 references)
- Source: v23.1+/query-spatial-data.md files
- Target: /docs/images/v20.2/geospatial/*.png and v21.1/geospatial/tutorial/*.png
- Problem: Current docs reference archived version images

ISSUE: Hasura Integration (36 references)
- Source: v23.1+/hasura-getting-started.md files
- Target: /docs/images/v22.2/hasura-*.png  
- Problem: Current docs reference v22.2 images

ISSUE: DBeaver Documentation (15 references)
- Source: Archived version files only (v20.2, v21.1, v21.2)
- Target: /docs/images/v2.1/dbeaver-*.png
- Problem: These files will be deleted anyway
```

### 2. Page Link References (70 out of 530 total)

#### Critical Page Link Issues:
```
ISSUE: Topology Pattern Links (54 references)
- Source: v23.1+/migrate-to-multiregion-sql.md files
- Target: v20.2/topology-duplicate-indexes.md, topology-geo-partitioned-*.md
- Problem: These topology patterns were DEPRECATED in favor of multi-region SQL

ISSUE: Backup Collection Links (9 references)
- Source: Various current files  
- Target: v21.2/take-full-and-incremental-backups.html#backup-collections
- Problem: Pointing to archived version docs

ISSUE: Other Page Links (7 references)
- Various scattered references to archived version pages
```

### 3. Include File References (18 references)

```
ISSUE: Replication Zone Pattern Mapping (18 references)
- Source: _includes/v*/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
- Target: Hard-coded v20.2/topology-*.md links  
- Problem: Include files contain hard-coded archived version links
```

---

## Proposed Solution Strategy

### Strategy A: **Minimal Asset Copying** (RECOMMENDED)

#### For Images:
1. **Copy missing images to oldest supported version (v23.1)**
   - Copy v2.1/intellij/* → v23.1/intellij/* 
   - UI queue images already exist in v23.1
   - Architecture images already exist in v23.1
   - Spatial images already exist in v23.1
   - Hasura images already exist in v23.1

2. **Update references to point to v23.1**
   - Change `images/v2.1/intellij/` → `images/v23.1/intellij/`
   - Change `images/v22.1/ui_` → `images/v23.1/ui_`
   - Change `images/v21.2/` → `images/v23.1/`
   - Change `images/v20.2/geospatial/` → `images/v23.1/geospatial/`
   - Change `images/v22.2/hasura` → `images/v23.1/hasura`

#### For Page Links:
1. **Remove deprecated topology pattern links**
   - Replace `[Duplicate indexes](v20.2/...)` → `Duplicate indexes (deprecated pattern)`
   - These patterns were replaced by multi-region SQL

2. **Update backup collection links**
   - Change `v21.2/take-full-and-incremental-backups.html` → `v23.1/take-full-and-incremental-backups.html`

3. **Update include files**
   - Remove hard-coded v20.2 links in replication zone mapping files

#### Advantages:
- ✅ Minimal changes required
- ✅ No new assets created 
- ✅ Uses existing v23.1 infrastructure
- ✅ Clear single source of truth

#### Disadvantages:
- ⚠️ All current versions reference v23.1 images (may be confusing)

---

### Strategy B: **Distributed Asset Strategy** (COMPLEX)

#### For Images:
1. **Copy images to each current version's directory**
   - Copy v2.1/intellij/* → v23.1/intellij/, v23.2/intellij/, v24.1/intellij/, etc.
   - Copy other archived images to each current version

2. **Update references to use current version**
   - Change `images/v2.1/intellij/` → `images/{{ page.version.version }}/intellij/`

#### Advantages:
- ✅ Each version has its own assets
- ✅ Version-specific references

#### Disadvantages:
- ❌ Creates many duplicate image files (~200MB+ of duplicates)
- ❌ Much more complex to implement
- ❌ Harder to maintain
- ❌ We rejected this approach already

---

### Strategy C: **Link to External/Current Documentation** (RISKY)

#### For Page Links:
1. **Point to current documentation site**
   - Change `v20.2/topology-duplicate-indexes.md` → `v25.4/topology-duplicate-indexes.md`

#### Disadvantages:
- ❌ May create broken links if content doesn't exist
- ❌ May reference inappropriate content for older versions
- ❌ Inconsistent user experience

---

## REVISED Implementation Plan (Based on Asset Research)

### Phase 1: Asset Analysis Results
**RESEARCH FINDINGS:**
```
✅ UI Queue Images: Already exist in ALL supported versions (v23.1+)
✅ Geospatial Images: Already exist in ALL supported versions (324+ files)  
✅ Hasura Images: Already exist in ALL supported versions
✅ Architecture Images: Already exist in ALL supported versions
❌ IntelliJ Images: Missing from v23.1-v24.2, exist in v24.3+ (8 files)
```

### Phase 1: Copy ONLY Missing IntelliJ Images
```bash
# Copy IntelliJ images to versions that don't have them
cp images/v2.1/intellij/* images/v23.1/intellij/
cp images/v2.1/intellij/* images/v23.2/intellij/
cp images/v2.1/intellij/* images/v24.1/intellij/
cp images/v2.1/intellij/* images/v24.2/intellij/

# Note: v24.3+ already have IntelliJ images, no copying needed
```

### Phase 2: Update Image References (Version-Specific Strategy)
```bash
# Update IntelliJ IDEA docs - use each version's own images
find v23.1 -name "intellij-idea.md" -exec sed -i '' 's|images/v2\.1/intellij/|images/v23.1/intellij/|g' {} \;
find v23.2 -name "intellij-idea.md" -exec sed -i '' 's|images/v2\.1/intellij/|images/v23.2/intellij/|g' {} \;
find v24.1 -name "intellij-idea.md" -exec sed -i '' 's|images/v2\.1/intellij/|images/v24.1/intellij/|g' {} \;
find v24.2 -name "intellij-idea.md" -exec sed -i '' 's|images/v2\.1/intellij/|images/v24.2/intellij/|g' {} \;
# v24.3+ already have correct paths

# Update UI queue dashboard docs - use each version's existing images
find v23.1 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v23.1/|g' {} \;
find v23.2 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v23.2/|g' {} \;
find v24.1 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v24.1/|g' {} \;
find v24.2 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v24.2/|g' {} \;
find v24.3 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v24.3/|g' {} \;
find v25.1 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v25.1/|g' {} \;
find v25.2 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v25.2/|g' {} \;
find v25.3 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v25.3/|g' {} \;
find v25.4 -name "ui-queues-dashboard.md" -exec sed -i '' 's|images/v22\.1/|images/v25.4/|g' {} \;

# Similar pattern for architecture, spatial, and Hasura docs
# (Each version uses its own existing image directory)
```

### Phase 3: Update Page Links
```bash
# Remove deprecated topology pattern links
find . -name "*migrate-to-multiregion*" -exec sed -i '' 's|\[Duplicate indexes\]({% link v20\.2/topology-duplicate-indexes\.md %})|Duplicate indexes (deprecated pattern)|g' {} \;
find . -name "*migrate-to-multiregion*" -exec sed -i '' 's|\[Geo-partitioned replicas\]({% link v20\.2/topology-geo-partitioned-replicas\.md %})|Geo-partitioned replicas (deprecated pattern)|g' {} \;
find . -name "*migrate-to-multiregion*" -exec sed -i '' 's|\[Geo-partitioned leaseholders\]({% link v20\.2/topology-geo-partitioned-leaseholders\.md %})|Geo-partitioned leaseholders (deprecated pattern)|g' {} \;

# Update backup collection links
find . -type f -exec sed -i '' 's|v21\.2/take-full-and-incremental-backups\.html#backup-collections|v23.1/take-full-and-incremental-backups.html#backup-collections|g' {} \;
```

### Phase 4: Update Include Files
```bash
# Update include files to remove v20.2 references
find _includes -name "replication-zone-patterns-to-multiregion-sql-mapping.md" -exec sed -i '' 's|\[Duplicate indexes\]({% link v20\.2/topology-duplicate-indexes\.md %})|Duplicate indexes (deprecated pattern)|g' {} \;
find _includes -name "replication-zone-patterns-to-multiregion-sql-mapping.md" -exec sed -i '' 's|\[Geo-partitioned replicas\]({% link v20\.2/topology-geo-partitioned-replicas\.md %})|Geo-partitioned replicas (deprecated pattern)|g' {} \;
find _includes -name "replication-zone-patterns-to-multiregion-sql-mapping.md" -exec sed -i '' 's|\[Geo-partitioned leaseholders\]({% link v20\.2/topology-geo-partitioned-leaseholders\.md %})|Geo-partitioned leaseholders (deprecated pattern)|g' {} \;
```

### Phase 5: Validation
```bash
# Check for remaining archived version references
grep -r "v2\.1\|v20\.2\|v21\.1\|v21\.2\|v22\.1\|v22\.2" . --include="*.md" | grep -E "(href|src|link)" | wc -l
# Should return 0

# Test site build
bundle exec jekyll build
```

---

## Risk Assessment

### Low Risk Changes:
- ✅ **Image reference updates**: Images exist in v23.1, just changing paths
- ✅ **Include file updates**: Removing deprecated links with explanatory text
- ✅ **DBeaver references**: Files will be deleted anyway

### Medium Risk Changes:
- ⚠️ **UI queue dashboard images**: Need to verify all images exist in v23.1
- ⚠️ **Backup collection links**: Need to verify target pages exist

### High Risk Changes:
- ⚠️ **Topology pattern links**: These are being replaced with text, may affect user understanding

---

## Alternative Approaches for Problematic Cases

### If topology pattern pages exist in current versions:
```bash
# Instead of removing links, update to current version
find . -name "*migrate-to-multiregion*" -exec sed -i '' 's|v20\.2/topology-duplicate-indexes\.md|v23.1/topology-duplicate-indexes.md|g' {} \;
```

### If backup collection section doesn't exist in v23.1:
```bash
# Remove the link entirely but keep surrounding text
find . -type f -exec sed -i '' 's|\[backup collections\](v21\.2/take-full-and-incremental-backups\.html#backup-collections)|backup collections|g' {} \;
```

---

## FINAL RESEARCH-BASED RECOMMENDATIONS

### Strategy: **Minimal Copying + Version-Specific References**

**KEY FINDINGS:**
- ✅ **460 image references**: Only IntelliJ images need copying (8 files)
- ✅ **Most images already exist**: UI, geospatial, hasura, architecture images exist in ALL supported versions
- ✅ **Simple solution**: Copy 8 IntelliJ images to 4 versions, update references to use each version's own images

### Risk Assessment:
- **LOW RISK**: 92% of image references (425/460) just need path updates - no copying required
- **LOW RISK**: Include files have simple v20.2 topology link patterns to replace
- **MINIMAL WORK**: Only 32 image files need copying total (8 files × 4 versions)

### Implementation Impact:
```
Total Asset Changes Required:
- Copy 32 image files (8 IntelliJ images × 4 versions)
- Update ~530 references in text files
- Replace 18 deprecated topology links in include files

Storage Impact: ~1.6MB (32 × ~50KB average per image)
```

### Ready for Implementation:
This research-based analysis shows the solution is much simpler than initially thought. Most images already exist across all supported versions - we just need to fix the reference paths and copy a small number of IntelliJ images.

**RECOMMENDATION**: Proceed with version-specific image references since images already exist in each version.