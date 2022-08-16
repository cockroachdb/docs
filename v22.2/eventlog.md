---
title: Notable Event Types
summary: Reference documentation for notable event types in logs.
toc: true
docs_area: reference.logging
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-{{ remote_include_version }}/docs/generated/eventlog.md %}
