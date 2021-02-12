---
title: CockroachCloud Release Notes
summary: Release notes for older versions of CockroachCloud.
toc: true
---

CockroachCloud supports the latest major version of CockroachDB and the version immediately preceding it. All clusters are subject to automatic upgrades to the latest supported minor version. [CockroachCloud Free (beta)](../cockroachcloud/quickstart.html) clusters are subject to automatic upgrades for both minor and major releases.

For more information, see the [CockroachCloud Upgrade Policy](../cockroachcloud/upgrade-policy.html).

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
