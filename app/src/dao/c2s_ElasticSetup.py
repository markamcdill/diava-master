import esDAO as esDao
import configparser
import os
import traceback

es = esDao.get_es_client()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config = configparser.ConfigParser()
config.read(BASE_DIR.replace("src","") + "config.ini")
ELASTICSEARCH_INDEX = config.get("ENV", "elasticsearch.index")

settings_filepath = BASE_DIR + "/dao/settings/settings.json"

#get settings and mappings files
with open(settings_filepath) as infile:
    settings = infile.read()
try:
    # print("delete old index")
    es.indices.delete(index=ELASTICSEARCH_INDEX)
except Exception as e:
    traceback.print_exc()

try:
    # print("delete old index")
    es.indices.delete(index=ELASTICSEARCH_INDEX + "_archive")
except Exception as e:
    traceback.print_exc()

# try:
#     print("delete old index")
#     es.indices.delete(index=ELASTICSEARCH_INDEX + "_exercise")
# except Exception as e:
#     print("ERROR")
#     print e

try:
    # print("delete old index")
    es.indices.delete(index=ELASTICSEARCH_INDEX + "_util")
except Exception as e:
    traceback.print_exc()

try:
    # print("index does not exist...creating")
    es.indices.create(index=ELASTICSEARCH_INDEX, body=settings)
    es.indices.create(index=ELASTICSEARCH_INDEX + "_archive", body=settings)
    # es.indices.create(index=ELASTICSEARCH_INDEX + "_exercise", body=settings)
    es.indices.create(index=ELASTICSEARCH_INDEX + "_util")
except Exception as e:
    traceback.print_exc()

print("DONE")