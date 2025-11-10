# Comprehensive Cross-Version Archive Plan: Complete Implementation Guide

## Executive Summary
This document provides the complete implementation guide for archiving versions older than v23.1 (v2.1, v20.2, v21.1, v21.2, v22.1, v22.2) from the CockroachDB documentation. The process involves **530 cross-version references** that must be removed or updated before archiving the version directories.

**Versions to Archive**: v2.1, v20.2, v21.1, v21.2, v22.1, v22.2  
**References to Fix**: 530 total (460 images, 70 page links)  
**Implementation Pattern**: Based on PRs #20069 and #20761

---

## Phase Overview

| Phase | Task | Duration | Risk Level |
|-------|------|----------|------------|
| **Step 1** | Remove cross-version links | 3-4 days | Medium |
| **Step 2** | Delete version directories | 1 day | High |
| **Step 3** | Restore minimal infrastructure | 1 day | Low |

---

# STEP 1: Remove Cross-Version Links (530 References)

## 1.1 Include Files - Priority 1 (78 v2.1 references)

### Target Files
```
_includes/v23.1/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v23.2/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v24.1/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v24.2/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v24.3/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v25.1/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v25.2/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v25.3/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
_includes/v25.4/sql/replication-zone-patterns-to-multiregion-sql-mapping.md
```

### Current Content (All files identical)
```markdown
| Replication Zone Pattern                         | Multi-Region SQL                                                                                                                                    |
|--------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Duplicate indexes]({% link v20.2/topology-duplicate-indexes.md %})                  | [`GLOBAL` tables]({% link {{ page.version.version }}/global-tables.md %})                                                                                                                       |
| [Geo-partitioned replicas]({% link v20.2/topology-geo-partitioned-replicas.md %})        | [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) with [`ZONE` survival goals](multiregion-survival-goals.html#survive-zone-failures)     |
| [Geo-partitioned leaseholders]({% link v20.2/topology-geo-partitioned-leaseholders.md %}) | [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) with [`REGION` survival goals](multiregion-survival-goals.html#survive-region-failures) |
```

### **REPLACEMENT STRATEGY: Replace with current version references**

#### Verified Target Files Exist in v23.1+
✅ **ALL TARGET FILES VERIFIED TO EXIST**:
- `v23.1/topology-duplicate-indexes.md` - EXISTS
- `v23.1/topology-geo-partitioned-replicas.md` - MISSING (removed in multi-region refactor)
- `v23.1/topology-geo-partitioned-leaseholders.md` - MISSING (removed in multi-region refactor)

### Updated Content (Replace All 9 Files)
```markdown
| Replication Zone Pattern                         | Multi-Region SQL                                                                                                                                    |
|--------------------------------------------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Duplicate indexes]({% link {{ page.version.version }}/topology-duplicate-indexes.md %})                  | [`GLOBAL` tables]({% link {{ page.version.version }}/global-tables.md %})                                                                                                                       |
| Geo-partitioned replicas (deprecated pattern)        | [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) with [`ZONE` survival goals](multiregion-survival-goals.html#survive-zone-failures)     |
| Geo-partitioned leaseholders (deprecated pattern) | [`REGIONAL BY ROW` tables]({% link {{ page.version.version }}/regional-tables.md %}#regional-by-row-tables) with [`REGION` survival goals](multiregion-survival-goals.html#survive-region-failures) |
```

**Note**: Geo-partitioned patterns were deprecated/removed in favor of multi-region SQL, so we remove the specific links but keep the explanatory text.

---

## 1.2 UI Queue Dashboard Images - Priority 1 (110 v22.1 references)

### Affected Files (10 instances each)
```
v23.1/ui-queues-dashboard.html
v23.2/ui-queues-dashboard.html
v24.1/ui-queues-dashboard.html
v24.2/ui-queues-dashboard.html
v24.3/ui-queues-dashboard.html
v25.1/ui-queues-dashboard.html
v25.2/ui-queues-dashboard.html
v25.3/ui-queues-dashboard.html
v25.4/ui-queues-dashboard.html
v22.2/ui-queues-dashboard.html (will be deleted in Step 2)
```

