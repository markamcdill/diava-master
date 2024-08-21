import json
import datetime
import uuid
from .dao import locationsDAO as lDao

current_user_location = {}

def createLocation(user_dn, location_obj):
    location_obj = json.loads(location_obj)
    location_obj["location_id"] = str(uuid.uuid4())
    location_obj["location_create_date"] = datetime.datetime.now()
    
    res = lDao.updateLocation(user_dn, location_obj)
    
    return location_obj

def getLocation(user_dn, location_id):
    return lDao.getLocation(user_dn, location_id)

def updateLocation(user_dn, location_obj):
    location_obj = json.loads(location_obj)
    location_obj["location_update_date"] = datetime.datetime.now()
    
    res = lDao.updateLocation(user_dn, location_obj)
    
    return location_obj

def getLocations(user_dn):
    res = lDao.getLocations(user_dn)
    
    return res