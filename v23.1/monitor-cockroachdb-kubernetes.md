---
title: Cluster monitoring
summary: How to monitor a secure 3-node CockroachDB cluster with Kubernetes.
toc: true
toc_not_nested: true
docs_area: deploy
---

{{site.data.alerts.callout_info}}
This article assumes you have already [deployed CockroachDB on a single Kubernetes cluster](deploy-cockroachdb-with-kubernetes.html).
{{site.data.alerts.end}}

Despite CockroachDB's various [built-in safeguards against failure](architecture/replication-layer.html), it is critical to actively monitor the overall health and performance of a cluster running in production and to create alerting rules that promptly send notifications when there are events that require investigation or intervention.

<div class="filters filters-big clearfix">
    <button class="filter-button" data-scope="operator">Use Operator</button>
    <button class="filter-button" data-scope="manual">Use Configs</button>
    <button class="filter-button" data-scope="helm">Use Helm</button>
</div>

<section class="filter-content" markdown="1" data-scope="operator">
{% include {{ page.version.version }}/orchestration/operator-check-namespace.md %}

{{site.data.alerts.callout_success}}
If you [deployed CockroachDB on Red Hat OpenShift](deploy-cockroachdb-with-kubernetes-openshift.html), substitute `kubectl` with `oc` in the following commands.
{{site.data.alerts.end}}
</section>

## Configure Prometheus