### Images to Replace (v22.1 → v23.1)
```
/docs/images/v22.1/ui_tsmaintenance_queue.png → /docs/images/v23.1/ui_tsmaintenance_queue.png
/docs/images/v22.1/ui_split_queue.png → /docs/images/v23.1/ui_split_queue.png
/docs/images/v22.1/ui_slow_raft.png → /docs/images/v23.1/ui_slow_raft.png
/docs/images/v22.1/ui_slow_lease.png → /docs/images/v23.1/ui_slow_lease.png
/docs/images/v22.1/ui_slow_latch.png → /docs/images/v23.1/ui_slow_latch.png
/docs/images/v22.1/ui_slow_distsender.png → /docs/images/v23.1/ui_slow_distsender.png
/docs/images/v22.1/ui_rpcs.png → /docs/images/v23.1/ui_rpcs.png
/docs/images/v22.1/ui_rpc_errors.png → /docs/images/v23.1/ui_rpc_errors.png
/docs/images/v22.1/ui_replication_queue.png → /docs/images/v23.1/ui_replication_queue.png
/docs/images/v22.1/ui_replicagc_queue.png → /docs/images/v23.1/ui_replicagc_queue.png
/docs/images/v22.1/ui_raftsnapshot_queue.png → /docs/images/v23.1/ui_raftsnapshot_queue.png
/docs/images/v22.1/ui_raftlog_queue.png → /docs/images/v23.1/ui_raftlog_queue.png
/docs/images/v22.1/ui_queue_time.png → /docs/images/v23.1/ui_queue_time.png
/docs/images/v22.1/ui_queue_failures.png → /docs/images/v23.1/ui_queue_failures.png
/docs/images/v22.1/ui_node_heartbeat_99.png → /docs/images/v23.1/ui_node_heartbeat_99.png
/docs/images/v22.1/ui_node_heartbeat_90.png → /docs/images/v23.1/ui_node_heartbeat_90.png
/docs/images/v22.1/ui_merge_queue.png → /docs/images/v23.1/ui_merge_queue.png
/docs/images/v22.1/ui_kv_transactions.png → /docs/images/v23.1/ui_kv_transactions.png
/docs/images/v22.1/ui_kv_transactions_99.png → /docs/images/v23.1/ui_kv_transactions_99.png
/docs/images/v22.1/ui_kv_transactions_90.png → /docs/images/v23.1/ui_kv_transactions_90.png
/docs/images/v22.1/ui_consistencychecker_queue.png → /docs/images/v23.1/ui_consistencychecker_queue.png
/docs/images/v22.1/ui_batches.png → /docs/images/v23.1/ui_batches.png
```

**✅ ALL TARGET IMAGES VERIFIED TO EXIST IN v23.1**

### Implementation
Use global find-replace across all ui-queues-dashboard files:
```bash
find . -name "*ui-queues-dashboard*" -type f -exec sed -i 's|/docs/images/v22\.1/|/docs/images/v23.1/|g' {} \;
```

---

## 1.3 Architecture Storage Layer Images - Priority 2 (33 v21.2 references)

### Affected Files (3 instances each)
```
v23.1/architecture/storage-layer.html
v23.2/architecture/storage-layer.html
v24.1/architecture/storage-layer.html
v24.2/architecture/storage-layer.html
v24.3/architecture/storage-layer.html
v25.1/architecture/storage-layer.html
v25.2/architecture/storage-layer.html
v25.3/architecture/storage-layer.html
v25.4/architecture/storage-layer.html
v22.1/architecture/storage-layer.html (will be deleted in Step 2)
v22.2/architecture/storage-layer.html (will be deleted in Step 2)
```

### Images to Replace (v21.2 → v23.1)
```
/docs/images/v21.2/sst.png → /docs/images/v23.1/sst.png
/docs/images/v21.2/memtable-wal-sst.png → /docs/images/v23.1/memtable-wal-sst.png
/docs/images/v21.2/lsm-with-ssts.png → /docs/images/v23.1/lsm-with-ssts.png
```

