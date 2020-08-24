---
title: Hot Ranges
summary: Hot Ranges API for CockroachDB.
toc: true
back_to_top: true
---

The Hot Ranges endpoint returns ranges with active requests for a specified node.

This API will remain stable across minor (patch) releases within a major release.

## Resource

`GET /_status/hotranges`

## Authorization

- TK token is required.
- A user must have the `admin` role.

{% include {{ page.version.version }}/http/hotranges-request.md %}

### Example Request

```
code block
```

{% include {{ page.version.version }}/http/hotranges-response.md %}

### Example Response

```
code block
```

## Referenced Types

{% include {{ page.version.version }}/http/hotranges-other.md %}
