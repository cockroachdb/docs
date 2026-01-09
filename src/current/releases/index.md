---
title: CockroachDB Releases
summary: Information about CockroachDB releases with an index of available releases and their release notes and binaries.
toc: true
# toc_not_nested: true
docs_area: releases
---

{% comment %}Enable debug to print debug messages {% endcomment %}
{% assign DEBUG = false %}

{% comment %}
NOTE TO WRITERS: This file contains interleaved HTML and Liquid. To ease maintenance and readability
of this file, block-level HTML is indented in relation to the other HTML, and block-level Liquid is
indented in relation to the other Liquid. Please try to keep the indentation consistent. Thank you!
{% endcomment %}

{% assign all_production_releases = site.data.releases | where: "release_type", "Production" | sort: "release_date" | reverse %}
{% assign latest_full_production_version = all_production_releases | first %}

{% assign major_versions = all_production_releases | map: "major_version" | uniq | sort | reverse %}
{% assign latest_major_version_with_production = major_versions | first %}

## Overview

This page explains the types and naming of CockroachDB releases and provides access to the release notes and downloads for all CockroachDB [releases](#downloads).

A new major version of CockroachDB is released quarterly. After a series of testing releases, each major version receives an initial production release, followed by a series of patch releases.

Releases are named in the format `vYY.R.PP`, where `YY` indicates the year, `R` indicates the major release starting with `1` each year, and `PP` indicates the patch number, starting with `0`.

For example, the latest production release is `{{ latest_full_production_version.release_name }}`, within major version [`{{ latest_major_version_with_production }}`]({% link releases/{{ latest_major_version_with_production }}.md %}).

After choosing a version of CockroachDB, learn how to:

- [Create a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/create-your-cluster.md %}).
- [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/upgrade-cockroach-version.md %}).
- [Install CockroachDB {{ site.data.products.core }}]({% link {{site.current_cloud_version}}/install-cockroachdb.md %})
- [Upgrade a Self-Hosted cluster]({% link {{site.current_cloud_version}}/upgrade-cockroach-version.md %}).

