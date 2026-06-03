---
title: Migrate from the Public Operator
summary: Migration guide detailing how to migrate away from a deployment using the public Kubernetes operator to the CockroachDB operator.
toc: true
toc_not_nested: true
secure: true
docs_area: deploy
---

This guide describes how to automatically migrate an existing CockroachDB cluster from the {{ site.data.products.public-operator }} (v1alpha1 CrdbCluster) to the {{ site.data.products.cockroachdb-operator }} (v1beta1 CrdbCluster with CrdbNodes).

{{site.data.alerts.callout_info}}
The {{ site.data.products.cockroachdb-operator }} is in [Preview]({% link {{ page.version.version }}/cockroachdb-feature-availability.md %}).
{{site.data.alerts.end}}

The {{ site.data.products.cockroachdb-operator }}'s migration controller automatically handles the transition, including certificate migration, node-by-node replacement, and RBAC setup.

This migration can be completed without affecting cluster availability. The process preserves existing disks so that data does not need to be replicated into empty volumes. The controller migrates nodes one at a time, so the maximum cluster capacity will be reduced by one node periodically throughout the migration.

## Compatibility

Before starting migration, verify your cluster configuration is supported.

| Feature | Supported | Notes |
|---|---|---|
| Self-signer certs (operator built-in) | Yes | Regenerated with join service DNS SANs; originals preserved |
| cert-manager certs | Yes | Certificate CR updated with join service DNS SANs; issuer references preserved |
| External certs (user-provided secrets) | Yes | Secret references preserved as ExternalCertificates |
| Custom `NodeTLSSecret` / `ClientTLSSecret` | Yes | CrdbNode pods mount user's secrets directly; cert regeneration skipped (see prerequisites) |
| Insecure clusters (TLS disabled) | Yes | Detected from `--insecure` flag; cert migration phase skipped entirely |
| WAL failover (dedicated PVC) | No | WAL failover detection only runs for Helm migrations. Not supported for operator path |
| Dedicated logs PVC (`logsdir` / `logs-dir`) | No | LogsStore detection only runs for Helm migrations. Not supported for operator path |
| PCR (virtualized/standby) | No | PCR detection only runs for Helm migrations (init job pattern). Not supported for operator path |
| Custom service account | Yes | Preserved with `create: false` |
| Custom start flags / `additionalArgs` | Partial | Known operator-managed flags excluded; `additionalArgs` converted to `startFlags.upsert` |
| `cache` / `max-sql-memory` | Yes | Converted to start flags |
| Multi-region | Yes | Requires `regionCode` and `cloudProvider` annotations before starting |
| Ingress | Partial | v1alpha1 ingress config preserved as annotation on v1beta1. Ingress resources not modified. Manual adoption required |
| ServiceMonitor / PodMonitor | No | Not handled by migration. Must be recreated manually to match new pod labels |
| NetworkPolicy | No | Must be recreated manually if present |
| Log ConfigMap key format | Yes | `logging.yaml` key automatically renamed to `logs.yaml` (reversed on rollback) |

## Before you begin

Before starting the migration process, verify the following:

- Your CockroachDB cluster is managed by the {{ site.data.products.public-operator }} (v1alpha1 CrdbCluster).
- All StatefulSet pods are Running and Ready with no pending rolling updates or scale operations.
- `kubectl` and `helm` are installed and configured with access to the target cluster.
- For multi-region clusters, cloud region and provider labels are applied to Kubernetes nodes.
- You have the `regionCode` and `cloudProvider` values for your cluster.
- You have reviewed the Compatibility table above and confirmed your configuration is supported.
- The {{ site.data.products.public-operator }} is accessible and running (required for rollback capability).

{{site.data.alerts.callout_info}}
If you plan to create new v1beta1 clusters while the {{ site.data.products.public-operator }} is running, you must patch the {{ site.data.products.public-operator }}'s webhooks to use `matchPolicy: Exact`. Refer to the Coexistence section in Step 5.
{{site.data.alerts.end}}

{{site.data.alerts.callout_danger}}
If you use custom `NodeTLSSecret` or `ClientTLSSecret`, your certificates must include join service DNS SANs (`{cluster-name}-join`, `{cluster-name}-join.{namespace}`, `{cluster-name}-join.{namespace}.svc.cluster.local`). The migration controller cannot regenerate certificates when custom secrets are provided because the CA private key is not available.
{{site.data.alerts.end}}

## Overview

### What the Migration Controller Does Automatically

- Detects cert-manager, self-signer, or custom TLS secrets. Self-signer and cert-manager
  certs are regenerated with join service DNS SANs automatically. When custom `NodeTLSSecret` /
  `ClientTLSSecret` are set, skips cert regeneration and mounts the user's secrets directly.
- Creates RBAC resources with namespace-qualified names for cluster-scoped resources.
- Migrates ConfigMap key format (`logging.yaml` to `logs.yaml`).
- Converts v1alpha1 CrdbCluster spec to v1beta1 via conversion webhook.
- Deletes old PDB and creates a new one during finalization (no protection gap because the new PDB is
  created immediately after old PDB deletion).
- Updates service selectors and restores them on rollback.
- Migrates nodes one at a time, verifying cluster health between each node.
- Preserves Ingress configuration from v1alpha1 CR as annotation on v1beta1 CrdbCluster.
- Removes `crdb.io/skip-reconcile` label as the last step of rollback so the public operator
  resumes control cleanly.

### What Requires Manual Action

- `crdb.io/skip-reconcile=true` must be applied to the v1alpha1 CrdbCluster before starting migration.
- Cloud region and provider annotations must be applied to the CrdbCluster before starting migration.
- Cloud region and provider node labels must be applied to K8s nodes for multi-region clusters.
- The StatefulSet must be manually deleted after finalization to complete migration.
- Old public operator resources must be cleaned up after migration.
- ServiceMonitor / PodMonitor resources must be recreated with updated pod labels.

### Migration Phases

```
Init -> CertMigration -> PodMigration -> Finalization -> (user deletes STS) -> Complete
```

| Phase | Duration (approx.) | What happens |
|---|---|---|
| Init | Seconds | Validates prerequisites (including `skip-reconcile`), creates v1beta1 CrdbCluster via conversion webhook, records original replica count |
| CertMigration | Seconds to minutes | Detects cert type, regenerates certs with join service SANs, creates CA ConfigMap, renames ConfigMap key (`logging.yaml` → `logs.yaml`), labels existing pods |
| PodMigration | ~5-15 min per node | Creates CrdbNode, waits for health, scales down STS by one. Repeats for each node (highest index first) |
| Finalization | Seconds | Sets cluster spec (regions, TLS, resources), deletes old PDB, creates new PDB, sets Mode=MutableOnly |
| Complete | Seconds (after user deletes STS) | Records completion, updates migration label to `complete` |

---

## Step 1. Export environment variables

