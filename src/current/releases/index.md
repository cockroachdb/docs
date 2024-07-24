---
title: Releases
summary: Information about CockroachDB releases with an index of available releases and their release notes and binaries.
toc: true
docs_area: releases
toc_not_nested: true
pre_production_preview: true
pre_production_preview_version: v24.1.0-beta.1
---

{% comment %}
NOTE TO WRITERS: This file contains interleaved HTML and Liquid. To ease maintenance and readability
of this file, block-level HTML is indented in relation to the other HTML, and block-level Liquid is
indented in relation to the other Liquid. Please try to keep the indentation consistent. Thank you!
{% endcomment %}

After downloading a supported CockroachDB binary, learn how to [install CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb). Be sure to review Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}).

- **Generally Available (GA)** releases (also known as Production releases) are qualified for production environments. These may have either a default GA support type or an extended LTS (Long-Term Support) designation. Refer to [Release Support Policy]({% link releases/release-support-policy.md %}) for more information.
- **Testing** releases are intended for testing and experimentation only, and are not qualified for production environments and not eligible for support or uptime SLA commitments. Testing releases allow you to begin testing and validating the next major version of CockroachDB early.
- **Experimental** binaries allow you to deploy and develop with CockroachDB on architectures that are not yet qualified for production use. Experimental binaries are not eligible for support or uptime SLA commitments, whether they are for testing releases or production releases.

For more details, refer to [Release Naming](#release-naming). For information about applicable software licenses, refer to [Licenses](#licenses).

{{site.data.alerts.callout_danger}}
In CockroachDB v22.2.x and above, a cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
{{site.data.alerts.end}}

## Staged release process

As of 2024, CockroachDB is released under a staged delivery process. New releases are made available for select CockroachDB Cloud organizations for two weeks before binaries are published for CockroachDB Self-Hosted downloads.

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

{% comment %}Do a separate loop through the releases and for each release, copy some fields into some local v_ variables to use when we are not in a loop below{% endcomment %}

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

              {% capture lts_link_linux %}{% if r.lts == true %}&nbsp;([LTS]({% link releases/release-support-policy.md %})){% endif %}{% endcapture %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{{ lts_link_linux }}{% comment %} Add link to each release r, decorate with link about LTS if applicable. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress download links for withdrawn releases. {% endcomment %}
            <td colspan="2"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
                  {% continue %}
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.linux.linux_arm == true %}
                {% comment %}Don't print column because of previous colspan=2{% endcomment %}
                    {% if r.withdrawn == true or r.cloud_only == true %}
                        {% break %}
                    {% else %}
                <td>
                        {% if r.linux.linux_arm_experimental == true %}<b>Experimental:</b>{% endif %}
                    <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only == true %}
                    <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz" class="binary-link">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
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

