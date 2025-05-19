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
{% assign current_date = 'now' | date: '%Y-%m-%d' %}

{% for v in versions %} {% comment %} Iterate through all major versions {% endcomment %}

    {% comment %}
      Determine if the major version is unsupported or has unsupported releases
    {% endcomment %}
    {% assign released = false %}
    {% assign has_lts_releases = false %}
    {% assign lts_link = '' %}
    {% assign lts_patch = nil %}
    {% assign is_unsupported = false %}
    {% assign has_unsupported_releases = false %}
    {% assign is_innovation = false %}
    {% assign in_lts_period = false %}
    {% assign ga_support_expired = false %}
    {% assign version_past_binary_removal_date = false %}
    
    {% comment %} Check if the version is past its binary removal date {% endcomment %}
    {% if v.binary_removal_date != "N/A" and v.binary_removal_date <= current_date %}
        {% assign version_past_binary_removal_date = true %}
    {% endif %}
    
    {% comment %} Check if the version has been released {% endcomment %}
    {% if v.release_date != "N/A" and v.maint_supp_exp_date != "N/A" %}
        {% assign released = true %}
        
        {% comment %} Check if this is an innovation release {% endcomment %}
        {% if v.asst_supp_exp_date == "N/A" %}
            {% assign is_innovation = true %}
            
            {% comment %} For innovation releases, check if past maintenance support {% endcomment %}
            {% if v.maint_supp_exp_date <= current_date %}
                {% assign is_unsupported = true %}
            {% endif %}
        {% else %}
            {% comment %} For regular releases, check if past assistance support {% endcomment %}
            {% if v.asst_supp_exp_date <= current_date %}
                {% assign ga_support_expired = true %}
                
                {% comment %} If no LTS or LTS has also expired, it's completely unsupported {% endcomment %}
                {% if v.lts_asst_supp_exp_date == "N/A" or v.lts_asst_supp_exp_date <= current_date %}
                    {% assign is_unsupported = true %}
                {% endif %}
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
                    
                    {% comment %} In LTS period with expired GA support means pre-LTS patches are unsupported {% endcomment %}
                    {% if ga_support_expired %}
                        {% assign has_unsupported_releases = true %}
                    {% endif %}
                {% endif %}
            {% endif %}
        {% endif %}
    {% endif %}
    
    {% comment %} Only handle released versions (ignore future versions) {% endcomment %}
    {% if released %}
        {% comment %} Show this major version if it's unsupported or has unsupported releases {% endcomment %}
        {% if is_unsupported or has_unsupported_releases %}
        
### {{ v.major_version }}

            {% if is_unsupported %}
CockroachDB {{ v.major_version }} is completely unsupported. {% if is_innovation %}This was an Innovation release{% else %}This was a Regular release{% endif %} that reached end-of-support on {% if is_innovation %}{{ v.maint_supp_exp_date }}{% else %}{{ v.asst_supp_exp_date }}{% endif %}.
            {% else %}
CockroachDB {{ v.major_version }} is partially supported. Pre-LTS patches (before {{ v.initial_lts_patch }}) are no longer supported, but LTS patches ({{ v.initial_lts_patch }} and later) are still covered under the LTS support policy until {{ v.lts_asst_supp_exp_date }}.
            {% endif %}

