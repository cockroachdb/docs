On this page, you can read about changes and find downloads for all production and testing releases of CockroachDB {{ page.major_version }}.

- For key feature enhancements in {{ page.major_version }} and other upgrade considerations, refer to the notes for {% if page.release_type == 'Production' and page.major_version != 'v1.0' %}[{{ page.major_version }}.0](#{{ page.major_version | replace: '.', '-' }}-0){% else %}{{ page.major_version }} on this page.{% endif %}
- For details about release types, naming, and licensing, refer to the [Releases]({% link releases/index.md %}) page.
- Be sure to also review the [Release Support Policy]({% link releases/release-support-policy.md %}).
- After downloading a supported CockroachDB binary, learn how to [install CockroachDB]{% if static_file.path == '{{ page.major_version }}/install-cockroachdb.md' %}(../{{ page.major_version }}/install-cockroachdb.html) or [upgrade your cluster](../{{ page.major_version }}/upgrade-cockroach-version.html){% else %}(../dev/install-cockroachdb.html) or [upgrade your cluster](../dev/upgrade-cockroach-version.html){% endif %}.

Get future release notes emailed to you:


{% include_cached marketo.html formId=1083 %}
