from ..dao import esDAO as esDao
import json

def get_admin_count(user_dn):
    query = {
        "size": 0,
        "query": {
            "match": {
                "role": "admin"
            }
        }
    }
    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=query)
    return res["hits"]["total"]
    

def get_user(user_dn):

    user_dn_query = {
        "query": {
            "match_phrase": {
            "user_dn.keyword": user_dn
            }
        }
    }

    # print(json.dumps(user_dn_query))

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=user_dn_query)

    if res["hits"]["total"] == 0:
        return None
    else:
        return res["hits"]["hits"][0]["_source"]


def getUsers(user_dn, search_data):
    
    users_query = {
                "size": 5000,
                "query": {
                    "wildcard": {
                    "user_cn": {
                        "value": "*" + search_data + "*"
                        }
                    }
                }
            }
    print("users_query: ", users_query)

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=users_query)

    results = []

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results.append(item["_source"])

    return results

def getAdmins(user_dn, user_obj):
    # default query gets all administrators (assumes user_role == maintainer)
    admin_query = {"query": 
                        {"bool": 
                                {"must": 
                                    [{"term": 
                                            {"user_role.keyword": "administrator"}
                                    }]
                                }
                        }
                    }
    if user_obj['user_role'] == 'administrator':  # user_role administrator only sees admins at their location
        admin_query = {"query": 
                            { "bool":
                                {"must":[
                                    {"term":{"user_role.keyword": "administrator" } },
                                    {"term":{"location_id.keyword": user_obj['location_id'] } }
                                    ] 
                                } 
                            }
                        }

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=admin_query)

    results = []

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results.append(item["_source"])
    return results

def search_users(user_dn, search_terms):
    users_query = {
        "size": 5000,
        "sort": [{"user_cn.keyword": {"order": "desc"}}],
        "query": {
            "wildcard": {
                "user_dn": {
                    "value":  '*' + search_terms + '*'
                }
            }
        } 
    }

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=users_query)

    if res["hits"]["total"] == 0:
        return None
    else:
        return {"users":res["hits"]["hits"]}


def update_user(user_dn, user_obj):
    return esDao.index(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=user_obj, id=user_obj["id"])


def delete_user(user_dn, user_obj):
    query = {"query": {"term": {"id.keyword": {"value": user_obj['id'], "boost": 1.0}}}}
    esDao.delete(user_dn, index=esDao.get_es_util_index(), body=query)
    
    return {"delete":"success"}

def chkSoleAdmin(user_dn, user_obj):
    print("userDAO chkSoleAdmin user_obj: ", user_obj)
    soleAdmin = False
    # query = {"query": { "bool": {"must":[{"term":{"user_role.keyword": user_obj['user_role'] } }, {"term":{"location_id.keyword": user_obj['location_id'] } }] } }}
    query = {
    "query": {
        "bool": {
            "must": [{
                "term": {
                "user_role.keyword": user_obj['user_role']}},{
                "term": {
                "location_id.keyword": user_obj['location_id']
                    }
                }],
            "must_not": [{
                "exists": {"field": "adminAt"}
                }]
        }
    }
    }
    print("query: ", query)
    results = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=query)
    # print("results hits total: ", results['hits']['total'])
    # {"user_cn": "", "user_dn":user_dn, "user_role":"administrator", "soleAdmin": soleAdmin}
    if int(results['hits']['total'] == 1):
        soleAdmin = True
    return {"soleAdmin": soleAdmin}

def chkSoleMaintainer(user_dn, user_obj):
    # print("userDAO chkSoleMaintainer user_obj: ", user_obj)
    soleMaintainer = False
    query = {"query": { "bool": {"must":[{"term":{"user_role.keyword": "maintainer" } }] } }}
    # print("query: ", query)
    results = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="users", body=query)
    # print("results hits total: ", results['hits']['total'])
    # {"user_cn": "", "user_dn":user_dn, "user_role":"administrator", "soleAdmin": soleAdmin}
    if int(results['hits']['total'] == 1):
        soleMaintainer = True
    return {"soleMaintainer": soleMaintainer}