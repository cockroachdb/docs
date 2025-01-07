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