Every node of a CockroachDB cluster exports granular timeseries metrics formatted for easy integration with [Prometheus](https://prometheus.io/), an open source tool for storing, aggregating, and querying timeseries data. This section shows you how to orchestrate Prometheus as part of your Kubernetes cluster and pull these metrics into Prometheus for external monitoring.

This guidance is based on [CoreOS's Prometheus Operator](https://github.com/coreos/prometheus-operator/blob/master/Documentation/user-guides/getting-started.md), which allows a Prometheus instance to be managed using built-in Kubernetes concepts.

{{site.data.alerts.callout_info}}
If you're on Hosted GKE, before starting, make sure the email address associated with your Google Cloud account is part of the `cluster-admin` RBAC group, as shown in [Deploy CockroachDB with Kubernetes](deploy-cockroachdb-with-kubernetes.html#hosted-gke).
{{site.data.alerts.end}}

1. From your local workstation, edit the `cockroachdb` service to add the `prometheus: cockroachdb` label:

    <section class="filter-content" markdown="1" data-scope="operator">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/cockroachdb labeled
    ~~~

    This ensures that only the `cockroachdb` (not the `cockroach-public` service) is being monitored by a Prometheus job.

    </section>

    <section class="filter-content" markdown="1" data-scope="manual">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/cockroachdb labeled
    ~~~

    This ensures that only the `cockroachdb` (not the `cockroach-public` service) is being monitored by a Prometheus job.

    </section>

    <section class="filter-content" markdown="1" data-scope="helm">

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl label svc my-release-cockroachdb prometheus=cockroachdb
    ~~~

    ~~~
    service/my-release-cockroachdb labeled
    ~~~

    This ensures that there is a Prometheus job and monitoring data only for the `my-release-cockroachdb` service, not for the `my-release-cockroach-public` service.

    </section>

1. Determine the latest version of [CoreOS's Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/releases/) and run the following to download and apply the latest `bundle.yaml` definition file:

    {{site.data.alerts.callout_info}}
    Be sure to specify the latest [CoreOS Prometheus Operator](https://github.com/prometheus-operator/prometheus-operator/releases/) version in the following command, in place of this example's use of version `v0.58.0`.
    {{site.data.alerts.end}}

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/v0.58.0/bundle.yaml \
    --server-side
    ~~~

    ~~~
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
    $ kubectl get deploy prometheus-operator
    ~~~

    ~~~
    NAME                  READY   UP-TO-DATE   AVAILABLE   AGE
    prometheus-operator   1/1     1            1           27s
    ~~~

1. Download our Prometheus manifest:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/prometheus.yaml
    ~~~

    {{site.data.alerts.callout_info}}
    By default, this manifest uses the secret name generated by the CockroachDB Kubernetes Operator. If you generated your own certificates and keys when [starting CockroachDB](deploy-cockroachdb-with-kubernetes.html#step-2-start-cockroachdb), be sure that `ca.secret.name` matches the name of the node secret you created.
    {{site.data.alerts.end}}

1. Apply the Prometheus manifest. This creates the various objects necessary to run a Prometheus instance:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f prometheus.yaml
    ~~~

    ~~~
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
        $ kubectl port-forward prometheus-cockroachdb-0 9090
        ~~~

    1. Go to <a href="http://localhost:9090" data-proofer-ignore>http://localhost:9090</a> in your browser.

    1. To verify that each CockroachDB node is connected to Prometheus, go to **Status > Targets**. The screen should look like this:

        <img src="{{ 'images/v23.1/kubernetes-prometheus-targets.png' | relative_url }}" alt="Prometheus targets" style="border:1px solid #eee;max-width:100%" />

    1. To verify that data is being collected, go to **Graph**, enter the `sys_uptime` variable in the field, click **Execute**, and then click the **Graph** tab. The screen should like this:

        <img src="{{ 'images/v23.1/kubernetes-prometheus-graph.png' | relative_url }}" alt="Prometheus graph" style="border:1px solid #eee;max-width:100%" />

    {{site.data.alerts.callout_success}}
    Prometheus auto-completes CockroachDB time series metrics for you, but if you want to see a full listing, with descriptions, port-forward as described in {% if page.secure == true %}[Access the DB Console](deploy-cockroachdb-with-kubernetes.html#step-4-access-the-db-console){% else %}[Access the DB Console](deploy-cockroachdb-with-kubernetes.html#step-4-access-the-db-console){% endif %} and then point your browser to <a href="http://localhost:8080/_status/vars" data-proofer-ignore>http://localhost:8080/_status/vars</a>.

    For more details on using the Prometheus UI, see their [official documentation](https://prometheus.io/docs/introduction/getting_started/).
    {{site.data.alerts.end}}

## Configure Alertmanager

Active monitoring helps you spot problems early, but it is also essential to send notifications when there are events that require investigation or intervention. This section shows you how to use [Alertmanager](https://prometheus.io/docs/alerting/alertmanager/) and CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml) to do this.

1. Download our <a href="https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml" download><code>alertmanager-config.yaml</code></a> configuration file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ curl -O \
    https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager-config.yaml
    ~~~

1. Edit the `alertmanager-config.yaml` file to [specify the desired receivers for notifications](https://prometheus.io/docs/alerting/configuration/#receiver). Initially, the file contains a placeholder web hook.

1. Add this configuration to the Kubernetes cluster as a secret, renaming it to `alertmanager.yaml` and labelling it to make it easier to find:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl create secret generic alertmanager-cockroachdb \
    --from-file=alertmanager.yaml=alertmanager-config.yaml
    ~~~

    ~~~
    secret/alertmanager-cockroachdb created
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl label secret alertmanager-cockroachdb app=cockroachdb
    ~~~

    ~~~
    secret/alertmanager-cockroachdb labeled
    ~~~

    {{site.data.alerts.callout_danger}}
    The name of the secret, `alertmanager-cockroachdb`, must match the name used in the `alertmanager.yaml` file. If they differ, the Alertmanager instance will start without configuration, and nothing will happen.
    {{site.data.alerts.end}}

1. Use our [`alertmanager.yaml`](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alertmanager.yaml) file to create the various objects necessary to run an Alertmanager instance, including a ClusterIP service so that Prometheus can forward alerts:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alertmanager.yaml
    ~~~

    ~~~
    alertmanager.monitoring.coreos.com/cockroachdb created
    service/alertmanager-cockroachdb created
    ~~~

1. Verify that Alertmanager is running:

    1. Port-forward from your local machine to the pod running Alertmanager:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl port-forward alertmanager-cockroachdb-0 9093
        ~~~

    1. Go to <a href="http://localhost:9093" data-proofer-ignore>http://localhost:9093</a> in your browser. The screen should look like this:

        <img src="{{ 'images/v23.1/kubernetes-alertmanager-home.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Ensure that the Alertmanagers are visible to Prometheus by opening <a href="http://localhost:9090/status" data-proofer-ignore>http://localhost:9090/status</a>. The screen should look like this:

    <img src="{{ 'images/v23.1/kubernetes-prometheus-alertmanagers.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Add CockroachDB's starter [alerting rules](https://github.com/cockroachdb/cockroach/blob/master/cloud/kubernetes/prometheus/alert-rules.yaml):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply \
    -f https://raw.githubusercontent.com/cockroachdb/cockroach/master/cloud/kubernetes/prometheus/alert-rules.yaml
    ~~~

    ~~~
    prometheusrule.monitoring.coreos.com/prometheus-cockroachdb-rules created
    ~~~

1. Ensure that the rules are visible to Prometheus by opening <a href="http://localhost:9090/rules" data-proofer-ignore>http://localhost:9090/rules</a>. The screen should look like this:

    <img src="{{ 'images/v23.1/kubernetes-prometheus-alertrules.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. Verify that the `TestAlertManager` example alert is firing by opening <a href="http://localhost:9090/alerts" data-proofer-ignore>http://localhost:9090/alerts</a>. The screen should look like this:

    <img src="{{ 'images/v23.1/kubernetes-prometheus-alerts.png' | relative_url }}" alt="Alertmanager" style="border:1px solid #eee;max-width:100%" />

1. To remove the example alert:

    1. Use the `kubectl edit` command to open the rules for editing:

        {% include_cached copy-clipboard.html %}
        ~~~ shell
        $ kubectl edit prometheusrules prometheus-cockroachdb-rules
        ~~~

    1. Remove the `dummy.rules` block and save the file:

        ~~~
        - name: rules/dummy.rules
          rules:
          - alert: TestAlertManager
            expr: vector(1)
        ~~~

<section class="filter-content" markdown="1" data-scope="operator">

## Configure logging

When running CockroachDB v21.1 and later, you can use the Operator to configure the CockroachDB logging system. This allows you to output logs to [configurable log sinks] (configure-logs.html#configure-log-sinks) such as file or network logging destinations.

{{site.data.alerts.callout_info}}
By default, Kubernetes deployments running CockroachDB v20.2 or earlier output all logs to `stderr`.
{{site.data.alerts.end}}

The logging configuration is defined in a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/) object, using a key named `logging.yaml`. For example:

~~~ yaml
apiVersion: v1
data:
  logging.yaml: |
    sinks:
      file-groups:
        dev:
          channels: DEV
          filter: WARNING
      fluent-servers:
        ops:
          channels: [OPS, HEALTH, SQL_SCHEMA]
          address: 127.0.0.1:5170
          net: tcp
          redact: true
        security:
          channels: [SESSIONS, USER_ADMIN, PRIVILEGES, SENSITIVE_ACCESS]
          address: 127.0.0.1:5170
          net: tcp
          auditable: true
kind: ConfigMap
metadata:
  name: logconfig
  namespace: cockroach-operator-system
~~~

The above configuration overrides the [default logging configuration](configure-logs.html#default-logging-configuration) and reflects our recommended Kubernetes logging configuration:

- Save debug-level logs (the `DEV` [log channel](logging-overview.html#logging-channels)) to disk for troubleshooting.
- Send operational- and security-level logs to a [network collector](logging-use-cases.html#network-logging), in this case [Fluentd](configure-logs.html#fluentd-logging-format).

The ConfigMap `name` must match the `logConfigMap` object of the Operator's custom resource, which is used to [deploy the cluster](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

~~~ yaml
spec:
  logConfigMap: logconfig
~~~

By default, the Operator also modifies the [default logging configuration](configure-logs.html#default-logging-configuration) with the following:

~~~ yaml
sinks:
  stderr:
    channels: OPS
      redact: true
~~~

This outputs logging events in the [`OPS`](logging.html#ops) channel to a `cockroach-stderr.log` file.

### Example: Creating a troubleshooting log file on pods

In this example, CockroachDB has already been deployed on a Kubernetes cluster. We override the [default logging configuration](configure-logs.html#default-logging-configuration) to output [`DEV`](logging.html#dev) logs to a `cockroach-dev.log` file.

1. Create a ConfigMap named `logconfig`. Note that `namespace` is set to the Operator's default namespace (`cockroach-operator-system`):

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    apiVersion: v1
    data:
      logging.yaml: |
        sinks:
          file-groups:
            dev:
              channels: DEV
              filter: WARNING
    kind: ConfigMap
    metadata:
      name: logconfig
      namespace: cockroach-operator-system
    ~~~

    For simplicity, also name the YAML file `logconfig.yaml`.

    {{site.data.alerts.callout_info}}
    The ConfigMap key is not related to the ConfigMap `name` or YAML filename, and **must** be named `logging.yaml`.
    {{site.data.alerts.end}}

    This configuration outputs `DEV` logs that have severity [`WARNING`](logging.html#logging-levels-severities) to a `cockroach-dev.log` file on each pod.

1. Apply the ConfigMap to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~
    kubectl apply -f logconfig.yaml
    ~~~

    ~~~
    configmap/logconfig created
    ~~~

1. Add the `name` of the ConfigMap in `logConfigMap` to the [Operator's custom resource](deploy-cockroachdb-with-kubernetes.html#initialize-the-cluster):

    {% include_cached copy-clipboard.html %}
    ~~~ yaml
    spec:
      logConfigMap: logconfig
    ~~~

1. Apply the new settings to the cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl apply -f example.yaml
    ~~~

    The changes will be rolled out to each pod.

1. See the log files available on a pod:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec cockroachdb-2 -- ls cockroach-data/logs
    ~~~

    ~~~
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
    $ kubectl exec cockroachdb-2 -- cat cockroach-data/logs/cockroach-dev.log
    ~~~  
</section>

## See also

- [Monitoring and Alerting](monitoring-and-alerting.html)
- [Metrics](metrics.html)