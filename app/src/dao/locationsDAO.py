from ..dao import esDAO as esDao

def updateLocation(user_dn, location):
    return esDao.index(user_dn, index=esDao.get_es_util_index(), doc_type="locations", body=location, id=location["location_id"])


def getLocations(user_dn):
    query = {
        "size" : 2000,
        "sort": [
            {
            "location_name.keyword": {
                "order": "asc"
            }
            }
        ], 
        "query": {
            "match_all": {}
        }
    }

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="locations", body=query)

    results = []

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results.append(item["_source"])

    return results

def getLocation(user_dn, location_id):
    query = {"query": {"match_phrase": {"location_id": location_id}}}

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="locations", body=query)
    

    if res["hits"]["total"] == 0:
        return None
    else:
        return res["hits"]["hits"][0]["_source"]