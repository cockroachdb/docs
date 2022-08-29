---
title: Logging Levels and Channels
summary: Reference documentation for logging levels and logging channels.
toc: true
docs_area: reference.logging
---

{% assign rd = site.data.releases | where_exp: "rd", "rd.major_version == page.version.version" | first %}

{% if rd %}
{% assign remote_include_version = page.version.version | replace: "v", "" %}
{% else %}
{% assign remote_include_version = site.versions["stable"] | replace: "v", "" %}
{% endif %}

{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroach/release-22.1/docs/generated/logging.md %}
