---
title: changefeedccl: support CREATE DATABASE CHANGEFEED syntax
summary: [HUMAN REVIEW: Feature Not Ready for Documentation]
toc: true
docs_area: reference
---

## [HUMAN REVIEW: Feature Not Ready for Documentation]

**Issue**: This PR adds parsing support for `CREATE CHANGEFEED FOR DATABASE` syntax, but the feature is explicitly not implemented:

1. **Release note**: "(none)" - indicating this isn't user-facing yet
2. **Go code**: Returns `errors.UnimplementedError(errors.IssueLink{}, "database-level changefeed is not implemented")`
3. **PR description**: "This PR only allows the aforementioned statement to be parsed; no changefeed is created"

**Recommendation**: This appears to be preparatory work for a future feature. Documentation should wait until the feature is actually implemented and has a proper release note.

---

## Partial Reference Documentation (If Needed for Future Use)

If you need to prepare documentation structure for when this feature becomes available, here's what I can derive from the syntax changes:

### `CREATE CHANGEFEED` (Database-Level) - [NOT IMPLEMENTED]

**Synopsis**:
```
CREATE CHANGEFEED FOR DATABASE database_name 
    [INTO sink] 
    [WITH option = value [, ...]]
```

**Description**: [NEEDS REVIEW] Creates a changefeed that captures changes for all tables within a specified database. This appears to be an extension of the existing table-level changefeed functionality to operate at the database scope.

**Parameters**:

| Parameter | Description | Required |
| --- | --- | --- |
| `database_name` | name of the database to monitor for changes | Yes |
| `sink` | destination for changefeed output | No |
| `option` | changefeed configuration options | No |

**Current Status**: 
{{site.data.alerts.callout_danger}}
This syntax is not currently implemented and will return an error. The feature is under development as part of [CRDB-1421](https://cockroachlabs.atlassian.net/browse/CRDB-1421).
{{site.data.alerts.end}}

**Examples**:
[NEEDS REVIEW - Examples cannot be tested as feature is not implemented]

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE CHANGEFEED FOR DATABASE mydb;
~~~

**See also**:
- [`CREATE CHANGEFEED`]({% link {{ page.version.version }}/create-changefeed.md %}) (table-level)
- [`ALTER CHANGEFEED`]({% link {{ page.version.version }}/alter-changefeed.md %})

---

**Recommendation**: Hold this documentation until the feature is implemented and ready for user consumption.
