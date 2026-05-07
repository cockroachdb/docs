---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: System Table Changes
toc: true
docs_area: reference.sql
---

## System Table Changes

### `pg_catalog.pg_timezone_abbrevs`

**Status**: **Newly Implemented** - This table was previously unimplemented and has now been fully implemented.

**Description**: Lists timezone abbreviations recognized by CockroachDB's date/time literal parsing. This table provides PostgreSQL-compatible timezone abbreviation data that allows timestamp literals with abbreviations (like `EST`, `PST`, `UTC`) to be parsed correctly to their corresponding fixed UTC offsets.

**Columns**:

| Column | Type | Description |
| --- | --- | --- |
| `abbrev` | `STRING` | the timezone abbreviation (e.g., `EST`, `PST`, `UTC`) |
| `utc_offset` | `INTERVAL` | the fixed UTC offset for this abbreviation |
| `is_dst` | `BOOL` | whether this abbreviation represents daylight saving time |

**Key Features**:
- Enables parsing of timestamp literals with timezone abbreviations
- Provides fixed UTC offsets for each abbreviation, independent of IANA tzdata
- Supports both standard time and daylight saving time abbreviations
- Case-insensitive abbreviation matching

**Example**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- View common timezone abbreviations
SELECT abbrev, utc_offset, is_dst 
FROM pg_catalog.pg_timezone_abbrevs 
WHERE abbrev IN ('EST', 'EDT', 'PST', 'PDT', 'UTC')
ORDER BY abbrev;
~~~

~~~
  abbrev | utc_offset | is_dst
---------+------------+--------
  EDT    | -04:00:00  |  true
  EST    | -05:00:00  | false
  PST    | -08:00:00  | false
  PDT    | -07:00:00  |  true
  UTC    | 00:00:00   | false
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Now timezone abbreviations work in timestamp literals
SELECT '2014-07-15 08:15:23 EST'::timestamptz;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Abbreviations that don't correspond to IANA zones also work
SELECT '2014-07-15 08:15:23 EAT'::timestamptz; -- East Africa Time
~~~

**Use Cases**:
- Parsing timestamp literals with PostgreSQL-standard timezone abbreviations
- PostgreSQL compatibility for applications that use abbreviated timezone names
- Timezone offset lookup for date/time processing

**See Also**:
- [`pg_timezone_names`]({% link {{ page.version.version }}/pg-catalog.md %}#pg_timezone_names) - Lists IANA timezone names
- [Timestamp data types]({% link {{ page.version.version }}/timestamp.md %}) - Working with timestamps and timezones
- [`make_timestamptz()`]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) - Creating timestamptz values