Be sure to review Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}) and review information about applicable [software licenses](#licenses).

### Release types

#### Major releases

As of 2024, every second major version is an **Innovation release**. For CockroachDB {{ site.data.products.core }}, CockroachDB {{ site.data.products.standard }}, and CockroachDB {{ site.data.products.advanced }}, these releases offer shorter support windows and can be skipped. Innovation releases are required for CockroachDB {{ site.data.products.basic }}.

All other major versions are **Regular releases**, which are required upgrades. These versions offer longer support periods, which, for CockroachDB {{ site.data.products.core }} clusters, are further extended when a patch version is announced that begins their **LTS** (Long-Term Support) release series.

For details on how LTS impacts support in CockroachDB {{ site.data.products.core }}, refer to [Release Support Policy]({% link releases/release-support-policy.md %}). For details on support per release type in CockroachDB Cloud, refer to [CockroachDB Cloud Support and Upgrade Policy]({% link cockroachcloud/upgrade-policy.md %}).

| Major Release Type | Frequency | Required upgrade | LTS releases and extended support |
| :---: | :---: | :---: | :---: |
| Regular (e.g. v24.1) | 2x/year | Yes | Yes |
| Innovation (e.g. v24.2) | 2x/year | on Basic only | No<sup style="font-size: 0.9em; vertical-align: -0.3em;">*</sup> |
<small>* Column does not apply to CockroachDB Basic, where clusters are automatically upgraded when a new major version or a patch release is available, ensuring continuous support.</small>

For a given CockroachDB {{ site.data.products.core }}, CockroachDB {{ site.data.products.standard }}, or CockroachDB {{ site.data.products.advanced }} cluster, customers may choose to exclusively install or upgrade to Regular Releases to benefit from longer testing and support lifecycles, or to also include Innovation Releases, and benefit from earlier access to new features. This choice does not apply to CockroachDB {{ site.data.products.basic }}, where every major release is an automatic upgrade.

CockroachDB v24.2 is an Innovation release and v24.3 is a Regular release. Starting with v25.1, four major releases are expected per year, where every first and third release of the year is expected to be an Innovation release. For more details, refer to [Upcoming releases](#upcoming-releases).

#### Patch releases

A major version has two types of patch releases: a series of **testing releases** followed by a series of **production releases**. A major version’s initial production release is also known as its GA release.

<style>
  .no-wrap-table td:nth-child(1) {
    width: 140px; /* Set width for the first column */
    white-space: nowrap; /* Prevent wrapping */
  }
  .no-wrap-table td:nth-child(2) {
    width: 200px; /* Set width for the second column */
    white-space: nowrap; /* Prevent wrapping */
  }
</style>

<table class="no-wrap-table">
  <thead>
    <tr>
      <th>Patch Release Type</th>
      <th>Naming</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Production</td>
      <td><code>vYY.R.0</code> - <code>vYY.R.n</code><br>(ex. v24.2.1)</td>
      <td>Production releases are qualified for production environments. The type and duration of support for a production release may vary depending on the major release type, according to the <a href="release-support-policy.html">Release Support Policy</a>.</td>
    </tr>
    <tr>
      <td>Testing</td>
      <td><code>vYY.R.0-alpha.1+</code>,<br><code>vYY.R.0-beta.1+</code>,<br><code>vYY.R.0-rc.1+</code><br>(ex. v24.3.1-alpha.2)</td>
      <td>Produced during development of a new major version, testing releases are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments.</td>
    </tr>
  </tbody>
</table>

{{site.data.alerts.callout_danger}}
A cluster that is upgraded to an alpha binary of CockroachDB or a binary that was manually built from the `master` branch cannot subsequently be upgraded to a production release.
{{site.data.alerts.end}}

### Staged release process

{% include releases/staged-release-policy.md %}

### Recent releases

| Version | Release Type | GA date |
| :---: | :---: | :---: |
| [v25.4](#v25-4) | Regular | 2025-11-03 |
| [v25.3](#v25-3) | Innovation | 2025-08-04 |
| [v25.2](#v25-2) | Regular | 2025-05-12 |
| [v25.1]({% link releases/unsupported-versions.md %}#v25-1) | Innovation | 2025-02-18 |
| [v24.3](#v24-3) | Regular | 2024-11-18 |
| [v24.2]({% link releases/unsupported-versions.md %}#v24-2) | Innovation | 2024-08-12 |
| [v24.1](#v24-1) | Regular | 2024-05-20 |
| [v23.2](#v23-2) | Regular | 2024-02-05 |

### Upcoming releases

The following releases and their descriptions represent proposed plans that are subject to change. Please contact your account representative with any questions.

| Version | Release Type | Expected GA date |
| :---: | :---: | :---: |
| v26.1 | Innovation | 2026 Q1    |
| v26.2 | Regular    | 2026 Q2    |

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
{% assign current_date = 'now' | date: '%Y-%m-%d' %}

{% for v in versions %} {% comment %} Iterate through all major versions {% endcomment %}

    {% comment %}
      Determine if the major version is supported and if it has LTS releases
    {% endcomment %}
    {% assign released = false %}
    {% assign has_lts_releases = false %}
    {% assign lts_link = '' %}
    {% assign lts_patch = nil %}
    {% assign is_supported = false %}
    {% assign is_innovation = false %}
    {% assign in_lts_period = false %}
    {% assign ga_support_expired = false %}
    
    {% comment %} Check if the version has been released {% endcomment %}
    {% if v.release_date != "N/A" and v.maint_supp_exp_date != "N/A" %}
        {% assign released = true %}
        
        {% comment %} Check if this is an innovation release {% endcomment %}
        {% if v.asst_supp_exp_date == "N/A" %}
            {% assign is_innovation = true %}
            
            {% comment %} For innovation releases, check if still in maintenance support {% endcomment %}
            {% if v.maint_supp_exp_date > current_date %}
                {% assign is_supported = true %}
            {% endif %}
        {% else %}
            {% comment %} For regular releases, check if in maintenance or assistance support {% endcomment %}
             {% if v.asst_supp_exp_date > current_date %}
                {% assign is_supported = true %}
            {% else %}
                {% assign ga_support_expired = true %}
            {% endif %}
            
            {% comment %} Check if this version has LTS releases {% endcomment %}
            {% if v.initial_lts_patch != "N/A" %}
                {% assign has_lts_releases = true %}
                {% assign lts_link = '&nbsp;(<a href="release-support-policy.html">LTS</a>)&nbsp;' %}
                {% capture lts_patch_string %}{{ v.initial_lts_patch | split: '.' | shift | shift }}{% endcapture %}
                {% assign lts_patch = lts_patch_string | times: 1 %}
                
                {% comment %} Check if we're in the LTS period for this version {% endcomment %}
                {% if v.initial_lts_release_date != "N/A" and v.initial_lts_release_date <= current_date %}
                    {% assign in_lts_period = true %}
                {% endif %}
                
                {% comment %} For LTS versions, update support based on LTS dates {% endcomment %}
                {% if v.lts_asst_supp_exp_date != "N/A" and v.lts_asst_supp_exp_date > current_date %}
                    {% assign is_supported = true %}
                {% endif %}
            {% endif %}
        {% endif %}
    {% endif %}

{% comment %} Only display supported versions {% endcomment %}
{% if is_supported or released==false %}

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
    is_innovation: {{ is_innovation }}<br />
    in_lts_period: {{ in_lts_period }}<br />
    ga_support_expired: {{ ga_support_expired }}<br /><br />
{% endif %}

{% if released == false %}
CockroachDB {{ page.major_version }} is in active development and is not yet supported. The following [testing releases]({% link releases/index.md %}#release-types) are intended for testing and experimentation only, and are not qualified for production environments or eligible for support or uptime SLA commitments. When CockroachDB {{ page.major_version }} is Generally Available (GA), production releases will also be announced on this page.
{% else %}
CockroachDB {{ v.major_version }} is {% if is_innovation == true %}an [Innovation release]({% link releases/release-support-policy.md %}#innovation-releases) that is optional for CockroachDB {{ site.data.products.advanced }}, CockroachDB {{ site.data.products.standard }}, and CockroachDB {{ site.data.products.core }} but required for CockroachDB {{ site.data.products.basic }}.{% else %}a required [Regular release]({% link releases/release-support-policy.md %}#regular-releases).{% endif %}{% if released == false %} It is still in development and not yet supported.{% endif %}{% unless latest_full_production_version.release_name != v.major_version %} CockroachDB {{ latest_full_production_version.release_name }} is the latest supported version.{% endunless %} To learn more, refer to [CockroachDB {{ latest.major_version }} Release Notes]({% link releases/{{ v.major_version }}.md %}).

{% endif %}

Refer to [Major release types](#major-releases) before installing or upgrading for release support details.
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
To learn what's new in this release, refer to [Feature Highlights]({% link releases/{{ v.major_version }}.md %}#feature-highlights).
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

        {% comment %} Filter the releases to only include supported ones {% endcomment %}
        {% assign supported_releases = "" | split: "" %}
        {% for r in releases %}
            {% assign is_release_supported = false %}
            
            {% comment %} For versions with LTS  {% endcomment %}
            {% if has_lts_releases and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}
                
                {% if in_lts_period and ga_support_expired %}
                    {% comment %} We are in LTS period, only show LTS releases {% endcomment %}
                    {% if current_patch >= lts_patch %}
                        {% comment %} This is an LTS release, check against LTS dates {% endcomment %}
                        {% if v.lts_asst_supp_exp_date > current_date %}
                            {% assign is_release_supported = true %}
                        {% endif %}
                    {% endif %}
                {% else %}
                    {% comment %} Not yet in LTS period, check regular support dates {% endcomment %}
                    {% if v.asst_supp_exp_date > current_date %}
                        {% assign is_release_supported = true %}
                    {% endif %}
                {% endif %}
            {% elsif is_innovation %}
                {% comment %} For innovation releases, only show if within maintenance support {% endcomment %}
                {% if v.maint_supp_exp_date > current_date %}
                    {% assign is_release_supported = true %}
                {% endif %}
            {% else %}
                {% comment %} For regular releases, show if within assistance support {% endcomment %}
                {% if v.asst_supp_exp_date > current_date %}
                    {% assign is_release_supported = true %}
                {% endif %}
            {% endif %}
            
            {% comment %} Don't include withdrawn releases in the supported list {% endcomment %}
            {% if r.withdrawn != true and is_release_supported %}
                {% assign supported_releases = supported_releases | push: r %}
            {% endif %}
        {% endfor %}

        {% comment %}Do a separate loop through the filtered releases and for each release, copy some fields into some local v_ variables to use when we are not in a loop below{% endcomment %}
        {% assign v_linux_arm = false %}
        {% for r in supported_releases %}
            {% if r.linux.linux_arm == true %}
                {% assign v_linux_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% assign v_mac_arm = false %}
        {% for r in supported_releases %}
            {% if r.mac.mac_arm == true %}
                {% assign v_mac_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% assign v_docker_arm = false %}
        {% for r in supported_releases %}
            {% if r.docker.docker_arm == true %}
                {% assign v_docker_arm = true %}
                {% break %}
            {% endif %}
        {% endfor %}

        {% if supported_releases.size > 0 %}

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
            {% for r in supported_releases %}

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
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}{% comment %} Add link to each release r, decorate with link about LTS if applicable. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                {% if r.withdrawn == true %} {% comment %} Suppress download links for withdrawn releases. {% endcomment %}
            <td colspan="{% if v_linux_arm == true %}2{% else %}1{% endif %}"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                  {% continue %}
                {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="{% if v_linux_arm == true %}2{% else %}1{% endif %}"><span>{{ r.cloud_only_message_short }}</span></td>
                  {% continue %}
                {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td colspan="{% if v_linux_arm == true %}2{% else %}1{% endif %}"><span>{{ is_not_downloadable_message }}</span></td>
                  {% continue %}
                {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>{% endif %})</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
                {% endif %}
                {% if r.linux.linux_arm == true and v_linux_arm == true %}
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
        {% for r in supported_releases %}
            {% assign current_patch_string = '' %}
            {% assign current_patch = nil %}
            {% assign in_lts = false %}
            {% if has_lts_releases == true and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}
                {% assign comparison = current_patch | minus: lts_patch %}
                {% unless comparison < 0 %}
                    {% assign in_lts = true %}
                {% endunless %}
            {% endif %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %} {% comment %} Add link to each release r and LTS indicator if applicable. {% endcomment %}
                {% if r.release_name == latest_hotfix.release_name %}
                <span class="badge-new">Latest</span> {% comment %} Add "Latest" badge to release if it's the latest release. {% endcomment %}
                {% endif %}
            </td>
            <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
            {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
            <td colspan="{% if v_mac_arm == true %}2{% else %}1{% endif %}"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
              {% continue %}
            {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
            <td colspan="{% if v_mac_arm == true %}2{% else %}1{% endif %}"><span>{{ r.cloud_only_message_short }}</span></td>
              {% continue %}
            {% elsif r.is_not_downloadable == true %} {% comment %} Suppress download links for outdated versions. {% endcomment %}
            <td colspan="{% if v_mac_arm == true %}2{% else %}1{% endif %}"><span>{{ is_not_downloadable_message }}</span></td>
                  {% continue %}
            {% else %} {% comment %} Add download links for all non-withdrawn versions. {% endcomment %}
            <td>
                <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% if r.has_sql_only == true %}
                <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">SQL shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div> {% comment %} If a sha256sum is available for a particular release, we display a link to the file containing the sha256sum alongside the download link of the release. {% endcomment %}
                    {% endif %}
            {% endif %}
            {% if r.mac.mac_arm == true and v_mac_arm == true %}
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
        {% for r in supported_releases %}
            {% assign current_patch_string = '' %}
            {% assign current_patch = nil %}
            {% assign in_lts = false %}
            {% if has_lts_releases == true and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}
                {% assign comparison = current_patch | minus: lts_patch %}
                {% unless comparison < 0 %}
                    {% assign in_lts = true %}
                {% endunless %}
            {% endif %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %} {% comment %} Add link to each release r and LTS indicator if applicable. {% endcomment %}
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
        {% for r in supported_releases %}

            {% assign current_patch_string = '' %}
            {% assign current_patch = nil %}
            {% assign in_lts = false %}
            {% if has_lts_releases == true and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}
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
".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}{% comment %} Add link to each release r with LTS indicator if applicable.{% endcomment %}
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
        {% for r in supported_releases %}
            {% assign current_patch_string = '' %}
            {% assign current_patch = nil %}
            {% assign in_lts = false %}
            {% if has_lts_releases == true and s == "Production" %}
                {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                {% assign current_patch = current_patch_string | times: 1 %}
                {% assign comparison = current_patch | minus: lts_patch %}
                {% unless comparison < 0 %}
                    {% assign in_lts = true %}
                {% endunless %}
            {% endif %}

        <tr {% if r.release_name == latest_hotfix.release_name %}class="latest"{% endif %}> {% comment %} Add "Latest" class to release if it's the latest release. {% endcomment %}
            <td>
                <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}{% comment %} Add link to each release r and LTS indicator if applicable {% endcomment %}
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


        {% endif %} {% comment %}if supported_releases.size > 0{% endcomment %}
    {% endfor %} {% comment %}for s in sections {% endcomment %}
{% endif %} {% comment %}if is_supported{% endcomment %}
{% endfor %} {% comment %}for v in versions{% endcomment %}

## Licenses

All binaries available on this page released on or after the day 24.3.0 is released onward, including patch fixes for versions 23.1-24.2, are made available under the [CockroachDB Software License](https://www.cockroachlabs.com/cockroachdb-software-license).

All binaries available on this page released prior to the release date of 24.3.0 are variously licensed under the Business Source License 1.1 (BSL), the CockroachDB Community License (CCL), and other licenses specified in the source code.

To review the CCL, refer to the [CockroachDB Community License](https://www.cockroachlabs.com/cockroachdb-community-license) page. You can find the applicable Business Source License or third party licenses by reviewing these in the `licenses` folder for the applicable version of CockroachDB in the GitHub repository [cockroachdb/cockroach](https://github.com/cockroachdb/cockroach). See individual files for details.

In late 2024, Cockroach Labs retired its Core offering to consolidate on a single CockroachDB Enterprise offering under the CockroachDB Software License. This license is available at no charge for individual users and small businesses, and offers all users, free and paid, the full breadth of CockroachDB capabilities. For details, refer to the [CockroachDB licensing update](https://www.cockroachlabs.com/enterprise-license-update/) and [Licensing FAQs]({% link {{site.versions["stable"]}}/licensing-faqs.md %}).

## Unsupported versions 

Release notes for CockroachDB versions that are no longer supported are available on the [Unsupported Versions]({% link releases/unsupported-versions.md %}) page.