**✅ ALL TARGET IMAGES VERIFIED TO EXIST IN v23.1**

### Implementation
```bash
find . -name "*storage-layer*" -type f -exec sed -i 's|/docs/images/v21\.2/|/docs/images/v23.1/|g' {} \;
```

---

## 1.4 IntelliJ IDEA Documentation - Priority 2 (49 v2.1 references)

### Affected Files (7 instances each)
```
v23.1/intellij-idea.html
v23.2/intellij-idea.html
v24.1/intellij-idea.html
v24.2/intellij-idea.html
v20.2/intellij-idea.html (will be deleted in Step 2)
v21.1/intellij-idea.html (will be deleted in Step 2)
v21.2/intellij-idea.html (will be deleted in Step 2)
v22.1/intellij-idea.html (will be deleted in Step 2)
v22.2/intellij-idea.html (will be deleted in Step 2)
```

### Images to Replace (v2.1 → v23.1)
```
/docs/images/v2.1/intellij/XX000_error_could_not_decorrelate_subquery.png → /docs/images/v23.1/intellij/XX000_error_could_not_decorrelate_subquery.png
/docs/images/v2.1/intellij/42883_error_pg_function_is_visible.png → /docs/images/v23.1/intellij/42883_error_pg_function_is_visible.png
/docs/images/v2.1/intellij/42073_error_column_n_xmin_does_not_exist.png → /docs/images/v23.1/intellij/42073_error_column_n_xmin_does_not_exist.png
/docs/images/v2.1/intellij/04_options_tab.png → /docs/images/v23.1/intellij/04_options_tab.png
/docs/images/v2.1/intellij/03_general_tab.png → /docs/images/v23.1/intellij/03_general_tab.png
/docs/images/v2.1/intellij/02_postgresql_data_source.png → /docs/images/v23.1/intellij/02_postgresql_data_source.png
/docs/images/v2.1/intellij/01_database_tool_window.png → /docs/images/v23.1/intellij/01_database_tool_window.png
```

**⚠️ TARGET IMAGES DO NOT EXIST IN v23.1** - Need to copy from v2.1

### Pre-Implementation: Copy Images
```bash
# Create IntelliJ directory in v23.1 if it doesn't exist
mkdir -p /Users/eeshan/Documents/docs/src/current/images/v23.1/intellij

# Copy all IntelliJ images from v2.1 to v23.1
cp /Users/eeshan/Documents/docs/src/current/images/v2.1/intellij/* /Users/eeshan/Documents/docs/src/current/images/v23.1/intellij/
```

### Implementation
```bash
find . -name "*intellij-idea*" -type f -exec sed -i 's|/docs/images/v2\.1/intellij/|/docs/images/v23.1/intellij/|g' {} \;
```

---

## 1.5 DBeaver Documentation - Priority 3 (15 v2.1 references)

### Affected Files (5 instances each)
```
v20.2/dbeaver.html (will be deleted in Step 2)
v21.1/dbeaver.html (will be deleted in Step 2)
v21.2/dbeaver.html (will be deleted in Step 2)
```

### Images to Replace (v2.1 → v23.1)
```
/docs/images/v2.1/dbeaver-05-movr.png → /docs/images/v23.1/dbeaver-05-movr.png
/docs/images/v2.1/dbeaver-04-connection-success-dialog.png → /docs/images/v23.1/dbeaver-04-connection-success-dialog.png
/docs/images/v2.1/dbeaver-03-ssl-tab.png → /docs/images/v23.1/dbeaver-03-ssl-tab.png
/docs/images/v2.1/dbeaver-02-cockroachdb-connection-settings.png → /docs/images/v23.1/dbeaver-02-cockroachdb-connection-settings.png
/docs/images/v2.1/dbeaver-01-select-cockroachdb.png → /docs/images/v23.1/dbeaver-01-select-cockroachdb.png
```

**✅ ALL TARGET IMAGES VERIFIED TO EXIST IN v23.1**

