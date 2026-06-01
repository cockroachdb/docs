{% comment %}
  This include generates a fields table (not flags) for cockroach commands.
  Used for Store fields and Standard Output fields.

  Required parameters:
  - fields: Array of field objects from the JSON data

  Each field object should have:
  - field (required): The field name
  - description (required): Full description including all metadata
  - deprecated (optional): Boolean indicating if deprecated
{% endcomment %}

Field | Description
-----|------------
{% for field_item in include.fields -%}
{%- assign field_id = field_item.field | downcase | replace: ' ', '-' | replace: '[', '' | replace: ']', '' -%}
{% if field_item.deprecated -%}
<a name="fields-{{ field_id }}"></a>`{{ field_item.field }}` | **Deprecated.** {{ field_item.description }}
{% else -%}
<a name="fields-{{ field_id }}"></a>`{{ field_item.field }}` | {{ field_item.description }}
{% endif -%}
{% endfor %}