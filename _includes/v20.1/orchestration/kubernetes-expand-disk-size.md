You can expand certain [types of persistent volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#types-of-persistent-volumes
) (including GCE Persistent Disk and Amazon Elastic Block Store) by editing their persistent volume claims. Increasing disk size is often beneficial for CockroachDB performance. Read our [Kubernetes performance guide](kubernetes-performance.html#disk-size) for guidance on disks.

1. Get the persistent volume claims for the volumes:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc
    ~~~

    <section class="filter-content" markdown="1" data-scope="helm">
    ~~~
	NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
	datadir-my-release-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-my-release-cockroachdb-1   Bound    pvc-75e143ca-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-my-release-cockroachdb-2   Bound    pvc-75ef409a-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    ~~~
    </section>

	<section class="filter-content" markdown="1" data-scope="manual">
    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
	datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-cockroachdb-1   Bound    pvc-75e143ca-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
	datadir-cockroachdb-2   Bound    pvc-75ef409a-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       17m
    ~~~
	</section>

2. In order to expand a persistent volume claim, `AllowVolumeExpansion` in its storage class must be `true`. Examine the storage class:

    {% include copy-clipboard.html %}
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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch storageclass standard -p '{"allowVolumeExpansion": true}'
    ~~~

    ~~~
    storageclass.storage.k8s.io/standard patched
    ~~~

3. Edit one of the persistent volume claims to request more space:

    {{site.data.alerts.callout_info}}
    The requested `storage` value must be larger than the previous value. You cannot use this method to decrease the disk size.
	{{site.data.alerts.end}}

	<section class="filter-content" markdown="1" data-scope="helm">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch pvc datadir-my-release-cockroachdb-0 -p '{"spec": {"resources": {"requests": {"storage": "200Gi"}}}}'
    ~~~

    ~~~
    persistentvolumeclaim/datadir-my-release-cockroachdb-0 patched
    ~~~		
	</section>

	<section class="filter-content" markdown="1" data-scope="manual">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl patch pvc datadir-cockroachdb-0 -p '{"spec": {"resources": {"requests": {"storage": "200Gi"}}}}'
    ~~~

    ~~~
    persistentvolumeclaim/datadir-cockroachdb-0 patched
    ~~~
	</section>

4. Check the capacity of the persistent volume claim:

	<section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-my-release-cockroachdb-0
    ~~~	

    ~~~
	NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    datadir-my-release-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       18m
    ~~~		
	</section>

	<section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-cockroachdb-0
    ~~~	

    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   100Gi      RWO            standard       18m
    ~~~
	</section>

    If the PVC capacity has not changed, this may be because `AllowVolumeExpansion` was initially set to `false` or because the [volume has a file system](https://kubernetes.io/docs/concepts/storage/persistent-volumes/#resizing-an-in-use-persistentvolumeclaim) that has to be expanded. You will need to start or restart a pod in order to have it reflect the new capacity.

    {{site.data.alerts.callout_success}}
    Running `kubectl get pv` will display the persistent volumes with their *requested* capacity and not their actual capacity. This can be misleading, so it's best to use `kubectl get pvc`.
    {{site.data.alerts.end}}

5. Examine the persistent volume claim. If the volume has a file system, you will see a `FileSystemResizePending` condition with an accompanying message:

	<section class="filter-content" markdown="1" data-scope="helm">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe pvc datadir-my-release-cockroachdb-0
    ~~~
	</section>

	<section class="filter-content" markdown="1" data-scope="manual">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl describe pvc datadir-cockroachdb-0
    ~~~
	</section>

    ~~~
    Waiting for user to (re-)start a pod to finish file system resize of volume on node.
    ~~~

6.  Delete the corresponding pod to restart it:

	<section class="filter-content" markdown="1" data-scope="helm">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod my-release-cockroachdb-0
    ~~~
   	</section>

	<section class="filter-content" markdown="1" data-scope="manual">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl delete pod cockroachdb-0
    ~~~
	</section>

    The `FileSystemResizePending` condition and message will be removed.

7. View the updated persistent volume claim:

	<section class="filter-content" markdown="1" data-scope="helm">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-my-release-cockroachdb-0
    ~~~

    ~~~
	NAME                               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
datadir-my-release-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   200Gi      RWO            standard       20m
    ~~~	
	</section>

	<section class="filter-content" markdown="1" data-scope="manual">
	{% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl get pvc datadir-cockroachdb-0
    ~~~

    ~~~
	NAME                    STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
datadir-cockroachdb-0   Bound    pvc-75dadd4c-01a1-11ea-b065-42010a8e00cb   200Gi      RWO            standard       20m
    ~~~
	</section>

8. The CockroachDB cluster needs to be expanded one node at a time. Repeat steps 3 - 6 to increase the capacities of the remaining volumes by the same amount.