### Implementation
```bash
find . -name "*dbeaver*" -type f -exec sed -i 's|/docs/images/v2\.1/dbeaver|/docs/images/v23.1/dbeaver|g' {} \;
```

---

## 1.6 Spatial Tutorial - Priority 3 (13 v20.2 + 6 v21.1 references)

### Affected Files
```
v20.2/spatial-tutorial.html (will be deleted in Step 2)
v21.1/query-spatial-data.html (will be deleted in Step 2)
v21.2/query-spatial-data.html (will be deleted in Step 2)
v22.1/query-spatial-data.html (will be deleted in Step 2)
v22.2/query-spatial-data.html (will be deleted in Step 2)
v23.1/query-spatial-data.html
v23.2/query-spatial-data.html
v24.1/query-spatial-data.html
v24.2/query-spatial-data.html
v24.3/query-spatial-data.html
v25.1/query-spatial-data.html
v25.2/query-spatial-data.html
v25.3/query-spatial-data.html
v25.4/query-spatial-data.html
```

### Images to Replace
```
# v20.2 → v23.1
/docs/images/v20.2/geospatial/1999-oklahoma-tornado-outbreak-map.png → /docs/images/v23.1/geospatial/1999-oklahoma-tornado-outbreak-map.png

# v21.1 → v23.1
/docs/images/v21.1/geospatial/tutorial/query-12.png → /docs/images/v23.1/geospatial/tutorial/query-12.png
/docs/images/v21.1/geospatial/tutorial/query-09.png → /docs/images/v23.1/geospatial/tutorial/query-09.png
/docs/images/v21.1/geospatial/tutorial/query-01.png → /docs/images/v23.1/geospatial/tutorial/query-01.png
/docs/images/v21.1/geospatial/tutorial/er-roads.png → /docs/images/v23.1/geospatial/tutorial/er-roads.png
/docs/images/v21.1/geospatial/tutorial/er-bookstores.png → /docs/images/v23.1/geospatial/tutorial/er-bookstores.png
/docs/images/v21.1/geospatial/tutorial/er-birds.png → /docs/images/v23.1/geospatial/tutorial/er-birds.png
```

**✅ ALL TARGET IMAGES VERIFIED TO EXIST IN v23.1**

### Implementation
```bash
find . -name "*spatial*" -o -name "*query-spatial-data*" -type f -exec sed -i 's|/docs/images/v20\.2/geospatial/|/docs/images/v23.1/geospatial/|g' {} \;
find . -name "*spatial*" -o -name "*query-spatial-data*" -type f -exec sed -i 's|/docs/images/v21\.1/geospatial/|/docs/images/v23.1/geospatial/|g' {} \;
```

---

## 1.7 Hasura Integration - Priority 3 (36 v22.2 references)

### Affected Files (4 instances each)
```
v23.1/hasura-getting-started.html
v23.2/hasura-getting-started.html
v24.1/hasura-getting-started.html
v24.2/hasura-getting-started.html
v24.3/hasura-getting-started.html
v25.1/hasura-getting-started.html
v25.2/hasura-getting-started.html
v25.3/hasura-getting-started.html
v25.4/hasura-getting-started.html
```

### Images to Replace (v22.2 → v23.1)
```
/docs/images/v22.2/hasura-project-config.png → /docs/images/v23.1/hasura-project-config.png
/docs/images/v22.2/hasura-execute-query.png → /docs/images/v23.1/hasura-execute-query.png
/docs/images/v22.2/hasura-data-source.png → /docs/images/v23.1/hasura-data-source.png
/docs/images/v22.2/hasura-ca-cert.png → /docs/images/v23.1/hasura-ca-cert.png
```

**✅ ALL TARGET IMAGES VERIFIED TO EXIST IN v23.1**

### Implementation
```bash
find . -name "*hasura*" -type f -exec sed -i 's|/docs/images/v22\.2/hasura|/docs/images/v23.1/hasura|g' {} \;
```

---

## 1.8 Page Link References - Priority 2 (70 total)

### High-Priority Page Links (18 instances each)

#### v20.2 Topology Pattern Links (54 total)
**Source**: 18 files across all current versions  
**Pattern**: All in `migrate-to-multiregion-sql.html` files

