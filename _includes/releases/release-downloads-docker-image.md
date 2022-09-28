{% assign release = site.data.releases | where_exp: "release", "release.version == include.release" | first %}
{% assign version = site.data.versions | where_exp: "version", "version.major_version == release.major_version" | first %}

{% comment %} set the release and version based on the include.release parameter {% endcomment %}

{% if release.withdrawn == "true" %}{% comment %} if the release is withdrawn, automatically disable the download links and Docker image {% endcomment %}
<h3 id="{{ release.version | downcase | replace: ".", "-" }}-downloads">Downloads</h3>{% comment %} take the version name, force it to be lowercase, and replace all periods with hyphens. {% endcomment %}
{{site.data.alerts.callout_danger}}
This patch release has been withdrawn{% if include.advisory_key %} due to [this technical advisory](../advisories/{{ include.advisory_key }}.html){% endif %}. All the changes listed as part of this release will be in the next release. Do not upgrade to this release.
{{site.data.alerts.end}}

<h3 id="{{ release.version | downcase | replace: ".", "-" }}-docker-image">Docker image</h3>{% comment %} we use a manual <h3> tag here to account for the duplicated headers {% endcomment %}

{{site.data.alerts.callout_danger}}
This release was withdrawn, and we've removed the links to the downloads and Docker image.
{{site.data.alerts.end}}
{% else %}
<h3 id="{{ release.version | downcase | replace: ".", "-" }}-downloads">Downloads</h3>

{% if release.has_sql_only != "false" %}
<h4>Full CockroachDB executable</h4>
{% endif %}

{% comment %}Assign the JS for the experimental download prompt and store it in the Liquid variable experimental_download_js {% endcomment %}
{% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}

<div><div id="os-tabs" class="filters clearfix">
{% if release.linux_arm == "false" %}
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>
{% else %}
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>
    <a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.linux-3.7.10-gnu-aarch64.tgz"><button id="linux-arm" class="filter-button" data-scope="linux-arm" data-eventcategory="linux-binary-release-notes">Linux ARM<br/>(<b>Experimental</b>)</button></a>
{% endif %}
    <a href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.darwin-10.9-amd64.tgz"><button id="mac" class="filter-button" data-scope="mac" data-eventcategory="mac-binary-release-notes">Mac</button></a>
    <a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-{{ release.version }}.windows-6.2-amd64.zip"><button id="windows" class="filter-button" data-scope="windows" data-eventcategory="windows-binary-release-notes">Windows</button></a>
    <a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.version }}"><button id="source" class="filter-button" data-scope="source" data-eventcategory="source-release-notes">Source</button></a
</div></div>

{% if release.has_sql_only != "false" %}
<h4>SQL-only command-line client executable</h4>

<div><div id="os-tabs" class="filters clearfix">
{% if release.linux_arm == "false" %}
    <a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.version }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>
{% else %}
    <a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.version }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>
    <a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.version }}.linux-3.7.10-gnu-aarch64.tgz"><button id="linux-arm" class="filter-button" data-scope="linux-arm" data-eventcategory="linux-binary-release-notes">Linux ARM<br/>(<b>Experimental</b>)</button></a>
{% endif %}
    <a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.version }}.darwin-10.9-amd64.tgz"><button id="mac" class="filter-button" data-scope="mac" data-eventcategory="mac-binary-release-notes">Mac</button></a>
    <a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.version }}.windows-6.2-amd64.zip"><button id="windows" class="filter-button" data-scope="windows" data-eventcategory="windows-binary-release-notes">Windows</button></a>
    <a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.version }}"><button id="source" class="filter-button" data-scope="source" data-eventcategory="source-release-notes">Source</button></a
</div></div>
{% endif %}

<section class="filter-content" data-scope="windows">
{% include_cached windows_warning.md %}
</section>

{% if release.release_type == "Testing" %}{% include releases/experimental-test-release.md %}{% endif %}{% comment %} warn users about using testing releases for production environments {% endcomment %}

<h3 id="{{ release.version | downcase | replace: ".", "-" }}-docker-image">Docker image</h3>

{% include_cached copy-clipboard.html %}
~~~shell
$ docker pull {{ release.docker_image }}:{{ release.version }}
~~~
{% endif %}
