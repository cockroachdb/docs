To delete the Kubernetes cluster:

- Hosted GKE:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gcloud container clusters delete cockroachdb --region {region-name}
    ~~~
- Hosted EKS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ eksctl delete cluster --name cockroachdb
    ~~~
- Manual GCE:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~
- Manual AWS:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cluster/kube-down.sh
    ~~~

{{site.data.alerts.callout_danger}}
If you stop Kubernetes without first deleting the persistent volumes, they will still exist in your cloud project.
{{site.data.alerts.end}}
