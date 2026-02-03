Despite CockroachDB's various [built-in safeguards against failure](high-availability.html), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

### Configure Prometheus

Every node of a CockroachDB cluster exports granular timeseries metrics formatted for easy integration with [Prometheus](https://prometheus.io/), an open source tool for storing, aggregating, and querying timeseries data. This section shows you how to orchestrate Prometheus as part of your Kubernetes cluster and pull these metrics into Prometheus for external monitoring.

This guidance is based on [CoreOS's Prometheus Operator](https://github.com/coreos/prometheus-operator/blob/master/Documentation/user-guides/getting-started.md), which allows a Prometheus instance to be managed using built-in Kubernetes concepts.

<section class="filter-content" markdown="1" data-scope="gke-hosted">
{{site.data.alerts.callout_info}}
Before starting, make sure the email address associated with your Google Cloud account is part of the `cluster-admin` RBAC group, as shown in [Step 1. Start Kubernetes](#step-1-start-kubernetes).
{{site.data.alerts.end}}
</section>

1. From your local workstation, edit the `cockroachdb` service to add the `prometheus: cockroachdb` label:

    ~~~ shell
    $ kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service "cockroachdb" labeled
    ~~~

    This ensures that there is a prometheus job and monitoring data only for the `cockroachdb` service, not for the `cockroach-public` service.

2. Install [CoreOS's Prometheus Operator](https://raw.githubusercontent.com/coreos/prometheus-operator/release-0.20/bundle.yaml):

    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/coreos/prometheus-operator/release-0.20/bundle.yaml
    ~~~

    ~~~
    clusterrolebinding "prometheus-operator" created
    clusterrole "prometheus-operator" created
    serviceaccount "prometheus-operator" created
    deployment "prometheus-operator" created
    ~~~

3. Confirm that the `prometheus-operator` has started:

    ~~~ shell
    $ kubectl get deploy prometheus-operator
    ~~~

    ~~~
    NAME                  DESIRED   CURRENT   UP-TO-DATE   AVAILABLE   AGE
    prometheus-operator   1         1         1            1           1m
    ~~~

4. Use our [`prometheus.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/prometheus.yaml) file to create the various objects necessary to run a Prometheus instance:

    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/prometheus.yaml
    ~~~

    ~~~
    clusterrole "prometheus" created
    clusterrolebinding "prometheus" created
    servicemonitor "cockroachdb" created
    prometheus "cockroachdb" created
    ~~~

5. Access the Prometheus UI locally and verify that CockroachDB is feeding data into Prometheus:

    1. Port-forward from your local machine to the pod running Prometheus:

        ~~~ shell
        $ kubectl port-forward prometheus-cockroachdb-0 9090
        ~~~

    2. Go to <a href="http://localhost:9090/" data-proofer-ignore>http://localhost:9090</a> in your browser.

    3. To verify that each CockroachDB node is connected to Prometheus, go to **Status > Targets**. The screen should look like this:

        <img src="{{ 'images/v2.1/kubernetes-prometheus-targets.png' | relative_url }}" alt="Prometheus targets" style="border:1px solid #eee;max-width:100%" />

    4. To verify that data is being collected, go to **Graph**, enter the `sys_uptime` variable in the field, click **Execute**, and then click the **Graph** tab. The screen should like this:

        <img src="{{ 'images/v2.1/kubernetes-prometheus-graph.png' | relative_url }}" alt="Prometheus graph" style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_success}}
    Prometheus auto-completes CockroachDB time series metrics for you, but if you want to see a full listing, with descriptions, port-forward as described in {% if page.secure == true %}[Access the Admin UI](#step-6-access-the-admin-ui){% else %}[Access the Admin UI](#step-5-access-the-admin-ui){% endif %} and then point your browser to <a href="http://localhost:8080/_status/vars" data-proofer-ignore>http://localhost:8080/_status/vars</a>.

    For more details on using the Prometheus UI, see their [official documentation](https://prometheus.io/docs/introduction/getting_started/).
    {{site.data.alerts.end}}

### Configure Alertmanager

Active monitoring helps you spot problems early, but it is also essential to send notifications when there are events that require investigation or intervention. This section shows you how to use [Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) and CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml) to do this.

1. Download our <a href="https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml" download><code>alertmanager-config.yaml</code></a> configuration file.

2. Edit the `alertmanager-config.yaml` file to [specify the desired receivers for notifications](https://prometheus.io/docs/alerting/configuration/). Initially, the file contains a placeholder web hook.

3. Add this configuration to the Kubernetes cluster as a secret, renaming it to `alertmanager.yaml` and labelling it to make it easier to find:

    ~~~ shell
    $ kubectl create secret generic alertmanager-cockroachdb --from-file=alertmanager.yaml=alertmanager-config.yaml
    ~~~

    ~~~
    secret "alertmanager-cockroachdb" created
    ~~~

    ~~~ shell
    $ kubectl label secret alertmanager-cockroachdb app=cockroachdb
    ~~~

    ~~~
    secret "alertmanager-cockroachdb" labeled
    ~~~

    {{site.data.alerts.callout_danger}}
    The name of the secret, `alertmanager-cockroachdb`, must match the name used in the `altermanager.yaml` file. If they differ, the Alertmanager instance will start without configuration, and nothing will happen.
    {{site.data.alerts.end}}

4. Use our [`alertmanager.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alertmanager.yaml) file to create the various objects necessary to run an Alertmanager instance, including a ClusterIP service so that Prometheus can forward alerts:

    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager.yaml
    ~~~

    ~~~
    alertmanager "cockroachdb" created
    service "alertmanager-cockroachdb" created
    ~~~

5. Verify that Alertmanager is running:

    1. Port-forward from your local machine to the pod running Alertmanager:

        ~~~ shell
        $ kubectl port-forward alertmanager-cockroachdb-0 9093
        ~~~

    2. Go to <a href="http://localhost:9093/" data-proofer-ignore>http://localhost:9093</a> in your browser. The screen should look like this:

        <img src="{{ 'images/v2.1/kubernetes-alertmanager-home.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

6. Ensure that the Alertmanagers are visible to Prometheus by opening <a href="http://localhost:9090/status" data-proofer-ignore>http://localhost:9090/status</a>. The screen should look like this:

    <img src="{{ 'images/v2.1/kubernetes-prometheus-alertmanagers.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

7. Add CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml):

    ~~~ shell
    $ kubectl apply -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alert-rules.yaml
    ~~~

    ~~~
    prometheusrule "prometheus-cockroachdb-rules" created
    ~~~

8. Ensure that the rules are visible to Prometheus by opening http://localhost:9090/status <a href="http://localhost:9090/rules" data-proofer-ignore>http://localhost:9090/rules</a>. The screen should look like this:

    <img src="{{ 'images/v2.1/kubernetes-prometheus-alertrules.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

9. Verify that the example alert is firing by opening <a href="http://localhost:9090/alerts" data-proofer-ignore>http://localhost:9090/alerts</a>. The screen should look like this:

    <img src="{{ 'images/v2.1/kubernetes-prometheus-alerts.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

10. To remove the example alert:

    1. Use the `kubectl edit` command to open the rules for editing:

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
