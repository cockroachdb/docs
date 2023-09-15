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

After downloading your desired release, learn how to [install CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb). Also be sure to review Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}).

**Limited Access** binaries allow you to validate CockroachDB on on architectures that will soon become generally available. In certain cases, limited access binaries are available only to enrolled customers. To enroll your organization, contact your account representative.

The following binaries are not suitable for production environments:

- **Testing** binaries allow you to validate the next major or minor version of CockroachDB while it is in development. A testing release is categorized by its level of maturity, moving from Alpha to Beta to Release Candidate (RC).

  {{site.data.alerts.callout_danger}}
  In CockroachDB v22.2.x and above, a cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
  {{site.data.alerts.end}}

- **Experimental** binaries allow you to deploy CockroachDB on architectures that are not yet qualified for production use.

{{ experimental_js_warning }}

{% assign sections = site.data.releases | map: "release_type" | uniq | reverse %}
{% comment %} Fetch the list of all release types (currently Testing, Production) {% endcomment %}

{% assign released_versions = site.data.releases | map: "major_version" | uniq | reverse %}
{% comment %} Fetch the list of the major versions of all releases that currently exist {% endcomment %}

{% assign versions = site.data.versions | where_exp: "versions", "released_versions contains versions.major_version" | sort: "release_date" | reverse %}
{% comment %} Fetch all major versions (e.g., v21.2), sorted in reverse chronological order. {% endcomment %}

{% assign latest_hotfix = site.data.releases | where_exp: "latest_hotfix", "latest_hotfix.major_version == site.versions['stable']" | where_exp: "latest_hotfix", "latest_hotfix.withdrawn != true"  | sort: "release_date" | reverse | first %}
{% comment %} For the latest GA version, find the latest hotfix that is not withdrawn. {% endcomment %}

{% comment %}Assign the JS for the experimental download prompt and store it in the Liquid variable experimental_download_js {% endcomment %}
{% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}
{% capture onclick_string %}onclick="{{ experimental_download_js }}"{% endcapture %}

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

        {% assign v_linux_arm = false %}
        {% for r in releases %}
            {% if r.linux.linux_arm == true %}
                {% assign v_linux_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% assign v_mac_arm = false %}
        {% for r in releases %}
            {% if r.mac.mac_arm == true %}
                {% assign v_mac_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% assign v_docker_arm = false %}
        {% for r in releases %}
            {% if r.docker.docker_arm == true %}
                {% assign v_docker_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% if releases[0] %}
### {{ s }} Releases

<section class="filter-content" markdown="1" data-scope="linux">

**Experimental** downloads are not yet qualified for production use.

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit Downloads</td>
        {% if v_linux_arm == true %}
            <td>ARM 64-bit Downloads</td>
        {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.linux.linux_arm == true %}
                    {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}{% comment %}Version and date columns joined with previous row{% endcomment %}
                <td><span class="badge badge-gray">Withdrawn</span></td>
                    {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
                <td>
                    {% if r.linux.linux_arm_experimental == true %}<b>Experimental:</b>{% endif %}{% if r.linux.linux_arm_limited_access == true %}<b>Limited Access:</b>{% endif %}
                    <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only == true %}
                    <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz.sha256sum">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% endif %}
                </td>
                    {% endif %}
                {% endif %}
            </tr>
            {% endfor %} {% comment %}Releases {% endcomment %}
        </tbody>
    </table>
</section>

<section class="filter-content" markdown="1" data-scope="mac">

**Experimental** downloads are not yet qualified for production use.

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit Downloads</td>
        {% if v_mac_arm == true %}
            <td>ARM 64-bit Downloads</td>
        {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a {% if r.mac.mac_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.mac.mac_arm == true %}
                  {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}{% comment %}Version and date columns joined with previous row{% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                  {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                {% if r.mac.mac_arm_experimental == true %}<b>Experimental:</b>{% endif %}{% if r.mac.mac_arm_limited_access == true %}<b>Limited Access:</b>{% endif %}
                <div><a {% if r.mac.mac_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz">Full Binary</a>(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum">SHA256</a>)</div>
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz">SQL shell Binary</a>(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum">SHA256</a>)</div>
                    {% endif %}
            </td>
                {% endif %}
            {% endif %}
        </tr>
        {% endfor %}
    </tbody>
    </table>

</section>

<section class="filter-content" markdown="1" data-scope="windows">
    Windows 8 or higher is required. Windows downloads are **experimental** and not yet qualified for production use.

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
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                    {% if r.windows == true %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only == true %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% endif %}
                    {% else %}
                N/A
                    {% endif %}
                {% endif %}
            </td>
        </tr>
            {% endfor %}
    </tbody>
</table>
</section>

<section class="filter-content" markdown="1" data-scope="docker">

    Docker images for CockroachDB are published on [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/tags).

        {% if v_docker_arm == true %}
    [Multi-platform images](https://docs.docker.com/build/building/multi-platform/) include support for both Intel and ARM.
        {% endif %}

**Experimental** downloads are not yet qualified for production use.

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
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
            {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            <td>
                {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                <span class="badge badge-gray">Withdrawn</span>
                {% else %}
                    {% if r.source == true %}
                <b>Intel{% if r.docker.docker_arm == true %}/ARM{% endif %}</b>: <code>{{ r.docker.docker_image }}:{{ r.release_name }}</code>{% if r.docker.docker_arm_experimental == true %} (Experimental){% endif %}{% if r.docker.docker_arm_limited_access == true %} (Limited Access){% endif %}
                    {% else %}
                N/A
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
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
        {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
        {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
        {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
        {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
            {% if r.source == true %}
                <a class="external" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ r.release_name }}">View on Github</a>
            {% else %}
                N/A
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
