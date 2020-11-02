---
title: GeoJSON
summary: The GeoJSON data format for spatial information exchange is based on JavaScript Object Notation (JSON).
toc: true
---

GeoJSON is a textual data format for spatial information exchange.  It is based on [JavaScript Object Notation (JSON)](https://www.json.org).

GeoJSON can be used to represent the following spatial objects, which also have [Well Known Text (WKT)](well-known-text.html) and [Well Known Binary (WKB)](well-known-binary.html) representations:

- Point
- Linestring
- Polygon
- MultiPoint
- MultiLinestring
- MultiPolygon
- GeometryCollection

GeoJSON introduces the following additional concepts, which are not part of WKT or WKB:

- A `Feature` object that can contain a geometric shape and some additional properties that describe that shape.  This is useful for e.g., drawing maps on the internet in color, such as on [geojson.io](http://geojson.io).  For an example showing how to add color to a GeoJSON feature, [see below](#geojson-features-example).
- `Feature`s can additionally be grouped together into `FeatureCollection`s.

{{site.data.alerts.callout_success}}
For more detailed information, see the [GeoJSON RFC](https://www.rfc-editor.org/rfc/rfc7946.txt).
{{site.data.alerts.end}}

{{site.data.alerts.callout_info}}
GeoJSON should only be used for spatial data that uses the [WGS84](spatial-glossary.html) geographic spatial reference system (basically, [SRID 4326](srid-4326.html)).
{{site.data.alerts.end}}

## Example

In the example below, we will convert a shape represented in [Well Known Text](well-known-text.html) to GeoJSON using the `ST_AsGeoJSON` function.

Here is the WKT:

~~~
SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))
~~~

Next, convert it to GeoJSON using the `ST_AsGeoJSON` function:

{% include copy-clipboard.html %}
~~~ sql
SELECT ST_AsGeoJSON('SRID=4326;POLYGON((-87.906471 43.038902, -95.992775 36.153980, -75.704722 36.076944, -87.906471 43.038902), (-87.623177 41.881832, -90.199402 38.627003, -82.446732 38.413651, -87.623177 41.881832))');
~~~

This is the JSON output of the above, but formatted:

{% include copy-clipboard.html %}
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

Finally, the JSON below is modified from the output above: it is grouped into a GeoJSON `FeatureCollection` in which each `Feature` has additional styling information (in the `properties` field) that can be used in visualization tools such as [geojson.io](http://geojson.io):

{% include copy-clipboard.html %}
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

<img src="{{ 'images/v20.2/geospatial/geojson_example.png' | relative_url }}" alt="GeoJSON.io output" style="max-width: 100%" >

## See also

- [GeoJSON RFC](https://www.rfc-editor.org/rfc/rfc7946.txt)
- [Spatial features](spatial-features.html)
- [Spatial indexes](spatial-indexes.html)
- [Spatial and GIS Glossary of Terms](spatial-glossary.html)
- [Well known text](well-known-text.html)
- [Well known binary](well-known-binary.html)
- [SRID 4326 - longitude and latitude](srid-4326.html)