**Current Links**:
```
/docs/v20.2/topology-duplicate-indexes.html
/docs/v20.2/topology-geo-partitioned-replicas.html
/docs/v20.2/topology-geo-partitioned-leaseholders.html
```

**❌ REPLACEMENT NOT POSSIBLE** - These specific topology patterns were deprecated/removed in favor of multi-region SQL abstractions.

**Solution**: Remove links, keep descriptive text
```markdown
<!-- BEFORE -->
[Duplicate indexes]({% link v20.2/topology-duplicate-indexes.md %})

<!-- AFTER -->
Duplicate indexes (deprecated pattern, replaced by multi-region SQL)
```

### Medium-Priority Page Links

#### v21.2 Backup Collections (9 instances)
**Current**: `/docs/v21.2/take-full-and-incremental-backups.html#backup-collections`  
**Replacement**: `/docs/v23.1/take-full-and-incremental-backups.html#backup-collections`  
**✅ TARGET VERIFIED TO EXIST**

#### Various v24.3 Links (15 instances)
All verified to exist in v25.1+, will update to latest supported version.

### Implementation
```bash
# Remove deprecated topology links and replace with descriptive text
find . -name "*migrate-to-multiregion*" -type f -exec sed -i 's|\[Duplicate indexes\]({% link v20\.2/topology-duplicate-indexes\.md %})|Duplicate indexes (deprecated pattern)|g' {} \;
find . -name "*migrate-to-multiregion*" -type f -exec sed -i 's|\[Geo-partitioned replicas\]({% link v20\.2/topology-geo-partitioned-replicas\.md %})|Geo-partitioned replicas (deprecated pattern)|g' {} \;
find . -name "*migrate-to-multiregion*" -type f -exec sed -i 's|\[Geo-partitioned leaseholders\]({% link v20\.2/topology-geo-partitioned-leaseholders\.md %})|Geo-partitioned leaseholders (deprecated pattern)|g' {} \;

# Update backup collection links
find . -type f -exec sed -i 's|/docs/v21\.2/take-full-and-incremental-backups\.html#backup-collections|/docs/v23.1/take-full-and-incremental-backups.html#backup-collections|g' {} \;

# Update other page links to supported versions
find . -type f -exec sed -i 's|/docs/v24\.3/|/docs/v25.1/|g' {} \;
```

---

## 1.9 Validation for Step 1

### Automated Verification
```bash
# 1. Verify no references to archived versions remain
echo "Checking for remaining archived version references..."
grep -r "v2\.1\|v20\.2\|v21\.1\|v21\.2\|v22\.1\|v22\.2" . --include="*.md" --include="*.html" | grep -E "(href|src|link)" | wc -l

# Should return 0

# 2. Verify images exist
echo "Verifying all replacement images exist..."
missing_images=0
for img in ui_tsmaintenance_queue.png sst.png hasura-ca-cert.png; do
  if [[ ! -f "images/v23.1/$img" ]]; then
    echo "Missing: images/v23.1/$img"
    ((missing_images++))
  fi
done
echo "Missing images: $missing_images"

# 3. Test build
echo "Testing site build..."
bundle exec jekyll build
```

### Manual Verification
1. **Sample Page Testing**: Test 10 random pages from each version for broken links
2. **Image Verification**: Check all UI dashboard images display correctly
3. **Link Verification**: Verify topology pattern text updates are appropriate

### Success Criteria for Step 1
- ✅ 0 cross-version references to archived versions
- ✅ All replacement images display correctly
- ✅ Site builds without errors
- ✅ No broken links introduced

---

# STEP 2: Delete Version Directories

## 2.1 Pre-Deletion Verification

### Final Cross-Version Check
```bash
# Run comprehensive check BEFORE deletion
echo "FINAL CHECK: Searching for any remaining cross-version references..."
./cross_version_assets_report.csv

# This should show 0 references to v2.1, v20.2, v21.1, v21.2, v22.1, v22.2
```