```bash
# CRDBCLUSTER is the name of your v1alpha1 CrdbCluster CR.
export CRDBCLUSTER=cockroachdb

# NAMESPACE is the namespace where the CrdbCluster is installed.
export NAMESPACE=default

# CLOUD_PROVIDER is the cloud vendor where the K8s cluster is running.
# Supported: gcp, aws, azure
export CLOUD_PROVIDER=gcp

# REGION corresponds to the cloud provider's identifier for this region.
# It must match the "topology.kubernetes.io/region" label on K8s nodes.
export REGION=us-central1
```

## Step 2. Apply cloud region and provider labels (multi-region only)

CockroachDB uses K8s node labels for locality-based pod placement. These labels must exist
before the operator starts scheduling pods.

```bash
# GCP
kubectl label node <node-name> \
  topology.kubernetes.io/region=us-central1 \
  topology.kubernetes.io/zone=us-central1-a \
  cockroach.io/cloud=gcp

# AWS
kubectl label node <node-name> \
  topology.kubernetes.io/region=us-east-1 \
  topology.kubernetes.io/zone=us-east-1a \
  cockroach.io/cloud=aws

# Azure
kubectl label node <node-name> \
  topology.kubernetes.io/region=eastus \
  topology.kubernetes.io/zone=eastus-1 \
  cockroach.io/cloud=azure
```

## Step 3. Pause the {{ site.data.products.public-operator }}

The public operator must stop reconciling the cluster before installing the CockroachDB Operator.
Without this, both controllers will fight over RBAC, PDB, and service selectors.

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/skip-reconcile="true" -n $NAMESPACE
```

Wait until the public operator finishes any in-progress reconciliation before proceeding.
Verify the StatefulSet is not currently rolling:

```bash
kubectl rollout status sts $CRDBCLUSTER -n $NAMESPACE
# Expected: statefulset rolling update complete

# No new events should appear after applying the label
kubectl describe crdbcluster $CRDBCLUSTER -n $NAMESPACE | grep -A5 Events
```

If the `skip-reconcile` label is not applied, migration will fail with:
`missing required label: crdb.io/skip-reconcile=true`

> **Important**: The `crdb.io/skip-reconcile=true` label must remain on the v1alpha1 CrdbCluster
> for as long as the public operator is running. The public operator reconciles any CrdbCluster
> without this label and will recreate the StatefulSet and associated resources if it regains
> control. Do not remove this label until after the public operator has been fully uninstalled
> (Step 12). Removing it while the public operator is still running will cause it to recreate
> the StatefulSet, potentially conflicting with the migrated CrdbNodes.

## Step 4. Annotate the CrdbCluster with region and cloud provider

Annotate the CR with region and cloud provider so they are preserved during the v1alpha1 to
v1beta1 conversion:

```bash
kubectl annotate crdbcluster $CRDBCLUSTER \
  crdb.cockroachlabs.com/cloudProvider=$CLOUD_PROVIDER \
  crdb.cockroachlabs.com/regionCode=$REGION \
  --overwrite -n $NAMESPACE
```

The fallback order for region resolution is: (1) `regions` annotation (for multi-region),
(2) `regionCode` and `cloudProvider` annotations, (3) operator environment configuration,
(4) default `us-east1`. For single-region clusters, the default may be acceptable.

## Step 5. Install the {{ site.data.products.cockroachdb-operator }} with migration enabled

Install the operator with migration enabled. The migration controller only acts on
resources that have the `crdb.io/migrate` label, and the cluster controller skips clusters
with `Mode=Disabled` (which the conversion webhook sets for all v1alpha1 clusters). The
CockroachDB Operator will not interfere with clusters that have not been explicitly marked
for migration.

```bash
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator \
  --set migration.enabled=true
```

Setting `watchNamespaces` is optional. It restricts the CockroachDB Operator to a subset of
namespaces, which can be useful for reducing blast radius in large environments.

```bash
helm upgrade --install crdb-operator ./cockroachdb-parent/charts/operator \
  --set migration.enabled=true \
  --set watchNamespaces=$NAMESPACE
```

> `migration.enabled=true` on the **operator chart** enables the migration controller and
> registers the conversion webhook (translates between v1alpha1 and v1beta1). This is different
> from `migration.enabled=true` on the **cockroachdb chart** (used later in Step 12), which
> relaxes pre-upgrade validation so the chart can adopt an existing migrated CrdbCluster.
> Both must be set at their respective steps.

Verify the operator is running and the conversion webhook is active:

```bash
kubectl get pods -l app=cockroachdb-operator -n $NAMESPACE
kubectl get crd crdbclusters.crdb.cockroachlabs.com

# Verify both API versions are accessible (conversion webhook is active)
kubectl get crdbclusters.v1alpha1.crdb.cockroachlabs.com $CRDBCLUSTER -n $NAMESPACE
kubectl get crdbclusters.v1beta1.crdb.cockroachlabs.com $CRDBCLUSTER -n $NAMESPACE
```

Both commands should return the same CrdbCluster resource, confirming the conversion
webhook is translating between API versions.

The operator's ClusterRole and ClusterRoleBinding must use unique names to avoid overwriting
the public operator's RBAC. The Helm chart handles this automatically.

If the CockroachDB Operator is deployed in the **same namespace** as the public operator, ensure
the `appLabel` differs between the two so their Deployment selectors and Services do not
conflict. The CockroachDB Operator chart defaults to `appLabel=cockroachdb-operator`, which is
distinct from the public operator's `app=cockroach-operator`. Do not change this default
when coexisting with the public operator. If you previously customized `appLabel`, verify
it does not collide with the public operator's pod selector.

When migrating clusters across multiple namespaces, migrate one namespace at a time. Update
`watchNamespaces` (or use a comma-separated list) to include additional namespaces only after
the previous migration is complete.

### Coexistence with the Public Operator

The CockroachDB Operator and the public operator can run side by side during migration.
Installing the CockroachDB Operator with `migration.enabled=true` replaces the CRD with a
dual-version CRD (v1alpha1 + v1beta1) and registers a conversion webhook. Existing clusters
continue to work normally.

#### What works

| Scenario | Behavior |
|---|---|
| Existing v1alpha1 clusters (not being migrated) | Continue to be reconciled by the public operator. The CockroachDB Operator ignores them (`Mode=Disabled`). |
| New v1alpha1 clusters created with both operators present | Reconciled by the public operator. The CockroachDB Operator's v1beta1 webhooks do not intercept v1alpha1 requests. |
| New v1beta1 clusters created with both operators present | The CockroachDB Operator's mutating webhook automatically injects `crdb.io/skip-reconcile=true`. The public operator sees this label and skips reconciliation. |
| Updating existing v1alpha1 clusters | Works normally. Only the public operator's webhooks validate the request. |

#### What does not work

| Scenario | Reason |
|---|---|
| Creating v1beta1 clusters without patching public operator webhooks | The public operator's webhooks use `matchPolicy: Equivalent` (the Kubernetes default), so they intercept v1beta1 requests after converting them to v1alpha1. The converted object fails the public operator's validation. |
| Both operators reconciling the same cluster | Only one operator should own a cluster at a time. Use `crdb.io/skip-reconcile=true` to hand off. |
| Running both operators with overlapping namespace scopes | Untested. Use `watchNamespaces` to separate them if needed. |

#### How webhook isolation works

Both operators' webhooks must use `matchPolicy: Exact` to prevent cross-version interception.
The CockroachDB Operator's webhooks ship with this setting. The public operator's webhooks
use the Kubernetes default (`Equivalent`), which causes them to intercept v1beta1 requests
after Kubernetes converts them to v1alpha1. To create v1beta1 clusters while the public
operator is present, update the public operator's webhooks to use `matchPolicy: Exact`.

**Option 1: Edit the public operator manifest before installing.** Download the manifest,
add `matchPolicy: Exact` to both webhook entries, then apply:

```bash
curl -sL https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.18.3/install/operator.yaml \
  | sed '/rules:/i\    matchPolicy: Exact' \
  | kubectl apply -f -
