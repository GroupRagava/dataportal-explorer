curl -XPUT 'http://localhost:9200/sibexplorer/_mapping/pointfive_cell_density' -d '
{
	"pointfive_cell_density" :  {
		"properties": {
			"type": {
				"type": "string",
				"index": "analyzed",
				"fields" : {
					"untouched" : {
						"type": "string",
						"index": "not_analyzed"
					},
					"exactWords": {
						"type": "string",
						"analyzer": "string_lowercase"
					}
				}
			},
			"entity_id": {
				"type": "string",
				"index": "analyzed",
				"fields" : {
					"untouched" : {
						"type": "string",
						"index": "not_analyzed"
					},
					"exactWords": {
						"type": "string",
						"analyzer": "string_lowercase"
					}
				}
			},
			"cell_id": {
				"type": "string",
				"index": "analyzed",
				"fields" : {
					"untouched" : {
						"type": "string",
						"index": "not_analyzed"
					},
					"exactWords": {
						"type": "string",
						"analyzer": "string_lowercase"
					}
				}
			},
			"pointfive_cell_id": {
				"type": "string",
				"index": "analyzed",
				"fields" : {
					"untouched" : {
						"type": "string",
						"index": "not_analyzed"
					},
					"exactWords": {
						"type": "string",
						"analyzer": "string_lowercase"
					}
				}
			},
			"location_cell" : {
				"type" : "geo_point",
				"lat_lon": true,
				"validate": true
			},
			"location_pointfive_cell" : {
				"type" : "geo_point",
				"lat_lon": true,
				"validate": true
			},
			"count": {
				"type" : "integer"
			}
		}
	}
}'

curl -XPUT 'http://localhost:9200/_river/river-mongodb-pointfive_cell_density/_meta' -d '{
	"type": "mongodb",
	"mongodb": {
		"db": "sibexplorer_dev",
		"collection": "pointfive_cell_density"
	},
	"index": {
		"name": "sibexplorer",
		"type": "pointfive_cell_density"
	}
}'