macOS downloads are **experimental**. Experimental downloads are not yet qualified for production use and not eligible for support or uptime SLA commitments, whether they are for testing releases or production releases.

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Intel 64-bit (Experimental) Downloads</td>
        {% if v_mac_arm == true %}
            <td>ARM 64-bit (Experimental) Downloads</td>
        {% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}
        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
            {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td colspan="2"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
              {% continue %}
            {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
            {% endif %}
            {% if r.mac.mac_arm == true %}
                {% comment %}Don't print column because of previous colspan=2{% endcomment %}
                {% if r.withdrawn == true or r.cloud_only == true %}
                    {% break %}
                {% else %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz" class="binary-link">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
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
    Windows 8 or higher is required. Windows downloads are **experimental**. Experimental downloads are not yet qualified for production use and not eligible for support or uptime SLA commitments, whether they are for testing releases or production releases.

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
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a> {% comment %} Add link to each release r. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td colspan="2"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
                  {% continue %}
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                    {% if r.windows == true %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                        {% if r.has_sql_only == true %}
                <div><a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip" class="binary-link">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
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

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Docker image tag</td>
            <td>Notes</td>
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}

        {% capture lts_link_docker %}{% if r.lts == true %}&nbsp;([LTS]({% link releases/release-support-policy.md %})){% endif %}{% endcapture %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace:
".", "-" }}" class="binary-link">{{ r.release_name }}</a> {% comment %} Add link to each release r.
{% endcomment %}
            {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            <td>
            {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                <span class="badge badge-gray">Withdrawn</span>
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
                <span>{{ r.cloud_only_message_short }}</span>
                {% continue %}
            {% else %}
                {% if r.source == true %}
                <b>{% if r.docker.docker_arm == false %}Intel{% else %}Multi-platform{% endif %}</b>:<br><code>{{ r.docker.docker_image }}:{{ r.release_name }}</code>
                {% else %}
                N/A
                {% endif %}
            {% endif %}
            </td>
            <td>
            {% if r.docker.docker_arm_limited_access == true %}
              **Intel**: GA<br />**ARM**: Limited Access
            {% elsif r.docker.docker_arm_experimental == true %}
              **Intel**: GA<br />**ARM**: Experimental
            {% else %}
              GA{{ lts_link_docker }}
            {% endif %}
            </td>
        </tr>
        {% endfor %}
    </tbody>
    </table>
</section>

<section class="filter-content" data-scope="source">
    <p>The source code for CockroachDB is hosted in the <a href="https://github.com/cockroachdb/cockroach/releases/" class="binary-link">cockroachdb/cockroach</a> repository on Github.</p>
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
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% comment %} Add link to each release r {% endcomment %}
            {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td><span class="badge badge-gray">Withdrawn</span></td>
              {% continue %}
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td><span>{{ r.cloud_only_message_short }}</span></td>
            {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                {% if r.source == true %}
                <a class="external" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ r.release_name }}" class="binary-link">View on Github</a>
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

Cockroach Labs uses a three-component calendar versioning scheme to name CockroachDB [releases](https://cockroachlabs.com/docs/releases/index#production-releases). The format is `YY.R.PP`, where `YY` indicates the year, `R` indicates the release (historically “1” or “2”, representing a typical biannual cycle), and `PP` indicates the patch release version. Example: Version 23.1.0 (abbreviated v23.1.0). Leading up to a new major version's initial GA (Generally Available) release, multiple testing builds are produced, moving from Alpha to Beta to Release Candidate. CockroachDB began using this versioning scheme with v19.1.

A major release is typically produced twice a year indicating major enhancements to product functionality. A change in the `YY.R` component denotes a major release.

Patch releases are produced during the [support period]({% link releases/release-support-policy.md %}) for a major version to roll out critical bug and security fixes. A change in the `PP` component denotes a patch release.

During development of a major version of CockroachDB, releases are produced according to the following patterns. Alpha, Beta, and Release Candidate releases are testing releases intended for testing and experimentation only, and are not qualified for production environments and not eligible for support or uptime SLA commitments.

- Alpha releases are the earliest testing releases leading up to a major version's initial GA (generally available) release, and have `alpha` in the version name. Example: `v23.1.0-alpha.1`.
- Beta releases are produced after the series of alpha releases leading up to a major version's initial GA release, and tend to be more stable and introduce fewer changes than alpha releases. They have `beta` in the version name. Example: `v23.1.0-beta.1`.
- Release candidates are produced after the series of beta releases and are nearly identical to what will become the initial generally available (GA) release. Release candidates have `rc` in the version name. Example: `v23.1.0-rc.1`.
- A major version's initial GA release is produced after the series of release candidates for a major version, and ends with `0`. Example: `v23.1.0`. GA releases are validated and suitable for production environments.
- Patch (maintenance) releases are produced after a major version's GA release, and are numbered sequentially. Example: `v23.1.13`.

## Licenses

Unless otherwise noted, all binaries available on this page are variously licensed under the Business Source License 1.1 (BSL), the CockroachDB Community License (CCL), and other licenses specified in the source code. To determine whether BSL or CCL applies to a CockroachDB feature, refer to the [Licensing FAQs](https://www.cockroachlabs.com/docs/stable/licensing-faqs) page under Feature Licensing. The default license for any feature that is not listed is the CCL.
 
To review the CCL, refer to the [CockroachDB Community License](https://www.cockroachlabs.com/cockroachdb-community-license/) page. You can find the applicable Business Source License or third party licenses by reviewing these in the `Licenses` folder for the applicable version of CockroachDB in the GitHub repository [cockroachdb/cockroach](https://github.com/cockroachdb/cockroach). See individual files for details.
