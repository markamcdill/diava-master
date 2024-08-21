from ..dao import esDAO as esDao

def getSettings(user_dn):
    query = {
                "query": {
                    "match_all": {}
                }
            }

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="settings", body=query)

    results = []

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results.append(item["_source"])

    return results

def editSettings(user_dn, settings):
    return esDao.index(user_dn, index=esDao.get_es_util_index(), doc_type="settings", body=settings, id=settings['settings_id'])

def refreshUtil():
    esDao.refresh(esDao.get_es_util_index())