```

**Option 2: Patch the live webhook configs.** This does not persist across public operator
redeploys:

```bash
kubectl patch validatingwebhookconfiguration cockroach-operator-validating-webhook-configuration \
  --type=json -p='[{"op":"add","path":"/webhooks/0/matchPolicy","value":"Exact"}]'
kubectl patch mutatingwebhookconfiguration cockroach-operator-mutating-webhook-configuration \
  --type=json -p='[{"op":"add","path":"/webhooks/0/matchPolicy","value":"Exact"}]'
```

With both sides using `matchPolicy: Exact`, a v1alpha1 request triggers only the public
operator's webhooks, and a v1beta1 request triggers only the CockroachDB Operator's webhooks.

This patching is only needed if you plan to create new v1beta1 clusters while the public
operator is still running. Migration of existing v1alpha1 clusters does not require it
because the migration controller works with the v1alpha1 API directly.

#### How conversion works

**v1alpha1 clusters without `skip-reconcile`** are converted to v1beta1 with `Mode=Disabled`
for storage. The CockroachDB Operator ignores clusters in this mode.

**v1beta1 cluster protection**: The CockroachDB Operator's mutating webhook injects
`crdb.io/skip-reconcile=true` on every v1beta1 CrdbCluster. This label is stored on the
object and carried through to the v1alpha1 view via ObjectMeta, so the public operator
sees it and skips reconciliation.

In summary, you can:
- Keep existing v1alpha1 clusters running with the public operator
- Create new v1alpha1 clusters while the CockroachDB Operator is installed
- Create new v1beta1 clusters while the public operator is still running
- Migrate clusters one by one at your own pace

## Step 6. Start the migration

Initiate the migration by labeling the v1alpha1 CrdbCluster.

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=start -n $NAMESPACE
```

## Step 7. Monitor the migration

### DB Console

The DB Console is accessible via the public service throughout migration.

```bash
# Port-forward to access DB Console
kubectl port-forward svc/${CRDBCLUSTER}-public 8080 -n $NAMESPACE
# Then open https://localhost:8080 in your browser
```

Key things to monitor in the DB Console:

- **Node List**: Watch for nodes joining and leaving as migration progresses. Total node
  count stays constant (new CrdbNode created before old STS pod is removed).
- **Replication Status**: Under-replicated and unavailable ranges should stay at zero.
  The migration controller waits for under-replicated ranges to clear before proceeding
  to the next node.
- **Ranges Dashboard**: Under-replicated ranges counter should not increase during migration.

### CockroachDB Health Checks

The controller performs these checks automatically between each node migration, but you can
verify manually:

```bash
# Check under-replicated ranges (should be 0)
# During migration, STS pods use container name "db"; after migration, CrdbNode pods use "cockroachdb"
kubectl exec $CRDBCLUSTER-0 -n $NAMESPACE -c db -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"

# Check all nodes are live (count should match total nodes)
kubectl exec $CRDBCLUSTER-0 -n $NAMESPACE -c db -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT count(DISTINCT node_id) FROM crdb_internal.kv_store_status;"

# For insecure clusters, replace --certs-dir with --insecure
```

### Watch migration status

The migration status is recorded on the v1beta1 CrdbCluster (created via conversion webhook).

```bash
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.status.migration.phase} {.status.migration.message}' -w
```

### Watch events

```bash
kubectl get events -n $NAMESPACE \
  --field-selector involvedObject.name=$CRDBCLUSTER \
  --sort-by='.lastTimestamp'
```

### Watch CrdbNode creation during PodMigration

```bash
kubectl get crdbnode -n $NAMESPACE \
  -l crdb.cockroachlabs.com/cluster=$CRDBCLUSTER -w
```

### Phase-Specific Checks

| Phase | What to watch |
|-------|---------------|
| Init | `kubectl describe crdbcluster $CRDBCLUSTER` for MigrationStarted event |
| CertMigration | For self-signer: `kubectl get secret $CRDBCLUSTER-node-secret -n $NAMESPACE`. For cert-manager: check the secret name from the Certificate CR (`kubectl get certificate $CRDBCLUSTER-node -n $NAMESPACE -o jsonpath='{.spec.secretName}'`). For custom `NodeTLSSecret`: your existing secret is used directly. TLS clusters only |
| PodMigration | `kubectl get crdbnode -n $NAMESPACE -w` for one node per pod |
| Finalization | `kubectl get crdbcluster $CRDBCLUSTER -o jsonpath='{.status.migration.message}'` for "Finalization complete" |
| Complete | After StatefulSet deletion; `spec.mode: MutableOnly` and `crdb.io/migrate` label changes to `complete` |

### Auto-pause behavior

During PodMigration, if a newly created CrdbNode does not pass health checks within
**10 minutes**, the controller automatically pauses migration by setting the phase to
`PhaseStopped`. Health checks run every **10 seconds** and verify:

1. CrdbNode has `PodReady=True` condition
2. Pod is in `Running` phase with `Ready=True` condition
3. SQL health check passes (zero under-replicated ranges and correct live node count)
4. Pod is registered in the headless service endpoints

When auto-paused, investigate the stuck node and resume with `kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=start --overwrite`.

### Prometheus Metrics

```
crdb_operator_migration_phase{cluster, namespace, phase}
crdb_operator_migration_pods_total{cluster, namespace}
crdb_operator_migration_pods_migrated{cluster, namespace}
crdb_operator_migration_duration_seconds{cluster, namespace, phase}
crdb_operator_migration_errors_total{cluster, namespace, phase, error_type}
crdb_operator_migration_rollbacks_total{cluster, namespace, reason}
```

### PDB Behavior During Migration

- **Init through PodMigration**: The original public operator PDB remains active. Pod disruption
  protection is maintained throughout.
- **Finalization**: The controller deletes the old PDB (`{name}` or `{name}-budget`) and
  immediately creates the new PDB (`{name}-pdb`). There is no gap in protection.
- **Rollback**: All PDB variants are deleted (`{name}`, `{name}-budget`, `{name}-pdb`).
  The original PDB is recreated by the public operator once `skip-reconcile` is removed.

## Step 8. Delete the StatefulSet to complete migration

