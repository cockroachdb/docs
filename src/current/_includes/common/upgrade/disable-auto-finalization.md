{% capture new_flag %}
{{site.data.alerts.callout_info}}
Previously, to disable automatic finalization and preserve the ability to roll back a major-version upgrade, it was required to set the cluster setting `cluster.preserve_downgrade_option` to the cluster's current major version before beginning the major-version upgrade, and then to unset the setting to finalize the upgrade.

We now recommend managing a cluster's finalization policy using the cluster setting `cluster.auto_upgrade.enabled`, which was introduced in v23.2. The setting does not need to be modified after it is initially set.

Either of these settings prevents automatic finalization.
{{site.data.alerts.end}}
{% endcapture %}

{% if page.name == 'upgrade-cockroachdb-kubernetes.md' %}

<section class="filter-content" markdown="1" data-scope="operator">

For clusters managed by the {{ site.data.products.public-operator }}, auto-finalization is disabled and cannot be enabled. A major version upgrade is not complete until it is manually [finalized](#finalize-a-major-version-upgrade-manually). The {{ site.data.products.public-operator }} does not support the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.auto_upgrade.enabled`.

</section>

<section class="filter-content" markdown="1" data-scope="manual">

By default, auto-finalization is enabled, and a major-version upgrade is finalized when all nodes have rejoined the cluster using the new `cockroach` binary. This means that by default, a major-version upgrade cannot be rolled back. Instead, you must [restore the cluster to the previous version]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

To disable auto-finalization:

1. Connect to the cluster using the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Set the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.auto_upgrade.enabled` to `false`.

Now, to complete a major-version upgrade, you must manually [finalize it](#finalize-a-major-version-upgrade-manually) or [roll it back](#roll-back-a-major-version-upgrade).

{{ new_flag }}

</section>

<section class="filter-content" markdown="1" data-scope="helm">

By default, auto-finalization is enabled, and a major-version upgrade is finalized when all nodes have rejoined the cluster using the new `cockroach` binary. This means that by default, a major-version upgrade cannot be rolled back. Instead, you must [restore the cluster to the previous version]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

To disable auto-finalization:

1. Connect to the cluster using the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Set the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.preserve_downgrade_option` to the cluster's current major version. The Helm chart does not yet support the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.auto_upgrade.enabled`.

Now, to complete a major-version upgrade, you must manually [finalize it](#finalize-a-major-version-upgrade-manually) or [roll it back](#roll-back-a-major-version-upgrade).

</section>

{% else if page.name == 'upgrade-cockroachdb-kubernetes-operator.md' %}

By default, auto-finalization is enabled, and a major-version upgrade is finalized when all nodes have rejoined the cluster using the new `cockroach` binary. This means that by default, a major-version upgrade cannot be rolled back. Instead, you must [restore the cluster to the previous version]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

To disable auto-finalization:

1. Connect to the cluster using the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    kubectl exec -it cockroachdb-client-secure \
    -- ./cockroach sql \
    --certs-dir=/cockroach-certs \
    --host=cockroachdb-public
    ~~~

1. Set the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.auto_upgrade.enabled` to `false`.

Now, to complete a major-version upgrade, you must manually [finalize it](#finalize-a-major-version-upgrade-manually) or [roll it back](#roll-back-a-major-version-upgrade).

{{ new_flag }}

{% else %}

By default, auto-finalization is enabled, and a major-version upgrade is finalized when all nodes have rejoined the cluster using the new `cockroach` binary. This means that by default, a major-version upgrade cannot be rolled back. Instead, you must [restore the cluster to the previous version]({% link {{ page.version.version }}/restoring-backups-across-versions.md %}#support-for-restoring-backups-into-a-newer-version).

To disable auto-finalization:

1. Connect to the cluster using the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql
    ~~~

1. Set the [cluster setting]({% link {{ page.version.version }}/cluster-settings.md %}) `cluster.auto_upgrade.enabled` to `false`.

Now, to complete a major-version upgrade, you must manually [finalize it](#finalize-a-major-version-upgrade-manually) or [roll it back](#roll-back-a-major-version-upgrade).

{{ new_flag }}

{% endif %}
