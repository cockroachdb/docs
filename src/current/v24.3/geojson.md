---
title: GeoJSON
summary: The GeoJSON data format for representing spatial information is based on JavaScript Object Notation (JSON).
toc: true
docs_area: reference.sql
---

GeoJSON is a textual data format for representing spatial information.  It is based on [JavaScript Object Notation (JSON)](https://www.json.org).

GeoJSON can be used to represent the following spatial objects, which also have [Well Known Text (WKT)]({% link {{ page.version.version }}/well-known-text.md %}) and [Well Known Binary (WKB)]({% link {{ page.version.version }}/well-known-binary.md %}) representations:

- Point
- LineString
- Polygon
- MultiPoint
- MultiLineString
- MultiPolygon
- GeometryCollection

GeoJSON introduces the following additional concepts, which are not part of WKT or WKB:

- A "Feature" object that can contain a geometric shape and some additional properties that describe that shape.  This is useful, for example, when drawing maps on the internet in color, such as on [geojson.io](http://geojson.io).  For an example showing how to add color to a GeoJSON feature, [see below](#geojson-features-example).
- Features can additionally be grouped together into a "FeatureCollection".

{{site.data.alerts.callout_success}}
For more detailed information, see the [GeoJSON RFC](https://www.rfc-editor.org/rfc/rfc7946.txt).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
GeoJSON should only be used for spatial data that uses the [WGS84]({% link {{ page.version.version }}/architecture/glossary.md %}) geographic spatial reference system.  For more information, see [SRID 4326]({% link {{ page.version.version }}/srid-4326.md %}).
{{site.data.alerts.end}}

## Example

In the example below, we will convert a shape represented in [Well Known Text]({% link {{ page.version.version }}/well-known-text.md %}) to GeoJSON using the `ST_AsGeoJSON` [function]({% link {{ page.version.version }}/functions-and-operators.md %}#spatial-functions).

Here is the WKT:

~~~
SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))
~~~

Convert it to GeoJSON using the `ST_AsGeoJSON` function:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT ST_AsGeoJSON('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))');
~~~

This is the JSON output of the above, but formatted:

{% include_cached copy-clipboard.html %}
~~~ json
{
    "type": "Polygon",
    "coordinates": [
        [
            [
                -87.906471,
                43.038902
            ],
            [
                -95.992775,
                36.15398
            ],
            [
                -75.704722,
                36.076944
            ],
            [
                -87.906471,
                43.038902
            ]
        ],
        [
            [
                -87.623177,
                41.881832
            ],
            [
                -90.199402,
                38.627003
            ],
            [
                -82.446732,
                38.413651
            ],
            [
                -87.623177,
                41.881832
            ]
        ]
    ]
}
~~~

<a name="geojson-features-example"></a>

The JSON below is modified from the output above: it is grouped into a GeoJSON `FeatureCollection` in which each `Feature` has additional styling information (in the `properties` field) that can be used in visualization tools such as [geojson.io](http://geojson.io):

{% include_cached copy-clipboard.html %}
~~~ json
{
    "type": "FeatureCollection",
    "features": [
        {
            "properties": {
                "fill-opacity": 0.3,
                "stroke": "#30D5C8",
                "stroke-width": 5,
                "fill": "#30D5C8"
            },
            "geometry": {
                "coordinates": [
                    [
                        [
                            -87.906471,
                            43.038902
                        ],
                        [
                            -95.992775,
                            36.15398
                        ],
                        [
                            -75.704722,
                            36.076944
                        ],
                        [
                            -87.906471,
                            43.038902
                        ]
                    ],
                    [
                        [
                            -87.623177,
                            41.881832
                        ],
                        [
                            -90.199402,
                            38.627003
                        ],
                        [
                            -82.446732,
                            38.413651
                        ],
                        [
                            -87.623177,
                            41.881832
                        ]
                    ]
                ],
                "type": "Polygon"
            },
            "type": "Feature"
        },
        {
            "properties": {
                "stroke": "yellow",
                "fill-opacity": 0.3,
                "stroke-width": 9,
                "fill": "yellow"
            },
            "geometry": {
                "type": "LineString",
                "coordinates": [
                    [
                        -87.623177,
                        41.881832
                    ],
                    [
                        -90.199402,
                        38.627003
                    ],
                    [
                        -82.446732,
                        38.413651
                    ],
                    [
                        -87.623177,
                        41.881832
                    ]
                ]
            },
            "type": "Feature"
        }
    ]
}
~~~

Here is the geometry described above as shown on [geojson.io](http://geojson.io):

<img src="/docs/images/{{ page.version.version }}/geospatial/geojson_example.png" alt="GeoJSON.io output" style="max-width: 100%" >

## See also

- [GeoJSON RFC](https://www.rfc-editor.org/rfc/rfc7946.txt)
- [Spatial Data Overview]({% link {{ page.version.version }}/spatial-data-overview.md %})
- [Spatial tutorial]({% link {{ page.version.version }}/spatial-tutorial.md %})
- [Spatial indexes]({% link {{ page.version.version }}/spatial-indexes.md %})
- [Spatial and GIS Glossary of Terms]({% link {{ page.version.version }}/architecture/glossary.md %})
- [Well known text]({% link {{ page.version.version }}/well-known-text.md %})
- [Well known binary]({% link {{ page.version.version }}/well-known-binary.md %})
- [SRID 4326 - longitude and latitude]({% link {{ page.version.version }}/srid-4326.md %})
- [Using GeoServer with CockroachDB]({% link {{ page.version.version }}/geoserver.md %})
