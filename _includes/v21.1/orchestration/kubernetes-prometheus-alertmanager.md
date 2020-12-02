Despite CockroachDB's various [built-in safeguards against failure](high-availability.html), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

### Configure Prometheus

Every node of a CockroachDB cluster exports granular timeseries metrics formatted for easy integration with [Prometheus](https://prometheus.io/), an open source tool for storing, aggregating, and querying timeseries data. This section shows you how to orchestrate Prometheus as part of your Kubernetes cluster and pull these metrics into Prometheus for external monitoring.

This guidance is based on [CoreOS's Prometheus Operator](https://github.com/coreos/prometheus-operator/blob/master/Documentation/user-guides/getting-started.md), which allows a Prometheus instance to be managed using built-in Kubernetes concepts.

{{site.data.alerts.callout_info}}
If you're on Hosted GKE, before starting, make sure the email address associated with your Google Cloud account is part of the `cluster-admin` RBAC group, as shown in [Step 1. Start Kubernetes](#hosted-gke).
{{site.data.alerts.end}}

1. From your local workstation, edit the `cockroachdb` service to add the `prometheus: cockroachdb` label:

    <section class="filter-content" markdown="1" data-scope="operator">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/cockroachdb labeled
    ~~~

    This ensures that only the `cockroachdb` (not the `cockroach-public` service) is being monitored by a Prometheus job.
    </section>

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/cockroachdb labeled
    ~~~

    This ensures that only the `cockroachdb` (not the `cockroach-public` service) is being monitored by a Prometheus job.
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc my-release-cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/my-release-cockroachdb labeled
    ~~~

    This ensures that there is a Prometheus job and monitoring data only for the `my-release-cockroachdb` service, not for the `my-release-cockroach-public` service.
    </section>

2. Install [CoreOS's Prometheus Operator](https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/release-0.43/bundle.yaml):
    
    {{site.data.alerts.callout_info}}
    If you run into an error when installing the Prometheus Operator, first try updating the [release version](https://github.com/prometheus-operator/prometheus-operator/blob/master/RELEASE.md) specified in the below command and reapplying the manifest. If this doesn't work, please [file an issue](file-an-issue.html).
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/release-0.43/bundle.yaml
    ~~~

    ~~~
    customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com created
    customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com created
    clusterrolebinding.rbac.authorization.k8s.io/prometheus-operator configured
    clusterrole.rbac.authorization.k8s.io/prometheus-operator configured
    deployment.apps/prometheus-operator created
    serviceaccount/prometheus-operator configured
    service/prometheus-operator created
    ~~~
3. Confirm that the `prometheus-operator` has started:


    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get deploy prometheus-operator
    ~~~

    ~~~
    NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
    prometheus-operator   1/1     1            1           27s
    ~~~

4. Use our [`prometheus.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/prometheus.yaml) file to create the various objects necessary to run a Prometheus instance:

    {{site.data.alerts.callout_success}}
    This configuration defaults to using the Kubernetes CA for authentication.
    {{site.data.alerts.end}}

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/prometheus.yaml
    ~~~

    ~~~
    serviceaccount/prometheus created
    clusterrole.rbac.authorization.k8s.io/prometheus created
    clusterrolebinding.rbac.authorization.k8s.io/prometheus created
    servicemonitor.monitoring.coreos.com/cockroachdb created
    prometheus.monitoring.coreos.com/cockroachdb created
    ~~~

5. Access the Prometheus UI locally and verify that CockroachDB is feeding data into Prometheus:

    1. Port-forward from your local machine to the pod running Prometheus:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl port-forward prometheus-cockroachdb-0 9090
        ~~~

    2. Go to <a href="http://localhost:9090" data-proofer-ignore>http://localhost:9090</a> in your browser.

    3. To verify that each CockroachDB node is connected to Prometheus, go to **Status > Targets**. The screen should look like this:

        <img src="{{ 'images/v21.1/kubernetes-prometheus-targets.png' | relative_url }}" alt="Prometheus targets" style="border:1px solid #eee;max-width:100%" />

    4. To verify that data is being collected, go to **Graph**, enter the `sys_uptime` variable in the field, click **Execute**, and then click the **Graph** tab. The screen should like this:

        <img src="{{ 'images/v21.1/kubernetes-prometheus-graph.png' | relative_url }}" alt="Prometheus graph" style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_success}}
    Prometheus auto-completes CockroachDB time series metrics for you, but if you want to see a full listing, with descriptions, port-forward as described in {% if page.secure == true %}[Access the DB Console](#step-4-access-the-db-console){% else %}[Access the DB Console](#step-4-access-the-db-console){% endif %} and then point your browser to <a href="http://localhost:8080/_status/vars" data-proofer-ignore>http://localhost:8080/_status/vars</a>.

    For more details on using the Prometheus UI, see their [official documentation](https://prometheus.io/docs/introduction/getting_started/).
    {{site.data.alerts.end}}

### Configure Alertmanager

Active monitoring helps you spot problems early, but it is also essential to send notifications when there are events that require investigation or intervention. This section shows you how to use [Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) and CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml) to do this.

1. Download our <a href="https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml" download><code>alertmanager-config.yaml</code></a> configuration file:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ curl -OOOOOOOOO \
    https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml
    ~~~

2. Edit the `alertmanager-config.yaml` file to [specify the desired receivers for notifications](https://prometheus.io/docs/alerting/configuration/#receiver). Initially, the file contains a placeholder web hook.

3. Add this configuration to the Kubernetes cluster as a secret, renaming it to `alertmanager.yaml` and labelling it to make it easier to find:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret generic alertmanager-cockroachdb \
    --from-file=alertmanager.yaml=alertmanager-config.yaml
    ~~~

    ~~~
    secret/alertmanager-cockroachdb created
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl label secret alertmanager-cockroachdb app=cockroachdb
    ~~~

    ~~~
    secret/alertmanager-cockroachdb labeled
    ~~~

    {{site.data.alerts.callout_danger}}
    The name of the secret, `alertmanager-cockroachdb`, must match the name used in the `alertmanager.yaml` file. If they differ, the Alertmanager instance will start without configuration, and nothing will happen.
    {{site.data.alerts.end}}

4. Use our [`alertmanager.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alertmanager.yaml) file to create the various objects necessary to run an Alertmanager instance, including a ClusterIP service so that Prometheus can forward alerts:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager.yaml
    ~~~

    ~~~
    alertmanager.monitoring.coreos.com/cockroachdb created
    service/alertmanager-cockroachdb created
    ~~~

5. Verify that Alertmanager is running:

    1. Port-forward from your local machine to the pod running Alertmanager:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl port-forward alertmanager-cockroachdb-0 9093
        ~~~

    2. Go to <a href="http://localhost:9093" data-proofer-ignore>http://localhost:9093</a> in your browser. The screen should look like this:

        <img src="{{ 'images/v21.1/kubernetes-alertmanager-home.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

6. Ensure that the Alertmanagers are visible to Prometheus by opening <a href="http://localhost:9090/status" data-proofer-ignore>http://localhost:9090/status</a>. The screen should look like this:

    <img src="{{ 'images/v21.1/kubernetes-prometheus-alertmanagers.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

7. Add CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml):

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alert-rules.yaml
    ~~~

    ~~~
    prometheusrule.monitoring.coreos.com/prometheus-cockroachdb-rules created
    ~~~

8. Ensure that the rules are visible to Prometheus by opening <a href="http://localhost:9090/rules" data-proofer-ignore>http://localhost:9090/rules</a>. The screen should look like this:

    <img src="{{ 'images/v21.1/kubernetes-prometheus-alertrules.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

9. Verify that the `TestAlertManager` example alert is firing by opening <a href="http://localhost:9090/alerts" data-proofer-ignore>http://localhost:9090/alerts</a>. The screen should look like this:

    <img src="{{ 'images/v21.1/kubernetes-prometheus-alerts.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

10. To remove the example alert:

    1. Use the `kubectl edit` command to open the rules for editing:

        {% include copy-clipboard.html %}
        ~~~ shell
        $ kubectl edit prometheusrules prometheus-cockroachdb-rules
        ~~~

    2. Remove the `dummy.rules` block and save the file:

        ~~~
        - name: rules/dummy.rules
          rules:
          - alert: TestAlertManager
            expr: vector(1)
        ~~~
