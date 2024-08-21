import traceback
from ..dao import esDAO as esDao
import configparser
import os

user_dn = "CN=name"
es = esDao.get_es_mama_client(user_dn)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config = configparser.ConfigParser()
config.read(BASE_DIR.replace("src","") + "config.ini")
MAMA_INDEX = config.get("ENV", "mama.index")

settings_filepath = BASE_DIR + "/dao/settings/settings.json"

#get settings and mappings files
with open(settings_filepath) as infile:
    settings = infile.read()


try:
    # print("indexes do not exist...creating")
    es.indices.create(index=esDao.MAMA_INDEX, body=settings)
    es.indices.create(index=esDao.MAMA_INDEX + "_archive", body=settings)
    es.indices.create(index=esDao.MAMA_INDEX + "_util")
except Exception as e:
    traceback.print_exc()

# print("DONE")