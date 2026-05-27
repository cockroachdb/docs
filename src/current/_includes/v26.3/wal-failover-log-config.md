{% include_cached copy-clipboard.html %}
~~~ yaml
file-defaults:
 buffered-writes: false
 auditable: false
 buffering:
   max-staleness: 1s
   flush-trigger-size: 256KiB
   max-buffer-size: 50MiB
~~~