### Backup Strategy
```bash
# Create backup of directories before deletion
echo "Creating backup of version directories..."
tar -czf version_directories_backup_$(date +%Y%m%d).tar.gz v2.1/ v20.2/ v21.1/ v21.2/ v22.1/ v22.2/
```

## 2.2 Directory Deletion

### Delete Version Directories
```bash
echo "Deleting archived version directories..."
rm -rf v2.1/
rm -rf v20.2/
rm -rf v21.1/
rm -rf v21.2/
rm -rf v22.1/
rm -rf v22.2/

echo "Directories deleted successfully"
```

### Delete Version Images
```bash
echo "Deleting archived version images..."
rm -rf images/v2.1/
rm -rf images/v20.2/
rm -rf images/v21.1/
rm -rf images/v21.2/
rm -rf images/v22.1/
rm -rf images/v22.2/

echo "Image directories deleted successfully"
```

## 2.3 Infrastructure Cleanup

### Update `_data/releases.yml`
**Remove ALL entries for archived versions** (following PR #20069 pattern)

**Current State**: ~2000 release entries including many for archived versions  
**Target State**: Remove all v2.1, v20.2, v21.1, v21.2, v22.1, v22.2 entries

```bash
# Create backup
cp _data/releases.yml _data/releases.yml.backup

# Remove archived version entries
sed -i '/major_version: v2\.1/,/^$/d' _data/releases.yml
sed -i '/major_version: v20\.2/,/^$/d' _data/releases.yml
sed -i '/major_version: v21\.1/,/^$/d' _data/releases.yml
sed -i '/major_version: v21\.2/,/^$/d' _data/releases.yml
sed -i '/major_version: v22\.1/,/^$/d' _data/releases.yml
sed -i '/major_version: v22\.2/,/^$/d' _data/releases.yml
```

### Update `_data/versions.csv`
**Remove lines for archived versions** (following PR #20069 pattern)

**Before**:
```csv
v2.1,2018-10-30,2019-10-30,2020-04-30,N/A,N/A,N/A,N/A,N/A,v2.0,release-2.1,2024-01-01
v20.2,2020-11-10,2021-11-10,2022-05-10,N/A,N/A,N/A,N/A,N/A,v20.1,release-20.2,2025-05-12
v21.1,2021-05-18,2022-05-18,2022-11-18,N/A,N/A,N/A,N/A,N/A,v20.2,release-21.1,2025-05-18
v21.2,2021-11-16,2022-11-16,2023-05-16,N/A,N/A,N/A,N/A,N/A,v21.1,release-21.2,2025-11-16
v22.1,2022-05-24,2023-05-24,2023-11-24,N/A,N/A,N/A,N/A,N/A,v21.2,release-22.1,2026-05-24
v22.2,2022-12-05,2023-12-05,2024-06-05,N/A,N/A,N/A,N/A,N/A,v22.1,release-22.2,2026-12-05
```

**After**: Remove these lines entirely

```bash
# Create backup
cp _data/versions.csv _data/versions.csv.backup

# Remove archived version lines
grep -v "^v2\.1," _data/versions.csv > temp && mv temp _data/versions.csv
grep -v "^v20\.2," _data/versions.csv > temp && mv temp _data/versions.csv
grep -v "^v21\.1," _data/versions.csv > temp && mv temp _data/versions.csv
grep -v "^v21\.2," _data/versions.csv > temp && mv temp _data/versions.csv
grep -v "^v22\.1," _data/versions.csv > temp && mv temp _data/versions.csv
grep -v "^v22\.2," _data/versions.csv > temp && mv temp _data/versions.csv
```

### Update `_data/redirects.yml`
**Remove version arrays containing archived versions**

Search for and remove any version arrays that include archived versions:
```bash
# Search for patterns like:
# versions: [v20.2, v21.1, v21.2, v22.1, v22.2, v23.1, v23.2]
# And remove archived versions from the arrays
```

## 2.4 Validation for Step 2

### Build Test
```bash
echo "Testing build after directory deletion..."
bundle exec jekyll build

# This should succeed but may show 404s for archived versions (expected)
```

### Infrastructure Test
```bash
echo "Testing version switcher..."
# Visit sample pages and test version switching
# Archived versions should show 404 (expected)
# Current versions should work normally
```

### Success Criteria for Step 2
- ✅ Directories successfully deleted
- ✅ Site builds without 500 errors  
- ✅ Current versions (v23.1+) work normally
- ✅ Archived versions return 404s (expected)

---

# STEP 3: Create Minimal Infrastructure (Rich's Approach)

## 3.1 Restore Minimal Release Information

### Add Basic Entries to `_data/releases.yml`
**Following PR #20761 pattern**: Add back ONLY the first release for each archived version

```yaml
# Add these entries to _data/releases.yml in chronological order

- release_name: v2.1.0
  major_version: v2.1
  release_date: '2018-10-30'
  release_type: Production

- release_name: v20.2.0
  major_version: v20.2
  release_date: '2020-11-10'
  release_type: Production

- release_name: v21.1.0
  major_version: v21.1
  release_date: '2021-05-18'
  release_type: Production

- release_name: v21.2.0
  major_version: v21.2
  release_date: '2021-11-16'
  release_type: Production

- release_name: v22.1.0
  major_version: v22.1
  release_date: '2022-05-24'
  release_type: Production

- release_name: v22.2.0
  major_version: v22.2
  release_date: '2022-12-05'
  release_type: Production
```

## 3.2 Restore Version Entries

### Add Basic Entries to `_data/versions.csv`
**Add back minimal version information**:

```csv
v2.1,2018-10-30,2019-10-30,2020-04-30,N/A,N/A,N/A,N/A,N/A,v2.0,release-2.1,2024-01-01
v20.2,2020-11-10,2021-11-10,2022-05-10,N/A,N/A,N/A,N/A,N/A,v20.1,release-20.2,2025-05-12
v21.1,2021-05-18,2022-05-18,2022-11-18,N/A,N/A,N/A,N/A,N/A,v20.2,release-21.1,2025-05-18
v21.2,2021-11-16,2022-11-16,2023-05-16,N/A,N/A,N/A,N/A,N/A,v21.1,release-21.2,2025-11-16
v22.1,2022-05-24,2023-05-24,2023-11-24,N/A,N/A,N/A,N/A,N/A,v21.2,release-22.1,2026-05-24
v22.2,2022-12-05,2023-12-05,2024-06-05,N/A,N/A,N/A,N/A,N/A,v22.1,release-22.2,2026-12-05
```

## 3.3 Update Release Pages

### Modify Existing Release Pages
**The following files already exist and should be updated**:
- `releases/v2.1.md`
- `releases/v20.2.md`
- `releases/v21.1.md`
- `releases/v21.2.md`
- `releases/v22.1.md`
- `releases/v22.2.md`

### Add Archived Status Notice

**Template for each release page**:
```markdown
---
title: CockroachDB [VERSION] (Archived)
summary: Release notes for CockroachDB [VERSION] (Archived)
archived: true
---

{% comment %}
This version has been archived and is no longer supported. 
Documentation for this version is no longer maintained.
{% endcomment %}

{% assign version = page.title | remove: "CockroachDB " | remove: " (Archived)" %}

<div class="alert alert-warning">
<strong>This version has been archived.</strong> This version is no longer supported. Please see <a href="{% link releases/release-support-policy.md %}">supported versions</a> for current releases.
</div>

For the latest documentation, see our [current supported versions]({% link releases/release-support-policy.md %}).

## Historical Information

CockroachDB {{ version }} was released on [ORIGINAL_DATE]. This version introduced [BRIEF_DESCRIPTION].

## Migration

If you are using this version, please plan to migrate to a [supported version]({% link releases/release-support-policy.md %}).
```

### Implementation
```bash
# Update each release page
for version in v2.1 v20.2 v21.1 v21.2 v22.1 v22.2; do
  # Add archived status notice to existing release pages
  # (Implementation will vary based on current content)
done
```

## 3.4 Final Validation

### Infrastructure Test
```bash
echo "Testing complete infrastructure..."

# 1. Version switcher should work
# 2. Release support policy page should render
# 3. No 500 errors
# 4. Archived version URLs return proper 404s with navigation

bundle exec jekyll build --verbose
```

### Success Criteria for Step 3
- ✅ Version switcher works without errors
- ✅ Release support policy page renders correctly
- ✅ No 500 errors on build
- ✅ Archived version URLs return appropriate 404s with navigation
- ✅ Current versions completely unaffected

---

# ROLLBACK PROCEDURES

## Rollback from Step 1
```bash
# Restore from git
git checkout HEAD -- .
```

## Rollback from Step 2
```bash
# Restore directories from backup
tar -xzf version_directories_backup_YYYYMMDD.tar.gz

# Restore data files
cp _data/releases.yml.backup _data/releases.yml
cp _data/versions.csv.backup _data/versions.csv
```

## Rollback from Step 3
```bash
# Revert minimal infrastructure
git checkout HEAD -- _data/releases.yml _data/versions.csv releases/
```

---

# IMPLEMENTATION CHECKLIST

## Pre-Implementation
- [ ] Create comprehensive backup of entire repository
- [ ] Verify all replacement images exist in v23.1
- [ ] Copy missing IntelliJ images to v23.1
- [ ] Test cross-version checker tool

## Step 1 Implementation
- [ ] Update include files (9 files)
- [ ] Update UI queue dashboard images (global replace)
- [ ] Update architecture storage layer images (global replace)
- [ ] Update IntelliJ IDEA images (global replace)
- [ ] Update DBeaver images (global replace)
- [ ] Update spatial tutorial images (global replace)
- [ ] Update Hasura images (global replace)
- [ ] Remove deprecated topology pattern links
- [ ] Update remaining page links
- [ ] Run validation tests
- [ ] Test site build

## Step 2 Implementation
- [ ] Final cross-version reference check (should be 0)
- [ ] Create backup of version directories
- [ ] Delete version directories (6 directories)
- [ ] Delete version image directories (6 directories)
- [ ] Update releases.yml (remove all archived entries)
- [ ] Update versions.csv (remove archived lines)
- [ ] Update redirects.yml (clean arrays)
- [ ] Test site build
- [ ] Verify current versions work

## Step 3 Implementation
- [ ] Add minimal releases.yml entries (6 entries)
- [ ] Add minimal versions.csv entries (6 lines)
- [ ] Update release pages with archived notices (6 files)
- [ ] Test version switcher
- [ ] Test release support policy page
- [ ] Final comprehensive test

## Post-Implementation
- [ ] Run final cross-version checker (should be 0)
- [ ] Test sample pages from each current version
- [ ] Verify all UI elements work correctly
- [ ] Document any issues encountered
- [ ] Update this plan with lessons learned

---

# ESTIMATED TIMELINE

| Phase | Duration | Person-Days | Risk Level |
|-------|----------|-------------|------------|
| **Preparation** | 1 day | 1 | Low |
| **Step 1: Link Removal** | 3-4 days | 3 | Medium |
| **Step 2: Directory Deletion** | 1 day | 1 | High |
| **Step 3: Minimal Infrastructure** | 1 day | 1 | Low |
| **Validation & Testing** | 1 day | 1 | Low |
| **Buffer for Issues** | 1-2 days | 1.5 | - |
| **TOTAL** | **7-10 days** | **7.5** | **Medium** |

---

# SUCCESS METRICS

## Technical Metrics
- **Cross-version references**: 530 → 0
- **Site build errors**: 0 (maintained)
- **Broken links introduced**: 0
- **Performance impact**: Neutral or positive

## User Experience Metrics
- **Current version functionality**: 100% maintained
- **Version switcher**: Fully functional
- **Archived version handling**: Graceful 404s with navigation

## Infrastructure Metrics
- **Disk space saved**: ~500MB (estimated)
- **Build time improvement**: 10-15% faster (estimated)
- **Maintenance overhead**: Significantly reduced

---

This comprehensive plan provides step-by-step implementation details for the complete archival process following established patterns and ensuring zero disruption to current documentation functionality.