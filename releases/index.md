---
title: Releases
summary: Release notes for older versions of CockroachDB.
toc: true
docs_area: releases
toc_not_nested: true
---

After downloading your desired release, learn how to [install CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html). Also be sure to review Cockroach Labs' [Release Support Policy](release-support-policy.html).

{% assign sections = site.data.releases | map: "release_type" | uniq | reverse %}
{% comment %} Fetch the list of all release types (currently Testing, Production) {% endcomment %}

{% assign released_versions = site.data.releases | map: "major_version" | uniq | reverse %}
{% comment %} Fetch the list of the major versions of all releases that currently exist {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "released_versions contains versions.major_version" | sort: "release_date" | reverse %}
{% comment %} Fetch all major versions (e.g., v21.2), sorted in reverse chronological order. {% endcomment %}

{% assign latest_hotfix = site.data.releases | where_exp: "latest_hotfix", "latest_hotfix.major_version == site.versions['stable']" | where: "withdrawn", "false"  | sort: "release_date" | reverse | first %}
{% comment %} For the latest GA version, find the latest hotfix that is not withdrawn. {% endcomment %}

{% for v in versions %} {% comment %} Iterate through all major versions {% endcomment %}

{% assign oldreleases = "v1.0,v1.1,v2.0,v2.1,v19.1,v19.2,v20.1" | split: "," %}

{% if oldreleases contains v.major_version %}
  {% assign old_release_format = "True" %}
{% endif %} {% comment %} For all releases prior to and including 20.1, we use different logic to generate the page (vXX.Y.Z.html vs vXX.Y.html#vXX-Y-Z). {% endcomment %}

{% assign nosha_releases = "v1.0,v1.1,v2.0,v2.1,v19.1,v19.2,v20.1,v20.2" | split: "," %} {% comment %} For all Production releases 21.1 and later, we provide sha256sum files as well. {% endcomment %}

## {{ v.major_version }}

<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

<section class="filter-content" data-scope="windows"> {% comment %} Show warning about Windows being in experimental mode. {% endcomment %}
{% include windows_warning.md %}
</section>

{% for s in sections %} {% comment %} For each major version, iterate through the sections. {% endcomment %}

{% assign releases = site.data.releases | where_exp: "releases", "releases.major_version == v.major_version" | where_exp: "releases", "releases.release_type == s" | sort: "release_date" | reverse %} {% comment %} Fetch all releases for that major version based on release type (Production/Testing). {% endcomment %}

{% if releases[0] %}

### {{ s }} Releases

<table class="release-table">
<thead>
<tr>
  <td>Version</td>
  <td>Date</td>
  <td>Download</td>
</tr>
</thead>

<tbody>
{% for r in releases %}
    <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
        <td>
            <a href="{% if old_release_format %}{{ r.version }}.html{% else %}{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}{% endif %}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
            {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
        </td>
        <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
        {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td class="os-release-cell"><span class="badge badge-gray">Withdrawn</span></td>
        {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td class="os-release-cell">
                <section class="filter-content" data-scope="linux">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-amd64.tgz">Precompiled 64-bit Binary (full)</a>
                    {% if r.has_sql_only != "false" %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.linux-amd64">Precompiled 64-bit Binary (SQL shell only)</a>
                    {% endif %}
                    {% unless nosha_releases contains v.major_version or s == "Testing" %}
                        <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-amd64.tgz.sha256sum">SHA256</a>
                    {% endunless %}
                </section>
                <section class="filter-content" data-scope="mac">
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-10.9-amd64.tgz">Precompiled 64-bit Binary</a>
                    {% if r.has_sql_only != "false" %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.darwin-10.9-amd64">Precompiled 64-bit Binary (SQL shell only)</a>
                    {% endif %}
                    {% unless nosha_releases contains v.major_version or s == "Testing" %}
                        <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-10.9-amd64.tgz.sha256sum">SHA256</a>
                    {% endunless %}
                </section>
                <section class="filter-content" data-scope="windows">
                {% if r.no_windows == "true" %}
                    N/A
                {% else %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.windows-6.2-amd64.zip">Precompiled 64-bit Binary</a>
                    {% unless nosha_releases contains v.major_version or s == "Testing" %}
                        <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.windows-6.2-amd64.zip.sha256sum">SHA256</a>
                    {% endunless %}
                    {% if r.has_sql_only != "false" %}
                    <a class="os-release-link" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.windows-6.2-amd64.exe">Precompiled 64-bit Binary (SQL shell only)</a>
                    {% endif %}
                {% endif %}
                </section>
                <section class="filter-content" data-scope="docker">
                    <code>cockroachdb/cockroach{% if r.version contains "-" %}-unstable{% endif %}:{{ r.version }}</code>
                </section>
                <section class="filter-content" data-scope="source">
                {% if r.no_source == "true" %}
                    N/A
                {% else %}
                    <a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ r.version }}">Source</a>
                {% endif %}
                </section>
            </td>
        {% endif %}
    </tr>
{% endfor %}
</tbody>
</table>
{% endif %}
{% endfor %}
{% endfor %}

## Release naming

Cockroach Labs uses a three-component calendar versioning scheme to name [production releases](#production-releases) of CockroachDB. The format is `YY.R.PP`, where `YY` indicates the year, `R` indicates release with “1” for Spring and “2” for Fall, and `PP` indicates the patch release version. Example: Version 20.1.1 (abbreviated v20.1.1).

{{site.data.alerts.callout_info}}
This calendar versioning scheme began with v19.1. Prior releases use a different versioning scheme.
{{site.data.alerts.end}}

- A major release is produced twice a year indicating major enhancements to product functionality. A change in the `YY.R` component denotes a major release.

- A patch (or maintenance) release is produced to roll out critical bug and security fixes. A change in the `PP` component denotes a patch release.
