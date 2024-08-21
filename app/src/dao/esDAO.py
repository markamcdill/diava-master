'''
This module is used to connect to elasticsearch
'''

import configparser
import json
import os

import requests
from elasticsearch import Elasticsearch, Urllib3HttpConnection
import urllib3

class MyConnection(Urllib3HttpConnection):
    def __init__(self, *args, **kwargs):
        extra_headers = kwargs.pop('extra_headers', {})
        super(MyConnection, self).__init__(*args, **kwargs)
        self.headers.update(extra_headers)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config = configparser.ConfigParser()
config.read(BASE_DIR.replace("src","") + "config.ini")
ELASTICSEARCH_HOST = config.get("ENV", "elasticsearch.host")
ELASTICSEARCH_INDEX = config.get("ENV", "elasticsearch.index")

MEME_ON = config.get("ENV", "meme.activate")
MEME_HOST = config.get("ENV", "meme.host")
MEME_INDEX = config.get("ENV", "meme.index")
ESS_PATH = config.get("ENV", "meme.ess")

SERVER_DN = config.get("ENV", "server.dn")
SERVER_CERT = config.get("ENV", "server.crt")
SERVER_KEY = config.get("ENV", "server.key")
CA_BUNDLE = config.get("ENV", "ca.bundle")

host = "https://" + config.get("ENV","meme.host") + config.get("ENV","meme.aac")


def get_es_client():
    es = Elasticsearch([ELASTICSEARCH_HOST], timeout=120)
    # print("CONNECTING TO ES " + ELASTICSEARCH_HOST)
    return es

def get_es_meme_client(user_dn):
    es = Elasticsearch(
        hosts=[
            {
                "host": MEME_HOST,
                "port": 443,
                "use_ssl": True,
                "url_prefix": ESS_PATH,
                "verify_certs": True,
                "client_cert": SERVER_CERT,
                "client_key": SERVER_KEY,
                "ca_certs": CA_BUNDLE,
                "timeout": 120
            }
        ],
        extra_headers={
            "user_dn": user_dn,
            "sys_client_s_dn": SERVER_DN
        },
        connection_class=MyConnection
    )
    # print("CONNECTING TO MEME ES " + MEME_HOST)
    return es

def get_es_index():
    if MEME_ON == "true":
        return MEME_INDEX
    else:
        return ELASTICSEARCH_INDEX

def get_es_archive_index():
    if MEME_ON == "true":
        return MEME_INDEX + "_archive"
    else:
        return ELASTICSEARCH_INDEX + "_archive"

def get_es_exercise_index():
    if MEME_ON == "true":
        return MEME_INDEX + "_exercise"
    else:
        return ELASTICSEARCH_INDEX + "_exercise"

def get_es_util_index():
    if MEME_ON == "true":
        return MEME_INDEX + "_util"
    else:
        return ELASTICSEARCH_INDEX + "_util"

def search(user_dn, index, doc_type, body):
    if MEME_ON == "true":
        result = get_es_meme_client(user_dn).search(index=index, doc_type=doc_type, body=body)
    else:
        result = get_es_client().search(index=index, doc_type=doc_type, body=body)
    return result

def index(user_dn, index, doc_type, body, id=None):

    if MEME_ON == "true":
        body = classify(body, "TOP SECRET//SI/TK//NOFORN")
        result = get_es_meme_client(user_dn).index(index=index, doc_type=doc_type, body=body, id=id)
    else:
        result = get_es_client().index(index=index, doc_type=doc_type, body=body, id=id)
    return result

def create(user_dn, index, doc_type, body, id=None):

    if MEME_ON == "true":
        body = classify(body, "TOP SECRET//SI/TK//NOFORN")
        result = get_es_meme_client(user_dn).create(index=index, doc_type=doc_type, body=body, id=id)
    else:
        result = get_es_client().create(index=index, doc_type=doc_type, body=body, id=id)
    return result

def update(user_dn, index, doc_type, body, id=None):

    if MEME_ON == "true":
        body = classify(body, "TOP SECRET//SI/TK//NOFORN")
        result = get_es_meme_client(user_dn).update(index=index, doc_type=doc_type, body=body, id=id)
    else:
        result = get_es_client().update(index=index, doc_type=doc_type, body=body, id=id)
    return result

def delete(user_dn, index, body):
    if MEME_ON == "true":
        result = get_es_meme_client(user_dn).delete_by_query(index=index, body=body)
    else:
        result = get_es_client().delete_by_query(index=index, body=body)
    refresh(index)
    return result

def refresh(index):
    get_es_client().indices.refresh(index=index)

def classify(json_object, abbreviation):
    abbreviation_list = ["TOP SECRET//SI/TK//NOFORN"]
    if abbreviation in abbreviation_list:
        json_object["acm"] = json.loads(convert_abbreviation(abbreviation))
        return json_object

def convert_abbreviation(abbreviation):
    return convert(host, [abbreviation], "ABBREVIATION", SERVER_CERT, SERVER_KEY)

def convert_list_of_abbreviations(abbreviations):
    return convert(host, abbreviations, "ABBREVIATION", SERVER_CERT, SERVER_KEY)

def convert_portion_marking(portion_marking):
    return convert(host, [portion_marking], "PORTIONMARKING", SERVER_CERT, SERVER_KEY)

def convert_list_of_portion_markings(portion_markings):
    return convert(host, portion_markings, "PORTIONMARKING", SERVER_CERT, SERVER_KEY)

def convert(host, classifications, capco_string_type, cert, key):
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    if cert == None:
        cert = SERVER_CERT
    if key == None:
        key = SERVER_KEY

    cert = (cert, key)
    payload = {
        "classifications": classifications,
        "capcoStringType": capco_string_type
    }
    result = requests.put(host + "capco/rollupstrings", data=json.dumps(payload), cert=cert, verify=CA_BUNDLE)
    result = result.json()
    payload = result

    if result["acmValid"]:
        result = requests.post(host + "acm/populate", data=payload["acmInfo"]["acm"], cert=cert, verify=CA_BUNDLE)
        result = result.json()
        if result["acmValid"]:
            return result["acmInfo"]["acm"]