After Finalization completes, the controller stops processing and waits for the user to
delete the StatefulSet. The StatefulSet is intentionally left intact. Once deleted, the
controller sets `spec.mode=MutableOnly` and records `Phase=Complete`.

```bash
# Verify Finalization is done (Mode is still Disabled at this point)
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.status.migration.message}'
# Expected: Finalization complete. Delete the StatefulSet to mark migration complete.

# Delete the StatefulSet to trigger Phase=Complete
kubectl delete sts $CRDBCLUSTER -n $NAMESPACE

# Verify completion (may take a few seconds)
# Mode switches to MutableOnly and label changes to "complete" after STS deletion.
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.spec.mode} {.status.migration.phase}'
# Expected: MutableOnly Complete
```

All STS pods are already at replicas=0 by the time Finalization runs. Deleting the StatefulSet
object does not evict any running pods.

## Step 9. Verify cluster health post-migration

```bash
# All CrdbNodes should be healthy
kubectl get crdbnode -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$CRDBCLUSTER

# All pods running
kubectl get pods -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$CRDBCLUSTER

# Verify data integrity from any CrdbNode pod
# Note: post-migration, the container name is "cockroachdb" (not "db" as in the original STS)
kubectl exec $CRDBCLUSTER-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT count(*) FROM [SHOW RANGES];"

# Verify under-replicated ranges are zero
kubectl exec $CRDBCLUSTER-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"
```

### Verify preserved configurations

```bash
# WAL failover (if configured)
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.spec.template.spec.walFailoverSpec}'

# Logs PVC (if configured)
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.spec.template.spec.logsStore}'

# ConfigMap key format (should be logs.yaml, not logging.yaml)
kubectl get configmap <log-config-name> -n $NAMESPACE -o yaml | grep -E "logging.yaml|logs.yaml"

# TLS certificates (secret names depend on cert type)
# Self-signer: {name}-node-secret, {name}-client-secret (regenerated by migration)
kubectl get secret $CRDBCLUSTER-node-secret -n $NAMESPACE
kubectl get secret $CRDBCLUSTER-client-secret -n $NAMESPACE
# cert-manager: secrets are managed by cert-manager (names from Certificate CR)
kubectl get certificate $CRDBCLUSTER-node -n $NAMESPACE -o jsonpath='{.spec.secretName}'
# Custom NodeTLSSecret/ClientTLSSecret: your original secrets are used directly
# CA ConfigMap (created for all TLS cert types)
kubectl get configmap $CRDBCLUSTER-ca-crt -n $NAMESPACE
```

### Verify v1alpha1 → v1beta1 field conversion

Key fields converted during migration:

| v1alpha1 field | v1beta1 field |
|---|---|
| `spec.image.name` | `spec.template.spec.image` |
| `spec.grpcPort` / `spec.sqlPort` / `spec.httpPort` | `spec.template.spec.grpcPort` / `sqlPort` / `httpPort` |
| `spec.cache` | `spec.template.spec.startFlags.upsert` (`--cache=<value>`) |
| `spec.maxSQLMemory` | `spec.template.spec.startFlags.upsert` (`--max-sql-memory=<value>`) |
| `spec.additionalArgs` | `spec.template.spec.startFlags.upsert` |
| `spec.nodeTLSSecret` | CrdbNode mounts this secret directly (cert regeneration skipped) |
| `spec.clientTLSSecret` | CrdbNode mounts this secret directly (cert regeneration skipped) |
| `spec.logConfigMap` | `spec.template.spec.loggingConfigMapName` (key renamed `logging.yaml` → `logs.yaml`) |
| `spec.terminationGracePeriodSecs` | Used directly in pod spec |
| `spec.resources` | `spec.template.spec.podTemplate.spec.containers[0].resources` |

## Step 10. Configure LocalityMappings

The migration controller preserves the `--locality` flag tier keys (e.g. `region`, `zone`)
as `localityLabels` on the CrdbNodeSpec. `localityLabels` is deprecated in favor of
`localityMappings`, which maps K8s node labels to CockroachDB locality tiers. The default
mapping covers standard K8s topology labels (`topology.kubernetes.io/region` → `region`,
`topology.kubernetes.io/zone` → `zone`).

If your cluster uses custom K8s node labels for locality, update `localityMappings` to
match. Each entry maps a K8s node label key to a CockroachDB locality tier name.

```bash
kubectl patch crdbcluster $CRDBCLUSTER -n $NAMESPACE --type merge -p '
spec:
  template:
    spec:
      localityMappings:
        - nodeLabel: "my-custom-label/region"
          localityLabel: "region"
        - nodeLabel: "my-custom-label/zone"
          localityLabel: "zone"
'
```

If you are using the standard `topology.kubernetes.io/*` labels, the kubebuilder defaults
are correct and no action is needed.

## Step 11. Clean up {{ site.data.products.public-operator }} resources

After verifying the migrated cluster is healthy, clean up old public operator resources.

### Migration-created RBAC (stale)

```bash
# Migration-created ClusterRole/ClusterRoleBinding use "{namespace}-{name}" naming
kubectl delete clusterrole ${NAMESPACE}-${CRDBCLUSTER} --ignore-not-found
kubectl delete clusterrolebinding ${NAMESPACE}-${CRDBCLUSTER} --ignore-not-found
```

### Public operator RBAC

```bash
# Public operator's ClusterRole and ClusterRoleBinding
kubectl delete clusterrole cockroachdb-operator --ignore-not-found
kubectl delete clusterrolebinding cockroachdb-operator --ignore-not-found
```

### Public operator deployment and CRDs

Only do this after all clusters managed by the public operator have been migrated.

```bash
# Delete the public operator Deployment
kubectl delete deployment cockroach-operator-manager -n cockroach-operator-system --ignore-not-found

# Delete public operator CRDs (this removes the v1alpha1 API entirely)
kubectl delete -f https://raw.githubusercontent.com/cockroachdb/cockroach-operator/v2.18.3/install/crds.yaml --ignore-not-found
```

### Public operator webhook configurations

```bash
# The public operator registers its own validation/mutation webhooks
kubectl delete validatingwebhookconfiguration cockroach-operator-validating-webhook-configuration --ignore-not-found
kubectl delete mutatingwebhookconfiguration cockroach-operator-mutating-webhook-configuration --ignore-not-found
```

### Public operator ServiceAccount and RBAC in its namespace

```bash
kubectl delete serviceaccount cockroach-operator-sa -n cockroach-operator-system --ignore-not-found
kubectl delete role cockroach-operator-role -n cockroach-operator-system --ignore-not-found
kubectl delete rolebinding cockroach-operator-rolebinding -n cockroach-operator-system --ignore-not-found
```

## Step 12. Adopt into the CockroachDB Helm chart (optional)

Before adopting, verify the operator has fully reconciled the migrated cluster. Do not
proceed until `generation` and `observedGeneration` match and all pods are running.

```bash
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.metadata.generation} {.status.observedGeneration}'
# Both values should match

kubectl get pods -n $NAMESPACE -l crdb.cockroachlabs.com/cluster=$CRDBCLUSTER
# All pods should be Running and Ready
```

