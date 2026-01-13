Apply the custom values to override the default Helm chart [values](https://github.com/cockroachdb/helm-charts/blob/master/cockroachdb/values.yaml):

{% include_cached copy-clipboard.html %}
~~~ shell
$ helm upgrade {release-name} --values {custom-values}.yaml cockroachdb/cockroachdb
~~~