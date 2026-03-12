You can expand certain [types of persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
) (including GCE Persistent Disk and Amazon Elastic Block Store) by editing their persistent volume claims.

{{site.data.alerts.callout_info}}
These steps assume you followed the tutorial [Deploy CockroachDB on Kubernetes](deploy-cockroachdb-with-kubernetes.html?filters=manual).
{{site.data.alerts.end}}

1. Get the persistent volume claims for the volumes:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc
    ~~~

    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
	datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-cockroachdb-1   Bound    pvc-75e143ca-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-cockroachdb-2   Bound    pvc-75ef409a-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    ~~~

1. In order to expand a persistent volume claim, `AllowVolumeExpansion` in its storage class must be `true`. Examine the storage class:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe storageclass standard
    ~~~

	~~~
	Name:                  standard
	IsDefaultClass:        Yes
	Annotations:           storageclass.kubernetes.io/is-default-class=true
	Provisioner:           kubernetes.io/gce-pd
	Parameters:            type=pd-standard
	AllowVolumeExpansion:  False
	MountOptions:          <none>
	ReclaimPolicy:         Delete
	VolumeBindingMode:     Immediate
	Events:                <none>
	~~~

	If necessary, edit the storage class:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch storageclass standard -p '{"allowVolumeExpansion": true}'
    ~~~

    ~~~
    storageclass.storage.k8s.io/standard patched
    ~~~

1. Edit one of the persistent volume claims to request more space:

    {{site.data.alerts.callout_info}}
    The requested `storage` value must be larger than the previous value. You cannot use this method to decrease the disk size.
	{{site.data.alerts.end}}

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch pvc datadir-cockroachdb-0 -p '{"spec": {"resources": {"requests": {"storage": "200Gi"}}}}'
    ~~~

    ~~~
    persistentvolumeclaim/datadir-cockroachdb-0 patched
    ~~~

1. Check the capacity of the persistent volume claim:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-cockroachdb-0
    ~~~	

    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       18m
    ~~~

    If the PVC capacity has not changed, this may be because `AllowVolumeExpansion` was initially set to `false` or because the [volume has a file system](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#resizing-an-in-use-persistentvolumeclaim) that has to be expanded. You will need to start or restart a pod in order to have it reflect the new capacity.

    {{site.data.alerts.callout_success}}
    Running `kubectl get pv` will display the persistent volumes with their *requested* capacity and not their actual capacity. This can be misleading, so it's best to use `kubectl get pvc`.
    {{site.data.alerts.end}}

1. Examine the persistent volume claim. If the volume has a file system, you will see a `FileSystemResizePending` condition with an accompanying message:

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe pvc datadir-cockroachdb-0
    ~~~

    ~~~
    Waiting for user to (re-)start a pod to finish file system resize of volume on node.
    ~~~

1.  Delete the corresponding pod to restart it:

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-0
    ~~~

    The `FileSystemResizePending` condition and message will be removed.

1. View the updated persistent volume claim:

	{% include_cached copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-cockroachdb-0
    ~~~

    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   200Gi      RWO            standard       20m
    ~~~

1. The CockroachDB cluster needs to be expanded one node at a time. Repeat steps 3 - 6 to increase the capacities of the remaining volumes by the same amount.