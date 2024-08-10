{% comment %}
  This is included by install-cockroachdb.md and upgrade-cockroach-version.md
{% endcomment %}

{% assign rd = site.data.versions | where_exp: "rd", "rd.major_version == page.version.version" | first %}
{% assign latest = site.data.releases | where_exp: "latest", "latest.major_version == page.version.version" | sort: "release_date" | last %}

{% assign released = false %}
{% assign skippable = false %}
{% if rd.release_date != "N/A" and rd.maint_supp_exp_date != "N/A" %}
    {% assign released = true %}
    {% if rd.asst_supp_exp_date == "N/A" %}
        {% assign skippable = true %}
    {% endif %}
{% endif %}

- A new [major release]({% link releases/release-support-policy.md %}) is performed multiple times per year. The major version number indicates the year of release followed by the release number, starting with 1. For example, the latest major release is {{ actual_latest_prod.major_version }}. Releases are classified by their [support type]({% link releases/release-support-policy.md %}#support-types), which determines the duration of each [support phase]({% link releases/release-support-policy.md %}#support-phases). **CockroachDB {{ latest.major_version }} is {% if released == false %}currently designated as {% endif %}{% if skippable == true %}an optional Innovation release{% else %}a required Regular release{% endif %}{% if released == false %} that is still in development and not yet supported. This designation is subject to change{% endif %}.**

    - [Regular releases]({% link releases/index.md %}#regular-releases) are released twice a year and are required upgrades for all clusters. Initially, a Regular release series has GA Support. After the series demonstrates a continuously high level of stability and performance, new patch releases are designated as LTS releases, which have an extended support window for each support phase. An LTS release is supported for 3 years from its release date. All major versions prior to v24.2 are Regular releases.
    - [Innovation releases]({% link releases/release-support-policy.md %}#innovation-releases) are released twice a year, in between Regular releases. v24.2 is the first innovation release. Innovation releases are optional and can be skipped in favor of the next Regular release. An Innovation release is supported for 6 months and have no [Assistance support]({% link releases/release-support-policy.md %}#support-types) phase. A cluster running an Innovation release must be upgraded to the next Regular release at the end of its support period.
- Each [supported](https://www.cockroachlabs.com/docs/releases/release-support-policy) major release is maintained across *patch releases* that contain improvements including performance or security enhancements and bug fixes. Each patch release increments the major version number with its corresponding patch number. For example, patch releases of {{ actual_latest_prod.major_version }} use the format {{ actual_latest_prod.major_version }}.x.
- All major and patch releases are suitable for production environments, and are therefore considered "production releases". For example, the latest production release is {{ actual_latest_prod.release_name }}.
- Prior to an upcoming major release, alpha, beta, and release candidate (RC) binaries are made available for users who need early access to a feature before it is available in a production release. These releases append the terms `alpha`, `beta`, or `rc` to the version number. These "testing releases" are not suitable for production environments and are not eligible for support or uptime SLA commitments. For more information, refer to the [Release Support Policy](https://www.cockroachlabs.com/docs/releases/release-support-policy).

{{site.data.alerts.callout_info}}
There are no "minor releases" of CockroachDB.
{{site.data.alerts.end}}
