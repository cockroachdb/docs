You cannot use comparison operators (such as `<` or `>`) on [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) elements. For example, the following query does not work and returns an error:

  {% include_cached copy-clipboard.html %}
  ~~~ sql
  SELECT '{"a": 1}'::JSONB -> 'a' < '{"b": 2}'::JSONB -> 'b';
  ~~~

  ~~~
  ERROR: unsupported comparison operator: <jsonb> < <jsonb>
  SQLSTATE: 22023
  ~~~

  [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/49144)
