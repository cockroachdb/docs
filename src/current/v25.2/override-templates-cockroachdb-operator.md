---
title: Override Deployment Templates with the CockroachDB Operator
summary: Use advanced configuration operations to manually override pod templates and cockroach start flags with the CockcroachDB operator.
toc: true
docs_area: deploy
---

The {{ site.data.products.cockroachdb-operator }} provides abstractions that simplify cluster deployment and node initialization:

- A default pod specification is used for the CockroachDB Kubernetes pod.
- The `values.yaml` configuration maps to a subset of `cockroach start` flags when CockroachDB is initialized.

This page describes configuration options that allow advanced users to manually override the pod template and `cockroach start` flags as needed for deployment.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
This page describes advanced configurations that override the supported default templates used by the {{ site.data.products.cockroachdb-operator }}. Cockroach Labs strongly recommends testing these configurations in a non-production environment first.
{{site.data.alerts.end}}

## Override the default pod

The `cockroachdb.crdbCluster.podTemplate` field allows you to override the default pod metadata and specification configured by the {{ site.data.products.cockroachdb-operator }}. The values in this field are merged with the default pod specification, where settings in `podTemplate` override any values in the default.

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
      # metadata captures the pod metadata for CockroachDB pods.
      metadata: {}
      # spec captures the pod specification for CockroachDB pods.
      spec:
        # initContainers captures the list of init containers for CockroachDB pods.
        initContainers:
          - name : cockroachdb-init
            image: us-docker.pkg.dev/cockroach-cloud-images/data-plane/init-container@sha256:c3e4ba851802a429c7f76c639a64b9152d206cebb31162c1760f05e98f7c4254
        # containers captures the list of containers for CockroachDB pods.
        containers:
          - name: cockroachdb
            image: cockroachdb/cockroach:v25.2.2
          - name: cert-reloader
            image: us-docker.pkg.dev/cockroach-cloud-images/data-plane/inotifywait:87edf086db32734c7fa083a62d1055d664900840
        # imagePullSecrets captures the secrets for fetching images from private registries.
        imagePullSecrets: []
~~~

At least one value for `containers` must be specified if any part of `podTemplate` is being modified. For example, the following `podTemplate` configuration overrides pod anti-affinity behavior and specifies a default `cockroachdb/cockroach:v25.2.2` container image:

~~~ yaml
cockroachdb:
  crdbCluster:
    podTemplate:
       spec:
         affinity:
           podAntiAffinity: 
               preferredDuringSchedulingIgnoredDuringExecution:
               - weight: 100
                 podAffinityTerm:
                   labelSelector:
                     matchExpressions:
                       - key: app.kubernetes.io/component
                         operator: In
                         values:
                           - cockroachdb
                   topologyKey: kubernetes.io/hostname
         containers:
           - name: cockroachdb
             image: cockroachdb/cockroach:v25.2.2
~~~

## Override the default `cockroach start` flags

The `cockroachdb.crdbCluster.startFlags` field allows you to customize the [`cockroach start` flags]({% link {{ page.version.version }}/cockroach-start.md %}#flags) used when initializing the CockroachDB cluster.

Within this field, you can specify flags to upsert and flags to omit:

- Upserted flags are added to the `cockroach start` command, their values overriding any matching flags in the command.
- Omitted flags are removed from the `cockroach start` command if they were present.

~~~ yaml
cockroachdb:
  crdbCluster:
    startFlags:
      # upsert captures a set of flags that are given higher precedence in the start command.
      upsert:
        - "--cache=30%"
      # omit defines a set of flags which will be omitted from the start command.
      omit:
        - "--max-sql-memory"
~~~
