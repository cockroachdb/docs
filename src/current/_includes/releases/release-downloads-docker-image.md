{% comment %}This include is used only in v22.2 and below. Older versions use release-downloads-docker-image.md. {% endcomment %}
{% assign release = site.data.releases | where_exp: "release", "release.release_name == include.release" | first %}
{% assign version = site.data.versions | where_exp: "version", "version.major_version == release.major_version" | first %}

<h3 id="{{ release.release_name | downcase | replace: ".", "-" }}-downloads">Downloads</h3>{% comment %} take the version name, force it to be lowercase, and replace all periods with hyphens. {% endcomment %}

{% if release.release_type == "Testing" %}
{% include releases/experimental-test-release.md version=release.release_name %}
{% endif %}

{% if release.withdrawn == true %}
{% include releases/withdrawn.md %}
{% elsif release.cloud_only == true %} {% comment %}Show the Cloud-first info instead of download links {% endcomment %}
{{site.data.alerts.callout_info}}
{{ r.cloud_only_message }}
{{site.data.alerts.end}}
{% else %}

{{site.data.alerts.callout_info}}
Experimental downloads are not qualified for production use and not eligible for support or uptime SLA commitments, whether they are for testing releases or production releases.
{{site.data.alerts.end}}

<h4>Full CockroachDB executable</h4>

{% comment %}Assign the JS for the experimental download prompt and store it in the Liquid variable experimental_download_js {% endcomment %}
  {% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}
  {% capture onclick_string %}onclick="{{ experimental_download_js }}"{% endcapture %}

<div><div class="os-tabs" class="filters clearfix">
<a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>

  {% if release.linux.linux_arm == true %}
    {% capture linux_arm_button_text_addendum %}{% if r.linux.linux_arm_experimental == true %}<br />(Experimental){% endif %}{% if r.linux.linux_arm_limited_access == true %}<br />(Limited Access){% endif %}{% endcapture %}

<a {% if release.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.linux-arm64.tgz"><button id="linux-arm" class="filter-button" data-scope="linux-arm" data-eventcategory="linux-binary-release-notes">Linux ARM{{linux_arm_button_text_addendum}}</button></a>

  {% endif %}

<a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.darwin-10.9-amd64.tgz"><button id="mac-intel" class="filter-button" data-scope="mac-intel" data-eventcategory="mac-binary-release-notes">Mac Intel<br />(Experimental)</button></a>

<a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.darwin-11.0-arm64.tgz"><button id="mac-arm" class="filter-button" data-scope="mac-arm" data-eventcategory="mac-binary-release-notes">Mac ARM<br />(Experimental)</button></a>

<a {{ onclick_string }} href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.windows-6.2-amd64.zip"><button id="windows" class="filter-button" data-scope="windows" data-eventcategory="windows-binary-release-notes">Windows<br />(Experimental)</b></button></a>
<a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.release_name }}"><button id="source" class="filter-button" data-scope="source" data-eventcategory="source-release-notes">Source</button></a
</div></div>

  {% if release.has_sql_only == true %}
<h4>SQL-only command-line client executable</h4>
<div><div id="os-tabs" class="filters clearfix">

<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.linux-amd64.tgz"><button id="linux-intel" class="filter-button" data-scope="linux-intel" data-eventcategory="linux-binary-release-notes">Linux Intel</button></a>
    {% if release.linux.linux_arm == true %}

<a {% if release.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %} href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.linux-arm64.tgz"><button id="linux-arm" class="filter-button" data-scope="linux-arm" data-eventcategory="linux-binary-release-notes">Linux ARM{{linux_arm_button_text_addendum}}</button></a>

    {% endif %}

<a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.darwin-10.9-amd64.tgz"><button id="mac" class="filter-button" data-scope="mac-intel" data-eventcategory="mac-binary-release-notes">Mac Intel<br />(Experimental)</button></a>
    {% if release.mac.mac_arm == true %}

<a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.darwin-11.0-arm64.tgz"><button id="mac-arm" class="filter-button" data-scope="mac-arm" data-eventcategory="mac-binary-release-notes">Mac ARM<br />(Experimental)</button></a>

    {% endif %}

<a onclick="{{ experimental_download_js }}" href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.windows-6.2-amd64.zip"><button id="windows" class="filter-button" data-scope="windows" data-eventcategory="windows-binary-release-notes">Windows<br />(Experimental)</button></a>
<a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.release_name }}"><button id="source" class="filter-button" data-scope="source" data-eventcategory="source-release-notes">Source</button></a
</div></div>

  {% endif %}

<section class="filter-content" markdown="1" data-scope="windows">
{% include_cached windows_warning.md %}
</section>

<h3 id="{{ release.release_name | downcase | replace: ".", "-" }}-docker-image">Docker image</h3>

  {% if release.docker.docker_arm == true %}
[Multi-platform images](https://docs.docker.com/build/building/multi-platform/) include support for both Intel and ARM. Multi-platform images do not take up additional space on your Docker host.

    {% if release.docker.docker_arm_limited_access == true %}
Within the multi-platform image:<ul><li>The ARM image is in **Limited Access**.</li><li>The Intel image is **Generally Available** for production use.</li></ul>
    {% elsif release.docker.docker_arm_experimental == true %}
Within the multi-platform image:<ul><li>The ARM image is **Experimental** and not yet qualified for production use and not eligible for support or uptime SLA commitments.</li><li>The Intel image is **Generally Available** for production use.</li></ul>
    {% else %}
Within the multi-platform image, both Intel and ARM images are **generally available** for production use.
    {% endif %}

To download the Docker image:
  {% else %}
To download the Docker image (Intel-only):
  {% endif %}

{% include_cached copy-clipboard.html %}
~~~shell
docker pull {{ release.docker.docker_image }}:{{ release.release_name }}
~~~

  {% if release.previous_release %}
<h3 id="{{ release.release_name | downcase | replace: ".", "-" }}-changelog">Changelog</h3>
View a detailed changelog on GitHub: [{{ release.previous_release }}...{{ release.release_name }}](https://github.com/cockroachdb/cockroach/compare/{{ release.previous_release }}...{{ release.release_name }})
  {% endif %}

{% endif %}
