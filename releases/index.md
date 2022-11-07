---
title: Releases
summary: Release notes for older versions of CockroachDB.
toc: true
docs_area: releases
toc_not_nested: true
---

{% comment %}
NOTE TO WRITERS: This file contains interleaved HTML and Liquid. To ease maintenance and readability
of this file, block-level HTML is indented in relation to the other HTML, and block-level Liquid is
indented in relation to the other Liquid. Please try to keep the indentation consistent. Thank you!
{% endcomment %}

After downloading your desired release, learn how to [install CockroachDB](../{{site.versions["stable"]}}/install-cockroachdb.html). Also be sure to review Cockroach Labs' [Release Support Policy](release-support-policy.html).

The following binaries are not suitable for production environments:

- **Testing** binaries allow you to validate the next major or minor version of CockroachDB while it is in development. A testing release is categorized by its level of maturity, moving from Alpha to Beta to Release Candidate (RC).
- **Experimental** binaries allow you to deploy CockroachDB on architectures that are not yet qualified for production use.

{{ experimental_js_warning }}

{% assign sections = site.data.releases | map: "release_type" | uniq | reverse %}
{% comment %} Fetch the list of all release types (currently Testing, Production) {% endcomment %}

{% assign released_versions = site.data.releases | map: "major_version" | uniq | reverse %}
{% comment %} Fetch the list of the major versions of all releases that currently exist {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "released_versions contains versions.major_version" | sort: "release_date" | reverse %}
{% comment %} Fetch all major versions (e.g., v21.2), sorted in reverse chronological order. {% endcomment %}

{% assign latest_hotfix = site.data.releases | where_exp: "latest_hotfix", "latest_hotfix.major_version == site.versions['stable']" | where: "withdrawn", "false"  | sort: "release_date" | reverse | first %}
{% comment %} For the latest GA version, find the latest hotfix that is not withdrawn. {% endcomment %}

{% comment %}Assign the JS for the experimental download prompt and store it in the Liquid variable experimental_download_js {% endcomment %}
{% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}

{% for v in versions %} {% comment %} Iterate through all major versions {% endcomment %}

## {{ v.major_version }}

<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

    {% for s in sections %} {% comment %} For each major version, iterate through the sections. {% endcomment %}

        {% assign releases = site.data.releases | where_exp: "releases", "releases.major_version == v.major_version" | where_exp: "releases", "releases.release_type == s" | sort: "release_date" | reverse %} {% comment %} Fetch all releases for that major version based on release type (Production/Testing). {% endcomment %}

        {% assign v_linux_arm = "false" %}
        {% for r in releases %}
            {% if r.linux_arm == "true" %}
                {% assign v_linux_arm = "true" %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% assign v_mac_arm = "false" %}
        {% for r in releases %}
            {% if r.mac_arm == "true" %}
                {% assign v_mac_arm = "true" %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% if releases[0] %}
### {{ s }} Releases

