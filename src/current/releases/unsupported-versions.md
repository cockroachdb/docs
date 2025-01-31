---
title: Unsupported Versions
summary: Versions of CockroachDB that are no longer supported
toc: true
docs_area: releases
---
{{site.data.alerts.callout_danger}}
The CockroachDB versions on this page are no longer supported. For more information, refer to [Release Support Policy]({% link releases/release-support-policy.md %}#unsupported-versions). To download and learn about currently supported CockroachDB versions, refer to [CockroachDB Releases]({% link releases/index.md %}).
{{site.data.alerts.end}}
## Downloads

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

{% assign is_not_downloadable_message = "No longer available for download." %}
{% assign current_date = "now" | date: "%Y-%m-%d" %}
{% for v in versions %} {% comment %} Iterate through all major versions {% endcomment %}
{% assign maint_supp_exp_date = v.maint_supp_exp_date %}
{% assign asst_supp_exp_date = v.asst_supp_exp_date %}

    {% comment %}
      Determine if the major version is LTS and the patch component of the initial LTS patch,
      or the major version is a skippable innovation release
    {% endcomment %}
    {% assign released = false %}
    {% assign has_lts_releases = false %}
    {% assign lts_link_linux = '' %}
    {% assign lts_patch = nil %}
    {% assign in_lts = false %}
    {% assign comparison = nil %}
    {% assign skippable = false %}
    {% if v.release_date != "N/A" and v.maint_supp_exp_date != "N/A" %}
        {% assign released = true %}
        {% if v.asst_supp_exp_date == "N/A" %}
            {% assign skippable = true %}
        {% elsif v.initial_lts_patch != "N/A" %}
            {% assign has_lts_releases = true %}
            {% assign lts_link = '&nbsp;(<a href="release-support-policy.html">LTS</a>)&nbsp;' %}
            {% capture lts_patch_string %}{{ v.initial_lts_patch | split: '.' | shift | shift }}{% endcapture %}
            {% assign lts_patch = lts_patch_string | times: 1 %}{% comment %}Cast string to integer {% endcomment %}
        {% endif %}
    {% endif %}
     {% assign valid_release_date = false %}
    {% if v.release_date != 'N/A' %}
    {% assign valid_release_date = true %}
    {% endif %}

    {% assign invalid_maint_date = false %}
    {% if v.maint_supp_exp_date != 'N/A' and v.maint_supp_exp_date <= current_date %}
    {% assign invalid_maint_date = true %}
    {% endif %}

    {% assign invalid_asst_date = false %}
    {% if v.asst_supp_exp_date == 'N/A' or v.asst_supp_exp_date <= current_date %}
    {% assign invalid_asst_date = true %}
    {% endif %}

    {% assign is_not_lts_date = false %}
    {% if v.lts_maint_supp_exp_date == 'N/A' and v.lts_asst_supp_exp_date == 'N/A' %}
    {% assign is_not_lts_date = true %}
    {% endif %}

    {% assign invalid_lts_release = false %}
    {% assign lts_maint_date_parsed = v.lts_maint_supp_exp_date | date: '%Y-%m-%d' %}
    {% assign lts_asst_date_parsed = v.lts_asst_supp_exp_date | date: '%Y-%m-%d' %}
    {% if lts_maint_date_parsed != '' and lts_maint_date_parsed != 'N/A' 
        and lts_asst_date_parsed != '' and lts_asst_date_parsed != 'N/A'
        and (lts_maint_date_parsed <= current_date and  lts_asst_date_parsed <= current_date) %}
        {% assign invalid_lts_release = true %}
    {% endif %}
    {% assign invalid_normal_release = false %}
     {% if valid_release_date and invalid_maint_date and invalid_asst_date %}
        {% assign invalid_normal_release = true %}
    {% endif %}

    {% if (invalid_normal_release and is_not_lts_date)  or invalid_lts_release %}
### {{ v.major_version }}

{% if DEBUG == true %}
    released: {{ released }}<br />
    has_lts_releases: {{ has_lts_releases }}<br />
    lts_patch_string: {{ lts_patch_string }}<br />
    lts_patch: {{ lts_patch }}<br />
    v.initial_lts_patch: {{ v.initial_lts_patch }}<br />
    v.major_version: {{ v.major_version }}<br />
    has_lts_releases: {{ has_lts_releases }}<br />
    v.release_date: {{ v.release_date }}<br />
    v.initial_lts_release_date: {{ v.initial_lts_release_date }}<br />
    skippable: {{ skippable }}<br /><br />
{% endif %}

{% if released == false %}
CockroachDB {{ page.major_version }} is in active development and is not yet supported. The following [testing releases]({% link releases/index.md %}#release-types) are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. When CockroachDB {{ page.major_version }} is Generally Available (GA), production releases will also be announced on this page.
{% else %}
CockroachDB {{ v.major_version }} is {% if skippable == true %}an [Innovation release]({% link releases/release-support-policy.md %}#innovation-releases) that is optional for CockroachDB {{ site.data.products.advanced }}, CockroachDB {{ site.data.products.standard }}, and CockroachDB {{ site.data.products.core }} but required for CockroachDB {{ site.data.products.basic }}.{% else %}a required [Regular release]({% link releases/release-support-policy.md %}#regular-releases).{% endif %}{% if released == false %} It is still in development and not yet supported.{% endif %}{% unless latest_full_production_version.release_name != v.major_version %} CockroachDB {{ latest_full_production_version.release_name }} is the latest supported version.{% endunless %} To learn more, refer to [CockroachDB {{ latest.major_version }} Release Notes]({% link releases/{{ v.major_version }}.md %}).
{% endif %}

Refer to [Major release types](https://www.cockroachlabs.com/docs/releases#major-releases) before installing or upgrading for release support details.
{% comment %}Some old pages don't have feature highlights and won't get LTS{% endcomment %}
{% unless v.major_version == 'v1.0' or
      v.major_version == 'v1.1' or
      v.major_version == 'v2.0' or
      v.major_version == 'v2.1' or
      v.major_version == 'v19.1' or
      v.major_version == 'v19.2' or
      v.major_version == 'v20.1' or
      v.major_version == 'v20.2' or
      v.major_version == 'v21.1' or
      v.major_version == 'v21.2' or
      v.major_version == 'v22.1' or
      v.major_version == 'v22.2' or
      released == false %}
To learn what’s new in this release, refer to [Feature Highlights]({% link releases/{{ v.major_version }}.md %}#feature-highlights).
{% endunless %}

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
            {% if r.docker.docker_arm   == true %}
                {% assign v_docker_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% if releases[0] %}

#### {{ s }} Releases

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

                {% assign current_patch_string = '' %}
                {% assign current_patch = nil %}
                {% assign in_lts = false %}
                {% if has_lts_releases == true and s == "Production" %}
                    {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                    {% assign current_patch = current_patch_string | times: 1 %}{% comment %}Cast string to integer {% endcomment %}
                    {% if current_patch == nil %}
                        Error: Could not determine the current patch. Giving up.<br />
                        {% break %}{% break %}
                    {% endif %}

                    {% assign comparison = current_patch | minus: lts_patch %}
                    {% unless comparison < 0 %}
                        {% assign in_lts = true %}
                    {% endunless %}
                {% endif %}

                {% if DEBUG == true %}<tr><td colspan="3">current_patch: {{ current_patch }}<br />lts_patch: {{ lts_patch }}<br />r.release_name: {{ r.release_name }}<br />lts_link: {{ lts_link }}<br />in_lts: {{ in_lts }}</td>{% endif %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts == true %}{{ lts_link }}{% endif %}{% comment %} Add link to each release r, decorate with link about LTS if applicable. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress download links for withdrawn releases. {% endcomment %}
            <td colspan="2"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                  {% continue %}
                {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
                  {% continue %}
                {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td colspan="2"><span>{{ is_not_downloadable_message }}</span></td>
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
                    {% if r.withdrawn == true or r.cloud_only == true or r.is_not_downloadable == true %}
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
              {% continue %}
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
              {% continue %}
            {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td colspan="2"><span>{{ is_not_downloadable_message }}</span></td>
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
                {% if r.withdrawn == true or r.cloud_only == true or r.is_not_downloadable == true %}
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
                  {% continue %}
                {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="2"><span>{{ r.cloud_only_message_short }}</span></td>
                  {% continue %}
                {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td colspan="2"><span>{{ is_not_downloadable_message }}</span></td>
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

        {% comment %}Prepare to show the Notes column in v22.2 and v23.1{% endcomment %}
        {% assign show_notes_column = false %}
        {% if v.major_version == "v23.1" or v.major_version == "v22.2" %}
            {% assign show_notes_column = true %}
        {% endif %}

        {% if s == "Production" %}{% comment %}Print this only for the Production section{% endcomment %}
    Docker images for CockroachDB are published on [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/tags).

            {% if show_notes_column == true %}
      [Multi-platform images](https://docs.docker.com/build/building/multi-platform/) include support for both Intel and ARM.
            {% else %}
        All Docker images for {{ v.major_version }} are [Multi-platform images](https://docs.docker.com/build/building/multi-platform/) with support for both Intel and ARM.
            {% endif %}
        {% endif %}

    <table class="release-table">
    <thead>
        <tr>
            <td>Version</td>
            <td>Date</td>
            <td>Docker image tag</td>
            {% if show_notes_column == true %}<td>Notes</td>{% endif %}
        </tr>
    </thead>
    <tbody>
        {% for r in releases %}

            {% assign current_patch_string = '' %}
            {% assign current_patch = nil %}
            {% assign in_lts = false %}
            {% if has_lts_releases == true and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}{% comment %}Cast string to integer {% endcomment %}
                {% if current_patch == nil %}
                    Error: Could not determine the current patch. Giving up.<br />
                    {% break %}{% break %}
                {% endif %}

                {% assign comparison = current_patch | minus: lts_patch %}
                {% unless comparison < 0 %}
                    {% assign in_lts = true %}
                {% endunless %}
            {% endif %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}

            {% comment %}Version column{% endcomment %}
            <td><a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace:
".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts == true %}{{ lts_link }}{% endif %}{% comment %} Add link to each release r.{% endcomment %}
            {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
            {% endif %}
            </td>

            {% comment %}Release Date column{% endcomment %}
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}

            {% comment %}Docker Image Tag column{% endcomment %}
            <td>
            {% if r.withdrawn == true %}
                <span class="badge badge-gray">Withdrawn</span></td>{% comment %} Suppress download links for withdrawn releases, spans Intel and ARM columns {% endcomment %}
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases, spans Intel and ARM columns {% endcomment %}
                <span>{{ r.cloud_only_message_short }}</span></td>
            {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
                <span>{{ is_not_downloadable_message }}</span></td>
                  {% continue %}
            {% else %}
                {% if r.source == false %}
                N/A
                {% else %}
                    {% if show_notes_column == true %}{% comment %}Show Intel and ARM details only for major versions with a mix{% endcomment %}
                        {% if r.docker.docker_arm == false %}<b>Intel</b>:<br />{% else %}<b>Multi-platform</b>:<br />{% endif %}
                    {% endif %}<code>{{ r.docker.docker_image }}:{{ r.release_name }}</code>
                {% endif %}
            {% endif %}
            </td>
            {% if show_notes_column == true %}
            {% comment %}Notes column{% endcomment %}
            <td>
                {% if r.docker.docker_arm_limited_access == true %}
                **Intel**: Production<br />**ARM**: Limited Access
                {% elsif r.docker.docker_arm_experimental == true %}
                **Intel**: Production<br />**ARM**: Experimental
                {% else %}
                Production
                {% endif %}
            </td>
            {% endif %}
        </tr>
        {% endfor %}
    </tbody>
    </table>
</section>

<section class="filter-content" markdown="1" data-scope="source">
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
                {% continue %}
            {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td><span>{{ is_not_downloadable_message }}</span></td>
                {% continue %}
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
        {% endfor %} {% comment %}for release in releases{% endcomment %}
    </tbody>
    </table>
</section>


        {% endif %} {% comment %}if releases[0]{% endcomment %}
    {% endfor %} {% comment %}for s in sections {% endcomment %}
    {% endif %}
{% endfor %} {% comment %}for v in versions{% endcomment %}
