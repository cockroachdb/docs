`ALTER VIEW` does not currently support:

- Changing the [`SELECT`]({% link {{ page.version.version }}/select-clause.md %}) statement executed by a view. Instead, you must drop the existing view and create a new view.
- Renaming a view that other views depend on. This feature may be added in the future. [#10083](https://github.com/cockroachdb/cockroach/issues/10083)