If you want `helm upgrade` to manage the migrated CrdbCluster going forward, you need to
annotate existing resources for Helm ownership and provide a `values.yaml` that matches
the migrated spec.

### Prepare values.yaml

Inspect the migrated CrdbCluster and map its spec to Helm values.

```bash
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE -o yaml
```

### Option A: Generate values.yaml automatically

```bash
./bin/migration-helper export-values \
  --crdb-cluster $CRDBCLUSTER \
  --namespace $NAMESPACE \
  --output-dir ./manifests
```

Review the generated file:

```bash
cat ./manifests/values.yaml
```

If the generated file contains `cockroachdb.crdbCluster.rbac.serviceAccount.name`, keep
that value as is. It preserves the service account used by the migrated cluster.

### Option B: Build values.yaml manually

Key values to set:

| Helm value | Source from migrated CrdbCluster |
|---|---|
| `cockroachdb.crdbCluster.image.name` | `spec.template.spec.image` |
| `cockroachdb.crdbCluster.regions` | `spec.regions` (code, nodes, namespace, cloudProvider) |
| `cockroachdb.tls.enabled` | `spec.tlsEnabled` |
| `cockroachdb.crdbCluster.rbac.serviceAccount.name` | `spec.template.spec.serviceAccountName` (leave empty to use default fullname) |
| `cockroachdb.crdbCluster.resources` | `spec.template.spec.podTemplate.spec.containers[0].resources` |
| `cockroachdb.crdbCluster.rollingRestartDelay` | `spec.rollingRestartDelay` |
| `cockroachdb.crdbCluster.clusterSettings` | `spec.clusterSettings` |

The v1alpha1 CrdbCluster fields (cache, max-sql-memory, additionalArgs) were converted to
`spec.template.spec.startFlags.upsert` during migration. Map these to the appropriate Helm
values or pass them via `cockroachdb.crdbCluster.startFlags`.

### Field Mapping Reference

| Source (v1alpha1) | Migrated v1beta1 shape | Helm adoption value |
|---|---|---|
| `metadata.name` | `CrdbCluster.metadata.name` | `k8s.fullnameOverride` |
| `spec.image.name` | `spec.template.spec.image` | `cockroachdb.crdbCluster.image.name` |
| `spec.dataStore` | `spec.template.spec.dataStore` | `cockroachdb.crdbCluster.dataStore` |
| `spec.logConfigMap` | `spec.template.spec.loggingConfigMapName` (key renamed `logging.yaml` → `logs.yaml`) | `cockroachdb.crdbCluster.loggingConfigMapName` |
| `spec.resources` | `spec.template.spec.podTemplate.spec.containers[0].resources` | `cockroachdb.crdbCluster.podTemplate.spec` |
| `spec.cache` | `spec.template.spec.startFlags.upsert` (`--cache=<value>`) | `cockroachdb.crdbCluster.startFlags` |
| `spec.maxSQLMemory` | `spec.template.spec.startFlags.upsert` (`--max-sql-memory=<value>`) | `cockroachdb.crdbCluster.startFlags` |
| `spec.additionalArgs` | `spec.template.spec.startFlags.upsert` | `cockroachdb.crdbCluster.startFlags` |
| Service account | `spec.template.spec.podTemplate.spec.serviceAccountName` | `cockroachdb.crdbCluster.rbac.serviceAccount.name` with `create=false` |
| Pod annotations | `spec.template.spec.podTemplate.metadata.annotations` | `cockroachdb.crdbCluster.podTemplate.metadata.annotations` |
| Priority class | `spec.template.spec.podTemplate.spec.priorityClassName` | `cockroachdb.crdbCluster.podTemplate.spec.priorityClassName` |
| Ingress intent | Preserved as annotation on CrdbCluster | `cockroachdb.crdbCluster.service.ingress` |

### Annotate resources for Helm ownership

```bash
export RELEASE_NAME="<your-helm-release-name>"

# Namespace-scoped resources
for RESOURCE in \
  "crdbcluster/${CRDBCLUSTER}" \
  "serviceaccount/${CRDBCLUSTER}-sa" \
  "service/${CRDBCLUSTER}-public" \
  "role/${CRDBCLUSTER}" \
  "rolebinding/${CRDBCLUSTER}"; do
  kubectl annotate "${RESOURCE}" \
    meta.helm.sh/release-name="${RELEASE_NAME}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    -n "${NAMESPACE}" --overwrite
  kubectl label "${RESOURCE}" \
    app.kubernetes.io/managed-by=Helm \
    -n "${NAMESPACE}" --overwrite
done

# Ingress resources (only if your cluster has Ingress resources)
for RESOURCE in \
  "ingress/ui-${CRDBCLUSTER}" \
  "ingress/sql-${CRDBCLUSTER}"; do
  kubectl get "${RESOURCE}" -n "${NAMESPACE}" 2>/dev/null && \
  kubectl annotate "${RESOURCE}" \
    meta.helm.sh/release-name="${RELEASE_NAME}" \
    meta.helm.sh/release-namespace="${NAMESPACE}" \
    -n "${NAMESPACE}" --overwrite && \
  kubectl label "${RESOURCE}" \
    app.kubernetes.io/managed-by=Helm \
    -n "${NAMESPACE}" --overwrite
done
```

Do not annotate the headless service (`service/${CRDBCLUSTER}`). The headless service is
operator-managed and not templated by the CockroachDB Helm chart.

Do not annotate the migration-created ClusterRole/ClusterRoleBinding. The CockroachDB Helm
chart creates its own cluster-scoped RBAC with different names
(`{fullname}-{namespace}-node-reader`). Delete the stale migration-created ones after
Helm adoption:

```bash
# Migration-created ClusterRole/ClusterRoleBinding use "{namespace}-{name}" naming
kubectl delete clusterrole ${NAMESPACE}-${CRDBCLUSTER} --ignore-not-found
kubectl delete clusterrolebinding ${NAMESPACE}-${CRDBCLUSTER} --ignore-not-found
```

{{site.data.alerts.callout_info}}
**Split-chart deployments**: In multi-tenant environments where tenant namespaces cannot create cluster-scoped RBAC, platform teams can pre-create node-reader ClusterRole and ClusterRoleBinding through the operator chart's `nodeReader` values. Tenants can then set `cockroachdb.crdbCluster.rbac.nodeReader.create=false` in their CockroachDB chart values to use the platform-provided RBAC instead of creating their own. When transitioning from migration-created node-reader RBAC to platform-managed RBAC, upgrade the operator chart first with matching `nodeReader.subjects`, then upgrade the CockroachDB chart with `nodeReader.create=false`. Refer to the [CockroachDB Helm chart README](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb-parent/charts/cockroachdb/README.md#split-chart-node-reader-rbac) and [operator chart README](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb-parent/charts/operator/README.md#split-chart-node-reader-rbac) for details.
{{site.data.alerts.end}}

### Run Helm install

There is no existing Helm release for the migrated cluster, so use `--install` to create one.

