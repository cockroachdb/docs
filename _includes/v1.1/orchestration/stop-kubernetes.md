    <div class="filter-content" markdown="1" data-scope="gke-hosted">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="gce-manual">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

    </div>

    <div class="filter-content" markdown="1" data-scope="aws-manual">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

    </div>

    {{site.data.alerts.callout_danger}}If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.{{site.data.alerts.end}}