<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

            {% for s in sections %} {% comment %} For each major version, iterate through the sections. {% endcomment %}
        
                {% assign releases = site.data.releases | where_exp: "releases", "releases.major_version == v.major_version" | where_exp: "releases", "releases.release_type == s" | sort: "release_date" | reverse %} {% comment %} Fetch all releases for that major version based on release type (Production/Testing). {% endcomment %}
        
                {% comment %} Filter the releases to only include unsupported ones {% endcomment %}
                {% assign unsupported_releases = "" | split: "" %}
                {% for r in releases %}
                    {% assign is_release_unsupported = false %}
                    
                    {% if is_unsupported %}
                        {% comment %} If the whole version is unsupported, all releases are unsupported {% endcomment %}
                        {% assign is_release_unsupported = true %}
                    {% elsif has_lts_releases and s == "Production" and in_lts_period and ga_support_expired %}
                        {% capture current_patch_string %}{{ r.release_name | split: '.' | shift | shift }}{% endcapture %}
                        {% assign current_patch = current_patch_string | times: 1 %}
                        
                        {% if current_patch < lts_patch %}
                            {% comment %} Pre-LTS patches are unsupported in LTS period if GA support expired {% endcomment %}
                            {% assign is_release_unsupported = true %}
                        {% endif %}
                    {% endif %}
                    
                    {% comment %} Don't include withdrawn releases in the unsupported list {% endcomment %}
                    {% if r.withdrawn != true and is_release_unsupported %}
                        {% assign unsupported_releases = unsupported_releases | push: r %}
                    {% endif %}
                {% endfor %}
        
                {% comment %}Do a separate loop through the filtered releases and for each release, copy some fields into some local v_ variables to use when we are not in a loop below{% endcomment %}
                {% assign v_linux_arm = false %}
                {% for r in unsupported_releases %}
                    {% if r.linux.linux_arm == true %}
                        {% assign v_linux_arm = true %}
                        {% break %}
                    {% endif %}
                {% endfor %}
        
                {% assign v_mac_arm = false %}
                {% for r in unsupported_releases %}
                    {% if r.mac.mac_arm == true %}
                        {% assign v_mac_arm = true %}
                        {% break %}
                    {% endif %}
                {% endfor %}
        
                {% assign v_docker_arm = false %}
                {% for r in unsupported_releases %}
                    {% if r.docker.docker_arm == true %}
                        {% assign v_docker_arm = true %}
                        {% break %}
                    {% endif %}
                {% endfor %}
        
                {% if unsupported_releases.size > 0 %}
        
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
                    {% for r in unsupported_releases %}
        
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
        
                <tr>
                    <td>
                        <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}
                    </td>
                   
                    <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                        {% if r.withdrawn == true %} {% comment %} Suppress download links for withdrawn releases. {% endcomment %}
                    <td colspan="{% if v_linux_arm == true %}2{% else %}1{% endif %}"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                          {% continue %}
                        {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
                    <td colspan="{% if v_linux_arm == true %}2{% else %}1{% endif %}"><span>{{ r.cloud_only_message_short }}</span></td>
                          {% continue %}
                        {% elsif version_past_binary_removal_date == true %} {% comment %} Suppress download links if past binary removal date. {% endcomment %}
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
                            {% if r.withdrawn == true or r.cloud_only == true or version_past_binary_removal_date == true %}
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
                {% for r in unsupported_releases %}
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
        
                <tr>
                    <td>
                        <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}
                    </td>
                   
                    <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                    {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                    <td colspan="{% if v_mac_arm == true %}2{% else %}1{% endif %}"><span class="badge badge-gray">Withdrawn</span></td>{% comment %}covers both Intel and ARM columns {% endcomment %}
                      {% continue %}
                    {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
                    <td colspan="{% if v_mac_arm == true %}2{% else %}1{% endif %}"><span>{{ r.cloud_only_message_short }}</span></td>
                      {% continue %}
                    {% elsif version_past_binary_removal_date == true %} {% comment %} Suppress download links if past binary removal date. {% endcomment %}
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
                        {% if r.withdrawn == true or r.cloud_only == true  or version_past_binary_removal_date == true %}
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
                {% for r in unsupported_releases %}
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
        
                <tr>
                    <td>
                        <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}
                    </td>
                   
                    <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                        {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                    <td><span class="badge badge-gray">Withdrawn</span></td>
                          {% continue %}
                        {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
                    <td><span>{{ r.cloud_only_message_short }}</span></td>
                          {% continue %}
                        {% elsif  version_past_binary_removal_date == true %} {% comment %} Suppress download links if past binary removal date. {% endcomment %}
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
                {% for r in unsupported_releases %}
        
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
        
                <tr>
        
                    {% comment %}Version column{% endcomment %}
                    <td><a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace:
        ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}
                    </td>
        
                    {% comment %}Support Status column{% endcomment %}
                   
        
                    {% comment %}Release Date column{% endcomment %}
                    <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
        
                    {% comment %}Docker Image Tag column{% endcomment %}
                    <td>
                    {% if r.withdrawn == true %}
                        <span class="badge badge-gray">Withdrawn</span></td>{% comment %} Suppress download links for withdrawn releases, spans Intel and ARM columns {% endcomment %}
                    {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases, spans Intel and ARM columns {% endcomment %}
                        <span>{{ r.cloud_only_message_short }}</span></td>
                    {% elsif version_past_binary_removal_date == true %} {% comment %} Suppress download links if past binary removal date. {% endcomment %}
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
                {% for r in unsupported_releases %}
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
        
                <tr>
                    <td>
                        <a href="{% link releases/{{ v.major_version }}.md %}#{{ r.release_name | replace: ".", "-" }}" class="binary-link">{{ r.release_name }}</a>{% if in_lts %}{{ lts_link }}{% endif %}
                    </td>
                   
                    <td>{{ r.release_date }}</td> {% comment %} Release date of the release. {% endcomment %}
                    {% if r.withdrawn == true %} {% comment %} Suppress withdrawn releases. {% endcomment %}
                    <td><span class="badge badge-gray">Withdrawn</span></td>
                      {% continue %}
                    {% elsif r.cloud_only == true %} {% comment %} Suppress download links for Cloud-first releases {% endcomment %}
                    <td><span>{{ r.cloud_only_message_short }}</span></td>
                        {% continue %}
                    {% elsif version_past_binary_removal_date == true %} {% comment %} Suppress download links if past binary removal date. {% endcomment %}
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
        
        
                {% endif %} {% comment %}if unsupported_releases.size > 0{% endcomment %}
            {% endfor %} {% comment %}for s in sections {% endcomment %}
        {% endif %} {% comment %}if is_unsupported or has_unsupported_releases{% endcomment %}
    {% endif %} {% comment %}if released{% endcomment %}
{% endfor %} {% comment %}for v in versions{% endcomment %}