```bash
helm upgrade --install ${RELEASE_NAME} ./cockroachdb-parent/charts/cockroachdb \
  --namespace ${NAMESPACE} \
  --set migration.enabled=true \
  --values your-values.yaml
```

Verify the install succeeded:

```bash
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.metadata.labels.app\.kubernetes\.io/managed-by}'
# Expected: Helm
```

Use `migration.enabled=true` on the **cockroachdb chart** only for migration adoption. It
relaxes pre-upgrade validation so the chart can adopt an existing migrated CrdbCluster
without blocking on CRD checks. This is separate from `migration.enabled=true` on the
**operator chart** (set in Step 5), which enables the migration controller itself.

After adoption is verified, consider performing a rolling restart to confirm chart-managed
configuration is fully applied. Post-migration there is no StatefulSet, so trigger a rolling
restart via `helm upgrade` with an updated timestamp:

```bash
helm upgrade ${RELEASE_NAME} ./cockroachdb-parent/charts/cockroachdb \
  --namespace ${NAMESPACE} \
  --set migration.enabled=true \
  --set cockroachdb.crdbCluster.timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --values your-values.yaml
```

Verify generation matching to confirm the operator has reconciled:

```bash
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.metadata.generation} {.status.observedGeneration}'
# Both values should match
```

### Update Certificate Mode After Adoption

After migration, all certificate references are stored as `externalCertificates` on the
CrdbCluster spec, regardless of the original cert type. The `export-values` tool outputs
these as `cockroachdb.tls.externalCertificates`. After Helm adoption, update your
`values.yaml` to use the cert mode that matches your intended ongoing management:

- **Self-signer**: Switch to `cockroachdb.tls.selfSigner.enabled: true` and remove the
  `externalCertificates` block. The operator's self-signer will manage cert rotation going
  forward. The migration-created `{name}-node-secret` and `{name}-client-secret` secrets
  become stale once the self-signer creates its own. Delete them after verifying the new
  certs are working.
- **cert-manager**: Switch to `cockroachdb.tls.certManager.enabled: true` with the
  appropriate issuer reference. The migration preserved the Certificate CR and its
  `spec.secretName`, so cert-manager continues to manage rotation. Remove the
  `externalCertificates` block from values.
- **User-provided / External**: Keep `cockroachdb.tls.externalCertificates` as exported.
  You are responsible for cert rotation.

After updating cert mode, run `helm upgrade` again and verify pods are healthy. Clean up
any stale secrets that are no longer referenced:

```bash
# Check which secrets are actually mounted by pods
kubectl get pod $CRDBCLUSTER-0 -n $NAMESPACE -o jsonpath='{.spec.volumes[*].secret.secretName}'

# Delete stale migration-created secrets if they are no longer mounted
kubectl delete secret $CRDBCLUSTER-node-secret -n $NAMESPACE --ignore-not-found
kubectl delete secret $CRDBCLUSTER-client-secret -n $NAMESPACE --ignore-not-found
```

## Multi-Cluster Migration Strategy

When you have multiple clusters across different namespaces, you can migrate them one at a
time while the public operator continues managing the remaining v1alpha1 clusters.

### Deployment pattern

Deploy one namespace-scoped CockroachDB Operator per namespace using `watchNamespaces`.
This provides clean isolation where each operator manages only the clusters in its namespace.

```
ns-prod-1:  public operator cluster-1  +  CockroachDB Operator (scoped, migration=true)
ns-prod-2:  public operator cluster-2  (no CockroachDB Operator yet)
ns-staging: CockroachDB Operator (scoped, migration=false)  +  fresh v1beta1 cluster
```

### The migration flag rule

At least one CockroachDB Operator must have `migration.enabled=true` as long as any v1alpha1
cluster exists anywhere in the Kubernetes cluster. The CRD conversion webhook is a
cluster-wide resource. The public operator reads and writes v1alpha1 CrdbClusters, and since
the storage version is v1beta1, every v1alpha1 interaction goes through the webhook. Only
operators started with `migration.enabled=true` register the `/convert` endpoint.

It does not matter which operator has the flag. The conversion endpoint is stateless and
handles requests for any namespace. But at least one must be running and reachable.

Operators that only manage fresh v1beta1 clusters do not need the migration flag. When an
operator starts without migration enabled, it checks the CRD's `storedVersions` field. If
v1alpha1 is present and an existing conversion webhook is already configured (by another
operator), it preserves the webhook and starts normally.

### Creating new v1beta1 clusters during migration

You can create new v1beta1 clusters at any point during migration. Install a namespace-scoped
CockroachDB Operator in a separate namespace and create v1beta1 CrdbCluster resources directly.
The mutating webhook automatically injects `crdb.io/skip-reconcile=true` so the public
operator ignores these clusters.

The new operator does not need `migration.enabled=true` as long as another operator already
has it enabled.

### Gradual migration across namespaces

**Phase 1 - Migrate the first namespace:**

1. Install a CockroachDB Operator in ns-1 with `migration.enabled=true` and `watchNamespaces=ns-1`.
2. Apply `skip-reconcile` and cloud annotations on the cluster in ns-1.
3. Label the cluster with `crdb.io/migrate=start`.
4. Monitor migration, delete StatefulSet when in Finalization.
5. The cluster in ns-2 continues running under the public operator, unaffected.

**Phase 2 - Deploy fresh v1beta1 clusters in other namespaces (optional):**

1. Install a CockroachDB Operator in ns-3 with `migration.enabled=false` and `watchNamespaces=ns-3`.
   This works because the ns-1 operator already has the conversion webhook configured.
2. Create v1beta1 clusters directly using the CockroachDB Helm chart.

**Phase 3 - Migrate the remaining namespace:**

1. Either expand ns-1's `watchNamespaces` to include ns-2, or install a new CockroachDB Operator
   in ns-2 with `migration.enabled=true`.
2. Apply `skip-reconcile` and cloud annotations on the cluster in ns-2.
3. Migrate the cluster.

**Phase 4 - Finalize (all v1alpha1 clusters are migrated):**

1. Remove the public operator (no v1alpha1 clusters remain).
2. Patch `storedVersions` to remove v1alpha1 (see Step 13).
3. The migration flag can optionally be removed (see Step 14).

### What happens if things go wrong

| Scenario | What happens | What to do |
|---|---|---|
| The only migration-enabled operator goes down | v1alpha1 reads/writes fail (webhook unreachable). v1beta1 clusters are unaffected. | Restart the operator or enable migration on another operator. |
| Migration flag removed before `storedVersions` is patched | Operator preserves the existing webhook but does not register `/convert`. v1alpha1 interactions through the stale webhook return 404. v1beta1 clusters work fine. | Re-enable migration, or patch `storedVersions` if all clusters are migrated. |
| `storedVersions` patched while v1alpha1 clusters still exist | The API server may not serve those objects correctly. | Do not patch `storedVersions` until all v1alpha1 clusters are migrated. |
| Public operator removed while v1alpha1 clusters remain | Those clusters become unmanaged. | Reinstall the public operator or migrate them first. |
| `skip-reconcile` removed on a migrated cluster while public operator runs | Public operator recreates StatefulSet, conflicting with CrdbNodes. | Re-apply `skip-reconcile` immediately. Delete the recreated StatefulSet. |

