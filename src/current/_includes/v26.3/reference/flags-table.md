{% comment %}
  This include generates a flags table for cockroach commands.

  Required parameters:
  - flags: Array of flag objects from the JSON data

  Each flag object should have:
  - flag (required): The flag name (--flag) or field name (for store fields)
  - short (optional): Short version of the flag (-f)
  - description (required): Full description including all metadata
  - deprecated (optional): Boolean indicating if deprecated

  Sorting: Non-deprecated flags first (alphabetically), then deprecated flags (alphabetically)
{% endcomment %}

{% assign non_deprecated_flags = include.flags | where_exp: "item", "item.deprecated != true" | sort: "flag" %}
{% assign deprecated_flags = include.flags | where: "deprecated", true | sort: "flag" %}
{% assign sorted_flags = non_deprecated_flags | concat: deprecated_flags %}

Flag | Description
-----|------------
{% for flag_item in sorted_flags -%}
{%- assign flag_id = flag_item.flag | remove: '--' -%}
{% if flag_item.deprecated -%}
{% if flag_item.short -%}
<a name="flags-{{ flag_id }}"></a>`{{ flag_item.flag }}`<br>`{{ flag_item.short }}` | **Deprecated.** {{ flag_item.description }}
{% else -%}
<a name="flags-{{ flag_id }}"></a>`{{ flag_item.flag }}` | **Deprecated.** {{ flag_item.description }}
{% endif -%}
{% else -%}
{% if flag_item.short -%}
<a name="flags-{{ flag_id }}"></a>`{{ flag_item.flag }}`<br>`{{ flag_item.short }}` | {{ flag_item.description }}
{% else -%}
<a name="flags-{{ flag_id }}"></a>`{{ flag_item.flag }}` | {{ flag_item.description }}
{% endif -%}
{% endif -%}
{% endfor %}