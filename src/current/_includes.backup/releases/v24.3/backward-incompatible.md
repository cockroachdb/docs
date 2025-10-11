Before [upgrading to CockroachDB v24.3]({% link v24.3/upgrade-cockroach-version.md %}), be sure to review the following backward-incompatible changes, as well as [key cluster setting changes](#v24-3-0-cluster-settings), and adjust your deployment as necessary.

If you plan to upgrade to v24.3 directly from v24.1 and skip v24.2, be sure to also review the [v24.2 release notes]({% link releases/v24.2.md %}) for backward-incompatible changes from v24.1.

- Upgrading to v24.3 is blocked if no [license]({% link v24.3/licensing-faqs.md %}) is installed, or if a trial/free license is installed with telemetry disabled. [#130576][#130576]

[#130576]: https://github.com/cockroachdb/cockroach/pull/130576

{% comment %}Remove this anchor when it is added to the v24.3.0 GA release notes{% endcomment %}
<a id="v24-3-0-cluster-settings"></a>
