---
title: Cluster Monitoring with the CockroachDB Operator
summary: How to monitor a secure CockroachDB cluster deployed with the CockroachDB operator.
toc: true
toc_not_nested: true
docs_area: deploy
---

Despite CockroachDB's various [built-in safeguards against failure]({% link {{ page.version.version }}/architecture/replication-layer.md %}), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

## Configure Prometheus

Every node of a CockroachDB cluster exports granular timeseries metrics formatted for easy integration with [Prometheus](https://prometheus.io/), a tool for storing, aggregating, and querying timeseries data. This section shows you how to orchestrate Prometheus as part of your Kubernetes cluster and pull these metrics into Prometheus for external monitoring.

This guidance is based on [CoreOS's Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/tree/main), which allows a Prometheus instance to be managed using built-in Kubernetes concepts.

{{site.data.alerts.callout_info}}
If you're on Hosted GKE, before starting, make sure the email address associated with your Google Cloud account is part of the `cluster-admin` RBAC group, as shown in [Deploy CockroachDB with Kubernetes]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}).
{{site.data.alerts.end}}

1. From your local workstation, edit the cockroachdb service to add the prometheus: cockroachdb label:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~
    ~~~ shell
    service/cockroachdb labeled
    ~~~

    This ensures that only the cockroachdb (not the cockroach-public service) is being monitored by a Prometheus job.

1. Determine the latest version of [CoreOS's Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/releases/) and run the following to download and apply the latest `bundle.yaml` definition file:

    {{site.data.alerts.callout_info}}
    Be sure to specify the latest [CoreOS Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/releases/) version in the following command, in place of this example's use of version `v0.82.0`.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply \
    -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.82.0/bundle.yaml \
    --server-side
    ~~~
    ~~~ shell
    customresourcedefinition.apiextensions.k8s.io/alertmanagers.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/podmonitors.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/probes.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/prometheuses.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/prometheusrules.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/servicemonitors.monitoring.coreos.com serverside-applied
    customresourcedefinition.apiextensions.k8s.io/thanosrulers.monitoring.coreos.com serverside-applied
    clusterrolebinding.rbac.authorization.k8s.io/prometheus-operator serverside-applied
    clusterrole.rbac.authorization.k8s.io/prometheus-operator serverside-applied
    deployment.apps/prometheus-operator serverside-applied
    serviceaccount/prometheus-operator serverside-applied
    service/prometheus-operator serverside-applied
    ~~~

1. Confirm that the `prometheus-operator` has started:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl get deploy prometheus-operator
    ~~~
    ~~~ shell
    NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
    prometheus-operator   1/1     1            1           27s
    ~~~

1. Download our Prometheus manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/prometheus.yaml
    ~~~

1. Apply the Prometheus manifest. This creates the various objects necessary to run a Prometheus instance:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f prometheus.yaml
    ~~~
    ~~~ shell
    serviceaccount/prometheus created
    clusterrole.rbac.authorization.k8s.io/prometheus created
    clusterrolebinding.rbac.authorization.k8s.io/prometheus created
    servicemonitor.monitoring.coreos.com/cockroachdb created
    prometheus.monitoring.coreos.com/cockroachdb created
    ~~~

1. Access the Prometheus UI locally and verify that CockroachDB is feeding data into Prometheus:
    1. Port-forward from your local machine to the pod running Prometheus:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl port-forward prometheus-cockroachdb-0 9090
        ~~~

    1. Go to [http://localhost:9090](http://localhost:9090/) in your browser.

    1. To verify that each CockroachDB node is connected to Prometheus, go to **Status > Targets**. The screen should look like this:

        <img src="{{ 'images/v26.1/kubernetes-prometheus-targets.png' | relative_url }}" alt="Prometheus targets" style="border:1px solid #eee;max-width:100%" />

    1. To verify that data is being collected, go to **Graph**, enter the `sys_uptime` variable in the field, click **Execute**, and then click the **Graph** tab. The screen should like this:

        <img src="{{ 'images/v26.1/kubernetes-prometheus-graph.png' | relative_url }}" alt="Prometheus graph" style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_info}}
    Prometheus auto-completes CockroachDB time series metrics for you, but if you want to see a full listing, with descriptions, port-forward as described in [Access the DB Console]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#step-4-access-the-db-console) and then point your browser to [http://localhost:8080/_status/vars](http://localhost:8080/_status/vars).
    {{site.data.alerts.end}}

For more details on using the Prometheus UI, see their [official documentation](https://prometheus.io/docs/introduction/getting_started/).

## Configure Alertmanager

Active monitoring helps you spot problems early, but it is also essential to send notifications when there are events that require investigation or intervention. This section shows you how to use [Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) and CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml) to do this.

1. Download our [alertmanager-config.yaml](https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml) configuration file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml
    ~~~

1. Edit the `alertmanager-config.yaml` file to [specify the desired receivers for notifications](https://prometheus.io/docs/alerting/configuration/#receiver). Initially, the file contains a placeholder web hook.

1. Add this configuration to the Kubernetes cluster as a secret, renaming it to `alertmanager.yaml` and labeling it to make it easier to find:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl create secret generic alertmanager-cockroachdb \
    --from-file=alertmanager.yaml=alertmanager-config.yaml
    ~~~
    ~~~ shell
    secret/alertmanager-cockroachdb created
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl label secret alertmanager-cockroachdb app=cockroachdb
    ~~~
    ~~~ shell
    secret/alertmanager-cockroachdb labeled
    ~~~

    {{site.data.alerts.callout_danger}}
    The name of the secret, `alertmanager-cockroachdb`, must match the name used in the `alertmanager.yaml` file. If they differ, the Alertmanager instance will start without configuration, and nothing will happen.
    {{site.data.alerts.end}}

1. Use our [alertmanager.yaml](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alertmanager.yaml) file to create the various objects necessary to run an Alertmanager instance, including a ClusterIP service so that Prometheus can forward alerts:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager.yaml
    ~~~
    ~~~ shell
    alertmanager.monitoring.coreos.com/cockroachdb created
    service/alertmanager-cockroachdb created
    ~~~

1. Verify that Alertmanager is running:
    1. Port-forward from your local machine to the pod running Alertmanager:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl port-forward alertmanager-cockroachdb-0 9093
        ~~~

    1. Go to [http://localhost:9093](http://localhost:9093/) in your browser. The screen should look like this:

        <img src="{{ 'images/v26.1/kubernetes-alertmanager-home.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Ensure that the Alertmanagers are visible to Prometheus by opening [http://localhost:9090/status](http://localhost:9090/status). The screen should look like this:

    <img src="{{ 'images/v26.1/kubernetes-prometheus-alertmanagers.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Add CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alert-rules.yaml
    ~~~
    ~~~ shell
    prometheusrule.monitoring.coreos.com/prometheus-cockroachdb-rules created
    ~~~

1. Ensure that the rules are visible to Prometheus by opening [http://localhost:9090/rules](http://localhost:9090/rules). The screen should look like this:

    <img src="{{ 'images/v26.1/kubernetes-prometheus-alertrules.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Verify that the `TestAlertManager` example alert is firing by opening [http://localhost:9090/alerts](http://localhost:9090/alerts). The screen should look like this:

    <img src="{{ 'images/v26.1/kubernetes-prometheus-alerts.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. To remove the example alert:
    1. Use the `kubectl edit` command to open the rules for editing:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        kubectl edit prometheusrules prometheus-cockroachdb-rules
        ~~~

    1. Remove the `dummy.rules` block and save the file:

        ~~~ yaml
        - name: rules/dummy.rules
          rules:
          - alert: TestAlertManager
            expr: vector(1)
        ~~~

## Monitor the operator

The {{ site.data.products.cockroachdb-operator }} automatically exposes [Prometheus-style metrics](https://prometheus.io/docs/concepts/metric_types/) that you can monitor to observe its operations.

Metrics can be collected from the operator via HTTP requests (port 8080 by default) against the `/metrics` endpoint. The response will describe the current node metrics, for example:

~~~json
...
# HELP node_decommissioning Whether a CockroachDB node is decommissioning.
# TYPE node_decommissioning gauge
node_decommissioning{node="cockroachdb-nvq2l"} 0
node_decommissioning{node="cockroachdb-pmp45"} 0
node_decommissioning{node="cockroachdb-q6784"} 0
node_decommissioning{node="cockroachdb-r4wz8"} 0
...
~~~

## Configure logging

You can use the operator to configure the CockroachDB logging system. This allows you to output logs to [configurable log sinks]({% link {{ page.version.version }}/configure-logs.md %}#configure-log-sinks) such as file or network logging destinations.

The logging configuration is defined in a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) object, using a key named `logs.yaml`. For example:

~~~ yaml
apiVersion: v1
data:
  logs.yaml: |
    sinks:
      file-groups:
        dev:
          channels: DEV
          filter: WARNING
kind: ConfigMap
metadata:
  name: logconfig
  namespace: cockroach-ns
~~~

The above configuration overrides the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) and saves debug-level logs (the `DEV` [log channel]({% link {{ page.version.version }}/logging-overview.md %}#logging-channels)) to disk for troubleshooting.

The ConfigMap `name` must match the `cockroachdb.crdbCluster.loggingConfigMapName` object in the values file used to [deploy the cluster]({% link {{ page.version.version }}/deploy-cockroachdb-with-cockroachdb-operator.md %}#initialize-the-cluster):

~~~ yaml
cockroachdb:
  crdbCluster:
    loggingConfigMapName: logconfig
~~~

By default, the operator also modifies the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) with the following:

~~~ yaml
sinks:
  stderr:
    channels: {INFO: "HEALTH, OPS", WARNING: "STORAGE, DEV"}
      redact: true
~~~

This outputs logging events in the [OPS]({% link {{ page.version.version }}/logging.md %}#ops) channel to a `cockroach-stderr.log` file.

### Example: Configuring a troubleshooting log file on pods

In this example, CockroachDB has already been deployed on a Kubernetes cluster. Override the [default logging configuration]({% link {{ page.version.version }}/configure-logs.md %}#default-logging-configuration) to output [DEV]({% link {{ page.version.version }}/logging.md %}#dev) logs to a `cockroach-dev.log` file.

1. Create a ConfigMap named `logconfig`. Note that `namespace` is set to the `cockroach-ns` namespace:

    ~~~ yaml
    apiVersion: v1
    data:
      logs.yaml: |
        sinks:
          file-groups:
            dev:
              channels: DEV
              filter: WARNING
    kind: ConfigMap
    metadata:
      name: logconfig
      namespace: cockroach-ns
    ~~~

    For simplicity, also name the YAML file `logconfig.yaml`.

    {{site.data.alerts.callout_info}}
    The ConfigMap key is not related to the ConfigMap `name` or YAML filename, and must be named `logging.yaml`.
    {{site.data.alerts.end}}

    This configuration outputs `DEV` logs that have severity [WARNING]({% link {{ page.version.version }}/logging.md %}#logging-levels-severities) to a `cockroach-dev.log` file on each pod.

1. Apply the ConfigMap to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl apply -f logconfig.yaml
    ~~~
    ~~~ shell
    configmap/logconfig created
    ~~~

1. Add the `name` of the ConfigMap in `loggingConfigMapName` to the values file:

    ~~~ yaml
    cockroachdb:
      crdbCluster:
        loggingConfigMapName: logconfig
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    helm upgrade --reuse-values $CRDBCLUSTER ./cockroachdb-parent/charts/cockroachdb --values ./cockroachdb-parent/charts/cockroachdb/values.yaml -n $NAMESPACE
    ~~~

    The changes will be rolled out to each pod.

1. See the log files available on a pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl exec cockroachdb-2 -- ls cockroach-data/logs
    ~~~
    ~~~ shell
    cockroach-dev.cockroachdb-2.unknownuser.2022-05-02T19_03_03Z.000001.log
    cockroach-dev.log
    cockroach-health.cockroachdb-2.unknownuser.2022-05-02T18_53_01Z.000001.log
    cockroach-health.log
    cockroach-pebble.cockroachdb-2.unknownuser.2022-05-02T18_52_48Z.000001.log
    cockroach-pebble.log
    cockroach-stderr.cockroachdb-2.unknownuser.2022-05-02T18_52_48Z.000001.log
    cockroach-stderr.cockroachdb-2.unknownuser.2022-05-02T19_03_03Z.000001.log
    cockroach-stderr.cockroachdb-2.unknownuser.2022-05-02T20_04_03Z.000001.log
    cockroach-stderr.log
    cockroach.cockroachdb-2.unknownuser.2022-05-02T18_52_48Z.000001.log
    cockroach.log
    ...
    ~~~

1. View a specific log file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl exec cockroachdb-2 -- cat cockroach-data/logs/cockroach-dev.log
    ~~~
