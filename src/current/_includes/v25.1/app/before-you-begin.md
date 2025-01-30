1. [Install CockroachDB]({{ page.version.version }}/install-cockroachdb.md).
1. Start up a [secure]({{ page.version.version }}/secure-a-cluster.md) or [insecure]({{ page.version.version }}/start-a-local-cluster.md) local cluster.
1. Choose the instructions that correspond to whether your cluster is secure or insecure:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="secure">Secure</button>
  <button class="filter-button" data-scope="insecure">Insecure</button>
</div>

<section class="filter-content" markdown="1" data-scope="insecure">
{% include "_includes/25.1/prod-deployment/insecure-flag.md" %}
</section>