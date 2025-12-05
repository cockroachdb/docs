{% if page.name == "kubernetes-operator.md" %}
{{ site.data.alerts.callout_success }}
The {{ site.data.products.cockroachdb-operator }} is a fully-featured Kubernetes operator that is designed for ease of deployment and scaling of multi-region clusters. To learn more, read the [{{ site.data.products.cockroachdb-operator }} documentation]({% link {{ site.versions["stable"] }}/cockroachdb-operator-overview.md %}).

New deployments of CockroachDB on Kubernetes are recommended to use the {{ site.data.products.cockroachdb-operator }}. To migrate an existing deployment to use the {{ site.data.products.cockroachdb-operator }}, read the [Helm]({% link {{ site.versions["stable"] }}/migrate-cockroachdb-kubernetes-helm.md %}) and [{{ site.data.products.public-operator }}]({% link {{ site.versions["stable"] }}/migrate-cockroachdb-kubernetes-operator.md %}) migration guides.
{{ site.data.alerts.end }}
{% else %}
{{ site.data.alerts.callout_success }}
The {{ site.data.products.cockroachdb-operator }} is a fully-featured Kubernetes operator that is designed for ease of deployment and scaling of multi-region clusters. To learn more, read the [{{ site.data.products.cockroachdb-operator }} documentation]({% link {{ page.version.version }}/cockroachdb-operator-overview.md %}).

New deployments of CockroachDB on Kubernetes are recommended to use the {{ site.data.products.cockroachdb-operator }}. To migrate an existing deployment to use the {{ site.data.products.cockroachdb-operator }}, read the [Helm]({% link {{ page.version.version }}/migrate-cockroachdb-kubernetes-helm.md %}) and [{{ site.data.products.public-operator }}]({% link {{ page.version.version }}/migrate-cockroachdb-kubernetes-operator.md %}) migration guides.
{{ site.data.alerts.end }}
{% endif %}