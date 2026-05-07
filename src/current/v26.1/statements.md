---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: Analysis
toc: true
docs_area: reference.sql
---

## Analysis

This PR focuses on fixing BCE (Before Common Era) timestamp formatting and enabling timezone abbreviation parsing. The changes include:

1. **Bug Fix**: Corrects the wire format for BCE timestamptz values in zones with LMT (Local Mean Time) historical data to match PostgreSQL's output format

2. **Feature Enablement**: Implements timezone abbreviation parsing in timestamp literals (e.g., `EST`, `CET`, `PST`) that was previously marked as unimplemented

3. **System Table Implementation**: The `pg_timezone_abbrevs` system table is now populated and functional instead of being an empty placeholder

4. **Documentation Updates**: Minor corrections to function descriptions for `make_date()`, `make_timestamp()`, and `make_timestamptz()` (removing "formatted according to ISO 8601" text)

## No New SQL Syntax

The changes do not introduce new SQL statement syntax. Instead:

- **Timezone abbreviation parsing** now works in existing timestamp literal syntax:
  ```sql
  SELECT '2015-08-25 05:45:45 CET'::timestamptz;
  ```
  This syntax existed but previously returned an "unimplemented" error.

- **`pg_timezone_abbrevs` table** is now queryable using standard `SELECT` statements:
  ```sql
  SELECT abbrev, utc_offset, is_dst FROM pg_catalog.pg_timezone_abbrevs;
  ```

- **BCE timestamp functions** now produce correctly formatted output but use the same function syntax.

## Recommendation

No SQL statement reference documentation is needed for this PR. The extraction correctly identified "(No SQL statements detected in diff)" - this PR fixes existing functionality and enables previously unimplemented features without introducing new SQL syntax.

The timezone abbreviation parsing and `pg_timezone_abbrevs` table should already be covered in existing date/time function documentation and system table documentation respectively.
