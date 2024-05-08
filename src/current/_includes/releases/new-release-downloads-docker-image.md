{% comment %}This include is used only in v23.1 and above. Newer versions use release-downloads-docker-image.md. {% endcomment %}
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

{% comment %}Assign the JS for the experimental download prompt and store it in the Liquid variable experimental_download_js {% endcomment %}
  {% capture experimental_download_js %}{% include_cached releases/experimental_download_dialog.md %}{% endcapture %}
  {% capture onclick_string %}onclick="{{ experimental_download_js }}"{% endcapture %}
  {% capture linux_arm_button_text_addendum %}{% if r.linux.linux_arm_experimental == true %}<br />(Experimental){% endif %}{% if r.linux.linux_arm_limited_access == true %}<br />(Limited Access){% endif %}{% endcapture %}

<div><div class="os-tabs filters clearfix">

<table style="max-width: 90%;">
  <thead>
    <tr>
      <th>Operating System</th>
      <th style="width: 100px !important;">Architecture</th>
      <th>Full executable</th>
      <th>SQL-only executable</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td rowspan="2">Linux</td>
      <td>Intel</td>
      <td><a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.linux-amd64.tgz">cockroach-{{ release.release_name }}.linux-amd64.tgz</a> {% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</td>
      <td>{% if release.has_sql_only == true %}<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.linux-amd64.tgz">cockroach-sql-{{ release.release_name }}.linux-amd64.tgz</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}{% endif %}</td>
    </tr>
    <tr>
      <td>ARM</td>
      <td><a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.linux-arm64.tgz" {% if release.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %}>cockroach-{{ release.release_name }}.linux-arm64.tgz {{linux_arm_button_text_addendum}}</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>{% endif %})</td>
      <td>{% if release.has_sql_only == true %}<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.linux-arm64.tgz" {% if release.linux.linux_arm_experimental == true %}{{ onclick_string }}{% endif %}>cockroach-sql-{{ release.release_name }}.linux-arm64.tgz {{linux_arm_button_text_addendum}}</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.linux-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}{% endif %}</td>
    </tr>
    <tr>
      <td rowspan="2">Mac<br />(Experimental)</td>
      <td>Intel</td>
      <td><a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.darwin-10.9-amd64.tgz" {% if release.mac.linux_arm_experimental == true %}{{ onclick_string }}{% endif %}>cockroach-{{ release.release_name }}.darwin-10.9-amd64.tgz</a> {% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</td>
      <td>{% if release.has_sql_only == true %}<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.darwin-10.9-amd64.tgz" {% if release.mac.linux_arm_experimental == true %}{{ onclick_string }}{% endif %}>cockroach-sql-{{ release.release_name }}.darwin-10.9-amd64.tgz</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-10.9-amd64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}{% endif %}</td>
    </tr>
    <tr>
      <td>ARM</td>
      <td><a href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.darwin-11.0-arm64.tgz" {{ onclick_string }}>cockroach-{{ release.release_name }}.darwin-11.0-arm64.tgz</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}</td>
      <td>{% if release.has_sql_only == true %}<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.darwin-11.0-arm64.tgz" {% if release.mac.linux_arm_experimental == true %}{{ onclick_string }}{% endif %}>cockroach-sql-{{ release.release_name }}.darwin-11.0-arm64.tgz</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.darwin-11.0-arm64.tgz.sha256sum" class="binary-link">SHA256</a>){% endif %}{% endif %}</td>
    </tr>
    <tr>
      <td>Windows<br />(Experimental)</td>
      <td>Intel</td>
      <td><a {{ onclick_string }} href="https://binaries.cockroachdb.com/cockroach-{{ release.release_name }}.windows-6.2-amd64.zip">cockroach-{{ release.release_name }}.windows-6.2-amd64.zip</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}</td>
      <td>{% if release.has_sql_only == true %}<a {{ onclick_string }} href="https://binaries.cockroachdb.com/cockroach-sql-{{ release.release_name }}.windows-6.2-amd64.zip">cockroach-sql-{{ release.release_name }}.windows-6.2-amd64.zip</a>{% if r.has_sha256sum == true %}<br />(<a href="https://binaries.cockroachdb.com/cockroach-sql-{{ r.release_name }}.windows-6.2-amd64.zip.sha256sum" class="binary-link">SHA256</a>){% endif %}{% endif %}</td>
    </tr>
  </tbody>
</table>

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

<h3>Source tag</h3>

To view or download the source code for CockroachDB {{ release.release_name }} on Github, visit <a target="_blank" rel="noopener" href="https://github.com/cockroachdb/cockroach/releases/tag/{{ release.release_name }}">{{ release.release_name }} source tag</a>.

  {% if release.previous_release %}
<h3 id="{{ release.release_name | downcase | replace: ".", "-" }}-changelog">Changelog</h3>
View a detailed changelog on GitHub: [{{ release.previous_release }}...{{ release.release_name }}](https://github.com/cockroachdb/cockroach/compare/{{ release.previous_release }}...{{ release.release_name }})
  {% endif %}

{% endif %}
