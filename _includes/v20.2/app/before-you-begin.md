1. [Install CockroachDB](install-cockroachdb.html).
2. Start up a [secure](secure-a-cluster.html) or [insecure](start-a-local-cluster.html) local cluster.
3. Choose the instructions that correspond to whether your cluster is secure or insecure:

<div class="filters filters-big clearfix">
  <button class="filter-button" data-scope="secure">Secure</button>
  <button class="filter-button" data-scope="insecure">Insecure</button>
</div>

<section class="filter-content" markdown="1" data-scope="insecure">
{% include {{ page.version.version }}/prod-deployment/insecure-flag.md %}
</section>