## Step 13. Patch storedVersions

After all v1alpha1 clusters across the entire Kubernetes cluster have been migrated and the
public operator has been removed, patch the CRD's `storedVersions` to remove v1alpha1.

Do not do this until every v1alpha1 cluster has completed migration and the public operator
is stopped.

```bash
# Verify all clusters are migrated
kubectl get crdbclusters --all-namespaces \
  -o jsonpath='{range .items[*]}{.metadata.namespace}/{.metadata.name}: phase={.status.migration.phase}{"\n"}{end}'

# Patch storedVersions
kubectl patch crd crdbclusters.crdb.cockroachlabs.com \
  --subresource=status \
  --type=json \
  -p='[{"op":"replace","path":"/status/storedVersions","value":["v1beta1"]}]'

# Verify
kubectl get crd crdbclusters.crdb.cockroachlabs.com \
  -o jsonpath='{.status.storedVersions}'
# Expected: ["v1beta1"]
```

## Step 14. Disable migration mode (optional)

After `storedVersions` is patched, disabling migration mode is optional. When the operator
restarts without the flag, it sees that `storedVersions` no longer contains v1alpha1 and
sets v1alpha1 `served=false` on the CRD. The conversion webhook is removed.

If you leave `migration.enabled=true` after patching `storedVersions`, the operator continues
to register the conversion webhook and migration controller, but they have no effect.

```bash
helm upgrade crdb-operator ./cockroachdb-parent/charts/operator \
  --reuse-values \
  --set migration.enabled=false
```

After this:
- v1alpha1 is no longer served by the API server.
- The conversion webhook is removed from the CRD.
- All existing v1beta1 clusters continue working normally.

> **Do not disable migration mode** while the public operator is still running or before
> `storedVersions` is patched. Disabling it removes the conversion webhook, which causes the
> API server to drop v1beta1-only fields (certificates, regions, podTemplate) from the stored
> CrdbCluster spec during v1alpha1 round-trips.

### Removing the CockroachDB Operator

If you uninstall the CockroachDB Operator without completing Steps 13-14 first, the CRD
still has the conversion webhook pointing at a dead endpoint. Any v1alpha1 API calls
(including `kubectl get crdbclusters` if the API server chooses v1alpha1 as the storage
version) will fail with webhook connection errors. To recover:

1. Patch `storedVersions` to remove v1alpha1 (Step 13).
2. Remove the conversion webhook from the CRD manually:
   ```bash
   kubectl patch crd crdbclusters.crdb.cockroachlabs.com \
     --type=json \
     -p='[{"op":"remove","path":"/spec/conversion/webhook"},{"op":"replace","path":"/spec/conversion/strategy","value":"None"}]'
   ```
3. Optionally remove v1alpha1 from the CRD's `spec.versions` if no v1alpha1 clusters remain.

Always complete Steps 13-14 before uninstalling the operator.

### Conversion annotations

The conversion webhook writes annotations on v1alpha1 objects to preserve v1beta1 state
across round-trips. `ConvertFrom` always refreshes the hub spec annotation from the current
v1beta1 spec, so the annotation is always up to date when `ConvertTo` reads it. This
ensures v1beta1-only fields like `ServiceAccountName` and `StartFlags` survive any v1alpha1
write-back. The migration controller strips these annotations on `Phase=Complete` as cleanup,
but they are harmless and will be re-created if a v1alpha1 read occurs while the conversion
webhook is still active. Disabling migration mode prevents any further round-trips.

---

## Certificate Detection

The controller automatically detects your certificate method. No manual configuration is needed.

- **cert-manager**: If cert-manager Certificate CRs exist for the cluster (`{name}-node`),
  the controller updates the Certificate CR with join service DNS SANs and preserves the
  issuer references. cert-manager then regenerates the secrets automatically. CrdbNode pods
  mount from the cert-manager-managed secret (the name from `spec.secretName` in the
  Certificate CR), not `{name}-node-secret`. This keeps cert-manager's automatic rotation
  working after migration.
- **Self-signer** (operator built-in): The controller loads the existing CA from cluster secrets,
  regenerates node and client certificates with join service DNS SANs, and writes them to
  the destination secrets (`{name}-node-secret`, `{name}-client-secret`). CrdbNode pods
  mount from `{name}-node-secret`. The regenerated certificates have a 1-year TTL and are
  stored as `ExternalCertificates` in the v1beta1 spec. The operator does not auto-rotate
  `ExternalCertificates`, so after migration you should switch to
  `cockroachdb.tls.selfSigner.enabled: true` via Helm adoption (Step 12) to enable
  automatic rotation. If you delay this step, the certs will expire silently after one year.
- **External certs**: If neither cert-manager CRs nor self-signer secrets are found, the
  controller preserves existing secret references as ExternalCertificates in the v1beta1 spec.
- **Custom secret names**: If the v1alpha1 spec has `NodeTLSSecret` or `ClientTLSSecret` set,
  the controller skips cert regeneration entirely because the CA private key is not available.
  CrdbNode pods mount the user's existing secrets directly. The user must update their
  certificates to include join service DNS SANs **before** starting the migration (see
  prerequisites).
- **Insecure clusters**: Detected from the `--insecure` start flag. The entire cert migration
  phase is skipped. An `InsecureClusterMigration` warning event is emitted.

> **Note**: Regardless of the original cert type, after migration all certificate secret names
> are stored as `ExternalCertificates` on the CrdbNode spec. This is the internal representation
> used by the operator to mount the correct secrets into pods.

---

## Controlling Migration (Stop / Resume / Rollback)

### Stop (Pause)

Pauses migration at the current phase. No resources are deleted. CrdbNodes already created
remain running and serving traffic.

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=stop --overwrite -n $NAMESPACE
```

### Resume

There is no separate "resume" label value. Use `start` again to resume from the paused phase.
The controller detects the `PhaseStopped` state internally and resumes at the correct phase
based on how many nodes have already been migrated.

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=start --overwrite -n $NAMESPACE
```

### Rollback

Rollback is safe at any phase before Complete. Removing the label triggers automatic rollback.

The controller automatically:
1. Deletes all CrdbNodes and waits for their pods to terminate.
2. Restores StatefulSet to original replica count.
3. Removes migration labels (`crdb.cockroachlabs.com/cluster`, `svc`) from pods.
4. Deletes CA ConfigMap (`{name}-ca-crt`) and migration-created cert secrets
   (`{name}-node-secret`, `{name}-client-secret`).
5. Reverses ConfigMap key migration (`logs.yaml` back to `logging.yaml`).
6. Deletes all PDB variants (`{name}`, `{name}-budget`, `{name}-pdb`).
7. Restores original service selectors (`app.kubernetes.io/component`, `app.kubernetes.io/instance`).
8. Deletes namespace-qualified ClusterRole and ClusterRoleBinding (`{namespace}-{name}`).
9. Sets CrdbCluster `Mode=Disabled`.
10. Removes `crdb.io/skip-reconcile` label last so the public operator resumes control.

