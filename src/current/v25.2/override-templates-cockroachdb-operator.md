---
title: Override Deployment Templates with the CockroachDB Operator
summary: Use advanced configuration operations to manually override pod templates and cockroach start flags with the CockcroachDB operator.
toc: true
docs_area: deploy
---

The {{ site.data.products.cockroachdb-operator }} provides abstractions that simplify cluster deployment and node initialization:

- A default pod specification is used for the CockroachDB Kubernetes pod.
- The `values.yaml` configuration maps to a subset of `cockroach start` flags when CockroachDB is initialized.

This page describes configuration options that allow advanced users to manually override pod template metadata and `cockroach start` flags as needed for deployment.

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
This page describes advanced configurations that override the supported default templates used by the {{ site.data.products.cockroachdb-operator }}. Cockroach Labs strongly recommends testing these configurations in a non-production environment first.
{{site.data.alerts.end}}

## Override the default pod

The `cockroachdb.crdbCluster.podTemplate` field allows you to override the default pod metadata and specification configured by the {{ site.data.products.cockroachdb-operator }}. The values in this field are merged with the default pod specification, where settings in `podTemplate` override any values in the default.

The `podTemplate` field includes a `containers` field that specifies the container name and image that the template is applied to. By default, this resolves to the `cockroachdb` container name and can be excluded from modifications to the CockroachDB pod template YAML. If needed, you can provide specific images for the `containers` and `initContainers`. For example, the following `podTemplate` configuration specifies a custom init container:

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
            image: us-docker.pkg.dev/releases-prod/self-hosted/init-container@sha256:example1234567890abcdefghijklmnopqrstuvwxyz
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
