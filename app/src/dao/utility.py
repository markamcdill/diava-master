import json
import requests
import configparser
import os
import urllib3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
config = configparser.ConfigParser()
config.read(BASE_DIR.replace("src","") + "config.ini")

host = "https://" + config.get("ENV","meme.host") + config.get("ENV","meme.aac")
ca = config.get("ENV","ca.bundle")
cert = config.get("ENV","server.crt")
key = config.get("ENV","server.key")

def classify(json_object, abbreviation):
    abbreviation_list = ["TOP SECRET//SI/TK//NOFORN"]
    if abbreviation in abbreviation_list:
        json_object["acm"] = json.loads(convert_abbreviation(abbreviation))
        return json_object

def convert_abbreviation(abbreviation):
    return convert(host, [abbreviation], "ABBREVIATION", cert, key)

def convert_list_of_abbreviations(abbreviations):
    return convert(host, abbreviations, "ABBREVIATION", cert, key)

def convert_portion_marking(portion_marking):
    return convert(host, [portion_marking], "PORTIONMARKING", cert, key)

def convert_list_of_portion_markings(portion_markings):
    return convert(host, portion_markings, "PORTIONMARKING", cert, key)

def convert(host, classifications, capco_string_type, cert, key):
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    if cert == None:
        cert = config.get("ENV","server.crt")
    if key == None:
        key = config.get("ENV","server.key")

    cert = (cert, key)
    payload = {
        "classifications": classifications,
        "capcoStringType": capco_string_type
    }
    result = requests.put(host + "capco/rollupstrings", data=json.dumps(payload), cert=cert, verify=ca)
    result = result.json()
    payload = result

    if result["acmValid"]:
        result = requests.post(host + "acm/populate", data=payload["acmInfo"]["acm"], cert=cert, verify=ca)
        result = result.json()
        if result["acmValid"]:
            return result["acmInfo"]["acm"]