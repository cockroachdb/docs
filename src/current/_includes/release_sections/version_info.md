A new major version of CockroachDB is released quarterly. After a series of testing releases, each major version receives an initial production release, followed by a series of patch releases.

Releases are named in the format `vYY.R.PP`, where `YY` indicates the year, `R` indicates the major release starting with `1` each year, and `PP` indicates the patch number, starting with `0`.

For example, the latest production release is `{{ latest_full_production_version.release_name }}`, within major version [`{{ latest_major_version_with_production }}`]({% link releases/{{ latest_major_version_with_production }}.md %}).

After choosing a version of CockroachDB, learn how to:

- [Create a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/create-your-cluster.md %}).
- [Upgrade a cluster in CockroachDB {{ site.data.products.cloud }}]({% link cockroachcloud/upgrade-cockroach-version.md %}).
- [Install CockroachDB {{ site.data.products.core }}]({% link {{site.current_cloud_version}}/install-cockroachdb.md %})
- [Upgrade a Self-Hosted cluster]({% link {{site.current_cloud_version}}/upgrade-cockroach-version.md %}).

Be sure to review Cockroach Labs' [Release Support Policy]({% link releases/release-support-policy.md %}) and review information about applicable [software licenses](#licenses).