All cleanup steps are non-fatal. If a resource is already deleted or inaccessible, the
controller logs a warning and continues with the remaining cleanup.

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate- -n $NAMESPACE
```

**What happens to data during rollback?** Data written during migration is safe. CockroachDB
replicates data across nodes. When CrdbNodes are deleted, their data is re-replicated to the
remaining STS pods (which are scaled back up). No data is lost as long as the replication
factor is maintained.

**During rollback, two sets of pods may briefly coexist.** The controller scales the STS back
up before deleting CrdbNodes, ensuring the cluster always has enough replicas.

**What if the public operator was already uninstalled?** Rollback still works. It restores
the StatefulSet and removes migration artifacts. However, without the public operator running,
nothing will reconcile the StatefulSet after rollback. You would need to reinstall the public
operator or manage the StatefulSet manually.

**What happens to PVCs during rollback?** When CrdbNodes are deleted, their PVCs are also
deleted. When the StatefulSet scales back up, Kubernetes creates new PVCs. Unlike forward
migration (which reuses existing PVCs), rollback creates fresh storage. Data safety is
maintained through CockroachDB's built-in replication. Data is re-replicated from the
nodes that remain healthy throughout the process.

> **Important**: For operator migrations, the public operator must still be running (or
> at least its CRDs and webhook must be available) for rollback to fully succeed. The
> controller removes `skip-reconcile` as the last rollback step, allowing the public
> operator to resume reconciliation. If the public operator has been completely uninstalled
> (including CRDs), the StatefulSet is restored but nothing will reconcile it. You would
> need to reinstall the public operator or manage the cluster manually.

### Rollback Validation

After rollback, the controller enters a validation phase (`PhaseRollbackComplete`) and
verifies:
- All CrdbNodes are deleted.
- StatefulSet is restored to original replica count.
- All pods are ready.
- Headless service has no v1beta1 ownerReferences.

Only after all checks pass does it remove the `skip-reconcile` label and clear migration status.

### Rollback safety by phase

| Phase | Rollback safe? | Notes |
|---|---|---|
| Init | Yes | Only a CrdbCluster has been created; no pods affected |
| CertMigration | Yes | Only cert secrets created; no pods affected |
| PodMigration | Yes | Controller deletes CrdbNodes and scales STS back up |
| Finalization | Conditional | Safe if STS still exists. If STS was already deleted, rollback sets `PhaseFailed` |
| Complete | No | STS has been deleted. Manual recovery required |

### Label Values Reference

| Label Value | Who Sets It | Meaning |
|-------------|-------------|---------|
| `start` | User | Begin or resume migration |
| `stop` | User | Pause migration |
| `rollback` | User | Request rollback (same as removing label) |
| `in-progress` | Controller | Migration is actively running |
| `stopped` | Controller | Migration is paused |
| `complete` | Controller | Migration finished successfully |
| `failed` | Controller | Migration hit an unrecoverable error |
| (removed) | User | Triggers rollback |

### Rollback After Complete

Once `Phase=Complete`, automated rollback is not possible. The StatefulSet has been deleted.
Manual recovery steps:
1. Delete all CrdbNodes
2. Manually recreate the StatefulSet with original spec
3. Scale up and verify cluster health
4. Remove the migration label

---

## Troubleshooting

### Migration Fails with "missing required label: crdb.io/skip-reconcile=true"

The `skip-reconcile` label was not applied before starting migration. Apply it and retry:

```bash
kubectl label crdbcluster $CRDBCLUSTER crdb.io/skip-reconcile="true" -n $NAMESPACE
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=start --overwrite -n $NAMESPACE
```

### Migration Stuck at PodMigration

If a node fails health checks for more than 10 minutes, migration auto-pauses to `PhaseStopped`.

```bash
# Check why migration stopped
kubectl get crdbcluster $CRDBCLUSTER -n $NAMESPACE \
  -o jsonpath='{.status.migration.lastError}'

# Check pod status
kubectl describe pod $CRDBCLUSTER-<index> -n $NAMESPACE

# Check CrdbNode status
kubectl get crdbnode $CRDBCLUSTER-<index> -n $NAMESPACE -o yaml

# Resume after fixing
kubectl label crdbcluster $CRDBCLUSTER crdb.io/migrate=start --overwrite -n $NAMESPACE
```

### CrdbCluster Not Found (Operator Migration)

For operator migrations, the v1beta1 CrdbCluster is created via the conversion webhook.
The conversion webhook is only registered when the operator is started with
`--enable-migration` (or `migration.enabled=true` in Helm). If the v1beta1 CrdbCluster
is missing, ensure:

- The CockroachDB Operator was installed with `migration.enabled=true`.
- The webhook service is running and reachable.
- The v1alpha1 CrdbCluster has not been deleted.

```bash
# Check if conversion webhook is configured
kubectl get crd crdbclusters.crdb.cockroachlabs.com -o yaml | grep -A5 conversion
```

### Locality Labels Missing

If CrdbNode pods remain Pending, check for locality label warnings:

```bash
kubectl get events -n $NAMESPACE --field-selector reason=LocalityLabelsRequired
```

Apply the required labels to K8s nodes (see Step 2).

### Under-replicated Ranges

The controller retries health checks every 10 seconds. If under-replicated ranges persist for
more than 10 minutes, migration auto-pauses.

```bash
# Use -c db during migration, -c cockroachdb after migration
kubectl exec $CRDBCLUSTER-0 -n $NAMESPACE -c cockroachdb -- \
  /cockroach/cockroach sql --certs-dir=/cockroach/cockroach-certs \
  -e "SELECT sum((metrics->>'ranges.underreplicated')::INT8) FROM crdb_internal.kv_store_status;"
```

### RBAC Conflicts Between Public and CockroachDB Operator

If both operators are fighting over RBAC:
1. Verify `skip-reconcile` is set on the v1alpha1 CrdbCluster.
2. Verify the CockroachDB Operator uses `watchNamespaces` to limit its scope.
3. Check that ClusterRole names do not collide (CockroachDB Operator uses `{namespace}-{name}`).

```bash
# Check namespace-scoped RBAC
kubectl get role $CRDBCLUSTER -n $NAMESPACE
kubectl get rolebinding $CRDBCLUSTER -n $NAMESPACE

# Check cluster-scoped RBAC (namespace-qualified names)
kubectl get clusterrole ${NAMESPACE}-${CRDBCLUSTER}
kubectl get clusterrolebinding ${NAMESPACE}-${CRDBCLUSTER}
```

### ConfigMap Key Format

The public operator uses `logging.yaml` as the key in log-config ConfigMaps. The CockroachDB
Operator uses `logs.yaml`. The migration controller renames this key automatically. On
rollback, the key is renamed back. Verify:

```bash
kubectl get configmap <log-config-name> -n $NAMESPACE -o yaml | grep -E "logging.yaml|logs.yaml"
```
