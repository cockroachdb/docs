---
title: Releases
summary: Release notes for older versions of CockroachDB.
toc: true
redirect_from: /releases.html
---

After downloading your desired release, learn how to [Install CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html). Also be sure to review Cockroach Lab's [Release Support Policy](release-support-policy.html).


{% for section in site.data.releases %}
## {{section.title}}
<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

<section class="filter-content" data-scope="windows">
{% include windows_warning.md %}
</section>

<table class="release-table">
<thead>
<tr>
  <td>Version</td>
  <td>Date</td>
  <td>Download</td>
</tr>
</thead>

<tbody>
{% for release in section.releases %}
    <tr {% if release.latest %}class="latest"{% endif %}>
        <td>
            <a href="{{ release.version }}.html">{{ release.version }}</a>
            {% if release.latest %}
                <span class="badge-new">Latest</span
            {% endif %}
        </td>
        <td>{{ release.date }}</td>
        {% if release.withdrawn %}
            <td class="os-release-cell"><span class="badge badge-gray">Withdrawn</span></td>
            <td></td>
        {% else %}
            <td class="os-release-cell">
                <section class="filter-content" data-scope="linux">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz">Precompiled 64-bit Binary</a>
                </section>
                <section class="filter-content" data-scope="mac">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.darwin-10.9-amd64.tgz">Precompiled 64-bit Binary</a>
                </section>
                <section class="filter-content" data-scope="windows">
                {% if release.no_windows %}
                    N/A
                {% else %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.windows-6.2-amd64.zip">Precompiled 64-bit Binary</a>
                {% endif %}
                </section>
                <section class="filter-content" data-scope="docker">
                    <code>cockroachdb/cockroach{% if release.version contains "-" %}-unstable{% endif %}:{{ release.version }}</code>
                </section>
                <section class="filter-content" data-scope="source">
                {% if release.no_source %}
                    N/A
                {% else %}
                    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.src.tgz">Source</a>
                {% endif %}
                </section>
            </td>
        {% endif %}
    </tr>
{% endfor %}
</tbody>
</table>
{% endfor %}

## Release naming

Cockroach Labs uses a three-component calendar versioning scheme to name [production releases](#production-releases) of CockroachDB. The format is `YY.R.PP`, where `YY` indicates the year, `R` indicates release with “1” for Spring and “2” for Fall, and `PP` indicates the patch release version. Example: Version 20.1.1 (abbreviated v20.1.1).

{{site.data.alerts.callout_info}}
This calendar versioning scheme began with v19.1. Prior releases use a different versioning scheme.
{{site.data.alerts.end}}

- A major release is produced twice a year indicating major enhancements to product functionality. A change in the `YY.R` component denotes a major release.

- A patch (or maintenance) release is produced to roll out critical bug and security fixes. A change in the `PP` component denotes a patch release.