<section class="filter-content" data-scope="linux">

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit Downloads</td>
        {% if v_linux_arm == "true" %}
            <td>ARM 64-bit (<b>Experimental</b>) Downloads</td>
        {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-amd64.tgz">Full Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only != "false" %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.linux-amd64.tgz">SQL Shell Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.linux-amd64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.linux_arm == "true" %}
                    {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}{% comment %}Version and date columns joined with previous row{% endcomment %}
                <td><span class="badge badge-gray">Withdrawn</span></td>
                    {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
                <td>
                    <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-3.7.10-gnu-aarch64.tgz">Full Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.linux-3.7.10-gnu-aarch64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only != "false" %}
                    <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.linux-3.7.10-gnu-aarch64.tgz">SQL shell Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.linux-3.7.10-gnu-aarch64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% endif %}
                </td>
                    {% endif %}
                {% endif %}
            </tr>
            {% endfor %} {% comment %}Releases {% endcomment %}
        </tbody>
    </table>
</section>

<section class="filter-content" data-scope="mac">

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit Downloads</td>
        {% if v_mac_arm == "true" %}
            <td>ARM 64-bit Downloads</td>
        {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-10.9-amd64.tgz">Full Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-10.9-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only != "false" %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.darwin-10.9-amd64.tgz">SQL shell Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.darwin-10.9-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.mac_arm == "true" %}
                  {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}{% comment %}Version and date columns joined with previous row{% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                  {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-11.0-aarch64.tgz">Full Binary</a> (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.darwin-11.0-aarch64.tgz.sha256sum">SHA256</a>)</div>
                    {% if r.has_sql_only != "false" %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.darwin-11.0-aarch64.tgz">SQL shell Binary</a> (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.darwin-11.0-aarch64.tgz.sha256sum">SHA256</a>)</div>
                    {% endif %}
            </td>
                {% endif %}
            {% endif %}
        </tr>
        {% endfor %}
    </tbody>
    </table>

</section>

<section class="filter-content" data-scope="windows">
    Windows 8 or higher is required.

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit (<b>Experimental</b>) Downloads</td>
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                    {% if r.no_windows == "true" %}
                N/A
                    {% else %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.windows-6.2-amd64.zip">Full Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.version }}.windows-6.2-amd64.zip.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only != "false" %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.windows-6.2-amd64.zip">SQL shell Binary</a>{% if r.has_sha256sum == "true" %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.version }}.windows-6.2-amd64.zip.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% endif %}
                    {% endif %}
                {% endif %}
            </td>
        </tr>
            {% endfor %}
    </tbody>
</table>
</section>

<section class="filter-content" data-scope="docker">
    <p>Docker images for CockroachDB are published on <a class="external" href="https://hub.docker.com/r/cockroachdb/cockroach/tags)">Docker Hub</a>.</p>
    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Docker image tag</td>
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
            {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            <td>
                {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                <span class="badge badge-gray">Withdrawn</span>
                {% else %}
                    {% if r.no_source == "true" %}
                N/A
                    {% else %}
                <code>cockroachdb/cockroach{% if r.version contains "-" %}-unstable{% endif %}:{{ r.version }}</code>
                    {% endif %}
            </td>
        {% endif %}
        </tr>
    {% endfor %}
    </tbody>
    </table>
</section>

<section class="filter-content" data-scope="source">
    <p>The source code for CockroachDB is hosted in the <a href="https://github.com/cockroachdb/cockroach/releases/">cockroachdb/cockroach</a> repository on Github.</p>
    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Source</td>
        </tr>
    </thead>
    <tbody>
    {% for r in releases %}
        <tr {% if r.version == latest_hotfix.version %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{{ v.major_version }}.html#{{ r.version | replace: ".", "-" }}">{{ r.version }}</a> {% comment %} Add link to each release r. {% endcomment %}
        {% if r.version == latest_hotfix.version %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
        {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
        {% if r.withdrawn == "true" %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
        {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
            {% if r.no_source == "true" %}
                N/A
            {% else %}
                <a class="external" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ r.version }}">View on Github</a>
            {% endif %}
            </td>
        {% endif %}
        </tr>
    {% endfor %}
    </tbody>
    </table>
</section>


{% endif %} {% comment %}if releases[0]{% endcomment %}
{% endfor %} {% comment %}Sections {% endcomment %}
{% endfor %} {% comment %}Versions{% endcomment %}

## Release naming

Cockroach Labs uses a three-component calendar versioning scheme to name [production releases](#production-releases) of CockroachDB. The format is `YY.R.PP`, where `YY` indicates the year, `R` indicates release with “1” for Spring and “2” for Fall, and `PP` indicates the patch release version. Example: Version 20.1.1 (abbreviated v20.1.1).

{{site.data.alerts.callout_info}}
This calendar versioning scheme began with v19.1. Prior releases use a different versioning scheme.
{{site.data.alerts.end}}

- A major release is produced twice a year indicating major enhancements to product functionality. A change in the `YY.R` component denotes a major release.

- A patch (or maintenance) release is produced to roll out critical bug and security fixes. A change in the `PP` component denotes a patch release.
