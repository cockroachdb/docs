{% comment %}
  This include generates a fields table (not flags) for cockroach commands.
  Used for Store fields and Standard Output fields.

  Required parameters:
  - fields: Array of field objects from the JSON data

  Each field object should have:
  - field (required): The field name
  - description (required): Full description including all metadata
  - deprecated (optional): Boolean indicating if deprecated

  Sorting: Non-deprecated fields first (alphabetically), then deprecated fields (alphabetically)
{% endcomment %}

{% assign non_deprecated_fields = include.fields | where_exp: "item", "item.deprecated != true" | sort: "field" %}
{% assign deprecated_fields = include.fields | where: "deprecated", true | sort: "field" %}
{% assign sorted_fields = non_deprecated_fields | concat: deprecated_fields %}

Field | Description
-----|------------
{% for field_item in sorted_fields -%}
{%- assign field_id = field_item.field | downcase | replace: ' ', '-' | replace: '[', '' | replace: ']', '' -%}
{% if field_item.deprecated -%}
<a name="fields-{{ field_id }}"></a>`{{ field_item.field }}` | **Deprecated.** {{ field_item.description }}
{% else -%}
<a name="fields-{{ field_id }}"></a>`{{ field_item.field }}` | {{ field_item.description }}
{% endif -%}
{% endfor %}