{% if page.name == "kubernetes-operator.md" %}
{{ site.data.alerts.callout_danger }}
New deployments of CockroachDB on Kubernetes are recommended to use the newer, fully-featured {{ site.data.products.cockroachdb-operator }} that's easier to deploy and supports scaling of multi-region clusters. To migrate an existing deployment to use the {{ site.data.products.cockroachdb-operator }}, read the [Helm]({% link {{ site.versions["stable"] }}/migrate-cockroachdb-kubernetes-helm.md %}) and [{{ site.data.products.public-operator }}]({% link {{ site.versions["stable"] }}/migrate-cockroachdb-kubernetes-operator.md %}) migration guides.
{{ site.data.alerts.end }}
{% else %}
{{ site.data.alerts.callout_danger }}
New deployments of CockroachDB on Kubernetes are recommended to use the newer, fully-featured {{ site.data.products.cockroachdb-operator }} that's easier to deploy and supports scaling of multi-region clusters. To migrate an existing deployment to use the {{ site.data.products.cockroachdb-operator }}, read the [Helm]({% link {{ page.version.version }}/migrate-cockroachdb-kubernetes-helm.md %}) and [{{ site.data.products.public-operator }}]({% link {{ page.version.version }}/migrate-cockroachdb-kubernetes-operator.md %}) migration guides.
{{ site.data.alerts.end }}
{% endif %}