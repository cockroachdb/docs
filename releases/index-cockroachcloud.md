---
title: CockroachDB Cloud Release Notes
summary: Release notes for older versions of CockroachDB Cloud.
toc: true
---

CockroachDB Cloud supports the latest major version of CockroachDB and the version immediately preceding it. All clusters are subject to automatic upgrades to the latest supported minor version. [{{ site.data.products.serverless }}](../cockroachcloud/quickstart.html) clusters are subject to automatic upgrades for both minor and major releases.

For more information, see the [{{ site.data.products.db }} Upgrade Policy](../cockroachcloud/upgrade-policy.html).

## Past release notes

<ul class="release-table">
  {% for section in site.data.releases-cc %}
    {% for release in section.releases %}
      <li>
        <a href="{{ release.link }}.html">{{ release.name }}</a>
      </li>
    {% endfor %}
  {% endfor %}
</ul>
