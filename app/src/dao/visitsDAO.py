from ..dao import esDAO as esDao
import json
import datetime

def getVisit(user_dn, visit_id):

    query = {
        "query": {
            "match": {
                "_id": visit_id
            }
        }
    }

    res = esDao.search(user_dn, index=esDao.get_es_util_index(), doc_type="visits", body=query)

    if res["hits"]["total"] == 0:
        return None
    else:
        return res["hits"]["hits"][0]["_source"]

# Get all visits, limit by 100.
def getVisits(user_dn):
    query = {
        "query": {
            "match_all": {}
        },
        "size" : 100
    }

    res = esDao.search(user_dn, index=esDao.get_es_index(), doc_type="visits", body=query)

    results = {"visits":[]}

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results["visits"].append(item["_source"])

    return results

# Get visits submitted by user_dn.
def getVisitsByUser(user_dn):
    today = datetime.date.today()
    # Old query
    # query = {
    #     "query" : {
    #         "match" : {
    #             "visit_submitted_by" : user_dn
    #         }
    #     }
    # }
    # New Query
    query = {
        "query": {
            "bool": {
            "must":[{
                "range":{"visit_end_dt":{"gte": str(today)}
                }
            },
            {"match": {"visit_submitted_by.keyword": {"query": user_dn}}}
            ],
            "must_not": [
                {"match": {
                "visit_status": "CANCELLED"
                }}
            ]
            }
        }
    }
    
    res = esDao.search(user_dn, index=esDao.get_es_index(), doc_type="visits", body=query)

    results = {"visits":[]}

    if res["hits"]["total"] > 0:
        for item in res["hits"]["hits"]:
            results["visits"].append(item["_source"])
    return results

def updateVisit(user_dn, visit):
    return esDao.index(user_dn, index=esDao.get_es_index(), doc_type="visits", body=visit, id=visit["visit_id"])


def delete_visit(user_dn, visit_id):
    query = {
        "query": {
            "match": {
                "visit_id": visit_id
            }
        }
    }
    esDao.delete(user_dn, index=esDao.get_es_index(), body=query)
    return {"delete":"success"}



def searchVisits(user_dn, search_data):
    search_data = json.loads(search_data)
    searchValue = search_data['searchValue']
    print("searchValue: ", searchValue)
    startDate = search_data['startDate']
    endDate = search_data['endDate']
    results = []
    query = ""
    adminFilter = {}
    if search_data['user_role'] == 'administrator':
        # add the admin filter to each query (only show values at this admin's location)
        adminFilter = {"match":{"location_id.keyword": {"query": search_data['location_id']}}}
        
        

    # SEARCH METHODOLOGY
    # Must have at least a search value or one date
    #   IF searchValue is not blank
    #       ASSUME searchValue is a visit ID; execute a KEYWORD search for a visit ID
    #           IF one record found
    #               return record (it was a visit ID)
    #           ELSE (it was not a visit ID)
    #               IF date-range
    #                   search first/last name + date-range
    #               ELSE (searchValue only)
    #                   search first/last name
    #       
    #   ELSE (no searchValue)
    #       search date-range (only)
    
    if searchValue is not None and searchValue is not '':
        # search for a visit ID by default
        query = {
                    "query": {
                        "bool":{
                        "must":[
                            {"match": {"visit_id.keyword": {"query": searchValue}}}
                        ]
                        }
                    }
                }
        query['query']['bool']['must'].append(adminFilter)
                
        res = esDao.search(user_dn, index=esDao.get_es_index(), doc_type="visits", body=query)
        if res["hits"]["total"] == 1: # found this visit ID; return results
            for item in res["hits"]["hits"]:
                results.append(item["_source"])
            return results
        else: # determine if first/last name only or first/last name + date-range
            if startDate is not None or endDate is not None:
                # search for first/last name + date range
                # where visit-start-date greater than or equal to start-date AND less than or equal to end-date
                #   AND
                # visit-end-date greater than or equal to start-date AND less than or equal to end-date
                #   AND
                # searchValue LIKE traveler first name OR searchValue LIKE traveler last name
                query = {
                        "query": {
                            "bool": {
                            "must":
                                [
                                {
                                    "bool":
                                    {"must": 
                                        [
                                        {
                                            "range":{"visit_start_dt":{"gte": startDate, "lte":endDate}}
                                        },
                                        {
                                            "range":{"visit_end_dt":{"gte": startDate, "lte":endDate}}
                                        }
                                        ] 
                                    }
                                },
                                    {
                                    "multi_match":
                                        {
                                        "query": '*' + searchValue + '*',
                                            "fields":
                                            [
                                                "traveler_fname",
                                                "traveler_lname"
                                            ]
                                        }
                                    }
                                
                                ]
                            }
                            }
                        }
                query['query']['bool']['must'].append(adminFilter)

            else:
                # search for first/last name only
                # where searchValue LIKE traveler first name or searchValue LIKE traveler last name
                query = {"query": 
                            {"bool": {
                                "must": [
                                            {"multi_match":  {"query": searchValue, "fields": ["traveler_fname", "traveler_lname"]}}
                                        ]
                                    }
                            }
                        }
                query['query']['bool']['must'].append(adminFilter)

    else:
        # search for date range only
        # where visit-start-date greater than or equal to start-date AND less than or equal to end-date
        #   AND
        # visit-end-date greater than or equal to start-date AND less than or equal to end-date
        query = {
                "query": 
                    {
                        "bool": {
                        "must": [
                                    {"range":{"visit_start_dt":{"gte": startDate, "lte": endDate}}
                                    }, 
                                    {"range":{"visit_end_dt": {"gte": startDate, "lte": endDate}}}
                                ]
                        }
                    }
                }
        query['query']['bool']['must'].append(adminFilter)

    query['size'] = 10000
    print("query: ", query)
    # query built, let er rip
    res = esDao.search(user_dn, index=esDao.get_es_index(), doc_type="visits", body=query)
    

    if res["hits"]["total"] > 0: # only return the actual hits (_source) as an array
        for item in res["hits"]["hits"]:
            results.append(item["_source"])
    return results

   
