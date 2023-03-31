import psycopg2
import json

filename = "eea-spain.json"
# Replace with your PostgreSQL connection details
connection = psycopg2.connect(
    dbname="openaq",
    user="apiuser",
    password="OpenAQRO3857",
    host="3.209.176.87",
    port="5432",
)

cursor = connection.cursor()

query = """
WITH expanded_sensors AS (
    SELECT
        id,
        city,
        provider->>'name' AS source,
        coordinates,
        json_array_elements(sensors) -> 'parameter' ->> 'name' AS parameter_name
    FROM locations_view_cached
    WHERE provider->>'name' NOT IN ('PurpleAir', 'Catalonia Medi Ambient I Sostenibilitat') AND countries_id = 138
)

SELECT json_agg(
           json_build_object(
               'id', id,
               'city', city,
               'source', source,
               'coordinates', coordinates,
               'parameter', parameter_name
           )
       ) AS result
FROM expanded_sensors;
"""

cursor.execute(query)
result = cursor.fetchone()[0]

with open(filename, "w") as json_file:
    json.dump(result, json_file)

cursor.close()
connection.close()
