---
title: CockroachCloud Releases
summary: Release notes for older versions of CockroachCloud.
toc: true
---

CockroachCloud [supports](/docs/cockroachcloud/upgrade-policy.html) the latest major version of CockroachDB and the version immediately preceding it. All clusters are subject to automatic upgrades to the latest supported minor version. When a new major version is available, [CockroachCloud Admins](/docs/cockroachcloud/console-access-management.html#console-admin) will be able to [start an upgrade directly from the CockroachCloud Console](/docs/cockroachcloud/upgrade-to-v20.2.html). [CockroachCloud Free (beta)](/docs/cockroachcloud/quickstart) clusters are subject to automatic upgrades for both minor and major releases.

<table class="release-table">
  <thead>
    <tr>
      <td>Version</td>
    </tr>
  </thead>
  
  {% for section in site.data.releases-cc %}
    <tbody>
      {% for release in section.releases %}
        <tr> 
          <td>
            <a href="{{ release.link }}.html">{{ release.name }}</a>
            {% if release.latest %}
                <span class="badge">Latest</span>
            {% endif %}
          </td>
        </tr>
      {% endfor %}
    </tbody>
  {% endfor %}
</table>

Get future release notes emailed to you:

{% include marketo.html %}