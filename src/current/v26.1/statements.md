---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: Looking at the provided PR diff and the extracted statements analysis, I can confirm that there are **no new or changed SQL statements** to document in this pull request.
toc: true
docs_area: reference.sql
---

Looking at the provided PR diff and the extracted statements analysis, I can confirm that there are **no new or changed SQL statements** to document in this pull request.

The "No SQL statements detected in diff" finding is correct. This PR (#169552) is primarily a bug fix that:

1. **Fixes a wire format issue** for BCE (Before Common Era) timestamps in certain timezone configurations
2. **Enables timezone abbreviation parsing** (like 'EST', 'CET', 'PST') which was previously marked as unimplemented
3. **Implements the `pg_timezone_abbrevs` system table** to support abbreviation lookups
4. **Updates function descriptions** for `make_date`, `make_timestamp`, and `make_timestamptz` by removing the phrase "(formatted according to ISO 8601)"

However, **no new SQL statement syntax** is being introduced, and **no existing SQL statement syntax** is being modified. The changes are:

- **Internal implementation fixes** for timestamp formatting
- **Feature enablement** for existing functionality (timezone abbreviations in timestamp literals)
- **Documentation text updates** for existing built-in functions

If you need documentation for the newly enabled timezone abbreviation feature or the implemented `pg_timezone_abbrevs` table, I could help with that instead. But there are no SQL statements requiring reference documentation from this PR.
