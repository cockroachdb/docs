{% comment %}
  This include generates a flags table for cockroach commands.

  Required parameters:
  - flags: Array of flag objects from the JSON data

  Each flag object can have:
  - flag or field (required): The flag name (--flag) or field name (for store fields)
  - description (required): Description of the flag
  - short (optional): Short version of the flag (-f)
  - default (optional): Default value
  - env_var (optional): Environment variable that can set this flag
  - example (optional): Single example
  - examples (optional): Array of examples
  - note (optional): Additional note
  - warning (optional): Warning message
  - production_recommendation (optional): Production recommendation
  - defaults (optional): Array of platform-specific defaults
  - deprecated (optional): Boolean indicating if deprecated
  - required (optional): Boolean indicating if required
{% endcomment %}

Flag | Description
-----|------------
{% for flag_item in include.flags -%}
{% assign flag_name = flag_item.flag | default: flag_item.field -%}
{% if flag_item.deprecated -%}
{% if flag_item.short -%}
`{{ flag_name }}`<br>`{{ flag_item.short }}` | **Deprecated.** {{ flag_item.description }}
{% else -%}
`{{ flag_name }}` | **Deprecated.** {{ flag_item.description }}
{% endif -%}
{% elsif flag_item.required -%}
{% if flag_item.short -%}
`{{ flag_name }}`<br>`{{ flag_item.short }}` | **REQUIRED.** {{ flag_item.description }}{% if flag_item.env_var %}<br><br>**Env Variable:** `{{ flag_item.env_var }}`{% endif %}{% if flag_item.default %}<br>**Default:** `{{ flag_item.default }}`{% endif %}{% if flag_item.example %}<br><br>**Example:** `{{ flag_item.example }}`{% endif %}{% if flag_item.examples %}<br><br>**Examples:**<br>{% for ex in flag_item.examples %}`{{ ex }}`<br>{% endfor %}{% endif %}{% if flag_item.note %}<br><br>**Note:** {{ flag_item.note }}{% endif %}{% if flag_item.warning %}<br><br>**Warning:** {{ flag_item.warning }}{% endif %}{% if flag_item.production_recommendation %}<br><br>**Production recommendation:** {{ flag_item.production_recommendation }}{% endif %}{% if flag_item.defaults %}<br><br>**Defaults:**<br>{% for d in flag_item.defaults %}- `{{ d }}`<br>{% endfor %}{% endif %}
{% else -%}
`{{ flag_name }}` | **REQUIRED.** {{ flag_item.description }}{% if flag_item.env_var %}<br><br>**Env Variable:** `{{ flag_item.env_var }}`{% endif %}{% if flag_item.default %}<br>**Default:** `{{ flag_item.default }}`{% endif %}{% if flag_item.example %}<br><br>**Example:** `{{ flag_item.example }}`{% endif %}{% if flag_item.examples %}<br><br>**Examples:**<br>{% for ex in flag_item.examples %}`{{ ex }}`<br>{% endfor %}{% endif %}{% if flag_item.note %}<br><br>**Note:** {{ flag_item.note }}{% endif %}{% if flag_item.warning %}<br><br>**Warning:** {{ flag_item.warning }}{% endif %}{% if flag_item.production_recommendation %}<br><br>**Production recommendation:** {{ flag_item.production_recommendation }}{% endif %}{% if flag_item.defaults %}<br><br>**Defaults:**<br>{% for d in flag_item.defaults %}- `{{ d }}`<br>{% endfor %}{% endif %}
{% endif -%}
{% else -%}
{% if flag_item.short -%}
`{{ flag_name }}`<br>`{{ flag_item.short }}` | {{ flag_item.description }}{% if flag_item.env_var %}<br><br>**Env Variable:** `{{ flag_item.env_var }}`{% endif %}{% if flag_item.default %}<br>**Default:** `{{ flag_item.default }}`{% endif %}{% if flag_item.example %}<br><br>**Example:** `{{ flag_item.example }}`{% endif %}{% if flag_item.examples %}<br><br>**Examples:**<br>{% for ex in flag_item.examples %}`{{ ex }}`<br>{% endfor %}{% endif %}{% if flag_item.note %}<br><br>**Note:** {{ flag_item.note }}{% endif %}{% if flag_item.warning %}<br><br>**Warning:** {{ flag_item.warning }}{% endif %}{% if flag_item.production_recommendation %}<br><br>**Production recommendation:** {{ flag_item.production_recommendation }}{% endif %}{% if flag_item.defaults %}<br><br>**Defaults:**<br>{% for d in flag_item.defaults %}- `{{ d }}`<br>{% endfor %}{% endif %}
{% else -%}
`{{ flag_name }}` | {{ flag_item.description }}{% if flag_item.env_var %}<br><br>**Env Variable:** `{{ flag_item.env_var }}`{% endif %}{% if flag_item.default %}<br>**Default:** `{{ flag_item.default }}`{% endif %}{% if flag_item.example %}<br><br>**Example:** `{{ flag_item.example }}`{% endif %}{% if flag_item.examples %}<br><br>**Examples:**<br>{% for ex in flag_item.examples %}`{{ ex }}`<br>{% endfor %}{% endif %}{% if flag_item.note %}<br><br>**Note:** {{ flag_item.note }}{% endif %}{% if flag_item.warning %}<br><br>**Warning:** {{ flag_item.warning }}{% endif %}{% if flag_item.production_recommendation %}<br><br>**Production recommendation:** {{ flag_item.production_recommendation }}{% endif %}{% if flag_item.defaults %}<br><br>**Defaults:**<br>{% for d in flag_item.defaults %}- `{{ d }}`<br>{% endfor %}{% endif %}
{% endif -%}
{% endif -%}
{% endfor %}