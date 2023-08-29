1. [Install CockroachDB]({% link {{ page.version.version }}/install-cockroachdb.md %}).
1. Start up a [secure]({% link {{ page.version.version }}/secure-a-cluster.md %}) or [insecure]({% link {{ page.version.version }}/start-a-local-cluster.md %}) local cluster.
1. Choose the instructions that correspond to whether your cluster is secure or insecure:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="secure">Secure</button>
  <button class="filter-button" data-scope="insecure">Insecure</button>
</div>

<section class="filter-content" markdown="1" data-scope="insecure">
{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}
</section>