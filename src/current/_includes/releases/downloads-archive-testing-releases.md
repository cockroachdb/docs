{% comment %}
This include generates testing release download tables for the downloads archive page.
It should only be shown when a GA release has cloud_only: true (between Cloud GA and binary GA).
Parameters:
  - major_version: The major version to generate testing releases for (e.g., "v26.2")
{% endcomment %}

{% comment %} Fetch all Testing releases for this major version {% endcomment %}
{% assign all_testing = site.data.releases | where_exp: "r", "r.major_version == include.major_version" | where_exp: "r", "r.release_type == 'Testing'" | sort: "release_date" | reverse %}

{% comment %} Filter out withdrawn releases by manually building the array {% endcomment %}
{% assign testing_releases = "" | split: "" %}
{% for r in all_testing %}
    {% if r.withdrawn != true %}
        {% assign testing_releases = testing_releases | push: r %}
    {% endif %}
{% endfor %}

{% if testing_releases.size > 0 %}

#### Testing Releases

{{site.data.alerts.callout_danger}}
Testing releases are not qualified for production use and not eligible for support or uptime SLA commitments.
{{site.data.alerts.end}}

{% comment %}Assign the JS for the experimental download prompt{% endcomment %}
{% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}
{% capture onclick_string %}onclick="{{ experimental_download_js }}"{% endcapture %}

<div id="os-tabs" class="filters filters-big clearfix">
    <button id="linux" class="filter-button" data-scope="linux">Linux</button>
    <button id="mac" class="filter-button" data-scope="mac">Mac</button>
    <button id="windows" class="filter-button" data-scope="windows">Windows</button>
    <button id="docker" class="filter-button" data-scope="docker">Docker</button>
    <button id="source" class="filter-button" data-scope="source">Source</button>
</div>

{% comment %}Determine if any testing releases have ARM support{% endcomment %}
{% assign has_linux_arm = false %}
{% assign has_mac_arm = false %}
{% assign has_docker_arm = false %}
{% for r in testing_releases %}
    {% if r.linux.linux_arm == true %}
        {% assign has_linux_arm = true %}
    {% endif %}
    {% if r.mac.mac_arm == true %}
        {% assign has_mac_arm = true %}
    {% endif %}
    {% if r.docker.docker_arm == true %}
        {% assign has_docker_arm = true %}
    {% endif %}
{% endfor %}

<section class="filter-content" markdown="1" data-scope="linux">

<table class="release-table">
<thead>
    <tr>
        <td>Version</td>
        <td>Date</td>
        <td>Intel 64-bit Downloads</td>
        {% if has_linux_arm == true %}
        <td>ARM 64-bit Downloads</td>
        {% endif %}
    </tr>
</thead>
<tbody>
{% for r in testing_releases %}
    <tr>
        <td>
            {{ r.release_name }}
        </td>
        <td>{{ r.release_date }}</td>
        <td>
            <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% if r.has_sql_only == true %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% endif %}
        </td>
        {% if r.linux.linux_arm == true and has_linux_arm == true %}
        <td>
            {% if r.linux.linux_arm_experimental == true %}<b>Experimental:</b>{% endif %}
            <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% if r.has_sql_only == true %}
            <div><a {% if r.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% endif %}
        </td>
        {% elsif has_linux_arm == true %}
        <td>N/A</td>
        {% endif %}
    </tr>
{% endfor %}
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
        {% if has_mac_arm == true %}
        <td>ARM 64-bit (Experimental) Downloads</td>
        {% endif %}
    </tr>
</thead>
<tbody>
{% for r in testing_releases %}
    <tr>
        <td>
            {{ r.release_name }}
        </td>
        <td>{{ r.release_date }}</td>
        <td>
            <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% if r.has_sql_only == true %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% endif %}
        </td>
        {% if r.mac.mac_arm == true and has_mac_arm == true %}
        <td>
            <div><a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% if r.has_sql_only == true %}
            <div><a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% endif %}
        </td>
        {% elsif has_mac_arm == true %}
        <td>N/A</td>
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
{% for r in testing_releases %}
    <tr>
        <td>
            {{ r.release_name }}
        </td>
        <td>{{ r.release_date }}</td>
        <td>
            {% if r.windows == true %}
            <div><a {{ onclick_string }} href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip" class="binary-link">Full Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% if r.has_sql_only == true %}
            <div><a {{ onclick_string }} href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip" class="binary-link">SQL Shell Binary</a>{% if r.has_sha256sum == true %} (<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}</div>
            {% endif %}
            {% else %}
            N/A
            {% endif %}
        </td>
    </tr>
{% endfor %}
</tbody>
</table>
</section>

<section class="filter-content" markdown="1" data-scope="docker">

Docker images for CockroachDB are published on [Docker Hub](https://hub.docker.com/r/cockroachdb/cockroach/tags).

<table class="release-table">
<thead>
    <tr>
        <td>Version</td>
        <td>Date</td>
        <td>Docker image tag</td>
    </tr>
</thead>
<tbody>
{% for r in testing_releases %}
    <tr>
        <td>
            {{ r.release_name }}
        </td>
        <td>{{ r.release_date }}</td>
        <td>
            {% if r.source == false %}
            N/A
            {% else %}
            <code>{{ r.docker.docker_image }}:{{ r.release_name }}</code>
            {% endif %}
        </td>
    </tr>
{% endfor %}
</tbody>
</table>
</section>

<section class="filter-content" markdown="1" data-scope="source">
<table class="release-table">
<thead>
    <tr>
        <td>Version</td>
        <td>Date</td>
        <td>Source</td>
    </tr>
</thead>
<tbody>
{% for r in testing_releases %}
    <tr>
        <td>
            {{ r.release_name }}
        </td>
        <td>{{ r.release_date }}</td>
        <td>
            {% if r.source == true %}
            {% else %}
            N/A
            {% endif %}
        </td>
    </tr>
{% endfor %}
</tbody>
</table>
</section>

{% endif %}
