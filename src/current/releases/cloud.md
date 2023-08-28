---
title: CockroachDB Cloud Releases
summary: Changelog for CockroachDB Cloud.
toc: true
docs_area: releases
---

CockroachDB {{ site.data.products.cloud }} supports the latest major version of CockroachDB and the version immediately preceding it. For more information, see the [CockroachDB {{ site.data.products.cloud }} Upgrade Policy](https://www.cockroachlabs.com/docs/cockroachcloud/upgrade-policy).

For details on features that are not supported in CockroachDB {{ site.data.products.serverless }}, see [Unsupported Features in CockroachDB {{ site.data.products.serverless }}](https://www.cockroachlabs.com/docs/cockroachcloud/serverless-unsupported-features).

Get future release notes emailed to you:

{% include marketo.html %}

{% include releases/current-cloud-version.md %}

{% assign crs = site.data.cloud_releases | sort: "date" | reverse %}

{% for rel in crs %}
{% include releases/cloud/{{ rel.date }}.md %}
{% endfor %}
