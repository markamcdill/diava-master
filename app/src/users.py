import json
import datetime
import base64
from .dao import userDAO as uDao
from .dao import locationsDAO as lDao

current_user = {}


def get_user(user_dn, user_obj):
    u_obj = uDao.get_user(user_dn) # check for user in ES
    if u_obj is None: # user not in ES, insert 'user_obj' (info found in request)
        if len(uDao.getUsers(user_dn,'')) == 0: # there are no users in ES; first user = maintainer
            user_obj['user_role'] = 'maintainer'
        u_obj = set_user(user_dn, user_obj) # return ES insert as 'u_obj'
    set_user(user_dn, u_obj) # insert the user found in ES !!NOTE: why are we setting the user in ES that we just created in ES????
    #get user location and update user object

    if "location_id" in u_obj and u_obj['location_id'] != '':
        location_obj = lDao.getLocation(user_dn, u_obj["location_id"])
        # lDao.getLocation(user_dn, u_obj["location_id"])["location_name"]

        u_obj["location_name"] = ''
        if location_obj:
            if "location_name" in location_obj:
                u_obj["location_name"] = location_obj["location_name"]
                
            if "location_active" in location_obj:
                u_obj["location_active"] = location_obj["location_active"]

    return u_obj

def getUsers(user_dn, user_obj, search_data):
    '''
    if user_obj role == admin, do admin query
    else if role = maintaner do maintaner query

    add getAdminUsers method to DAO


    '''
    # print("getUsers: ", search_data)

    users = uDao.getUsers(user_dn, search_data) #this gets wrapped in the IF you make above
    for user in users:
        
        if "location_id" in user and user["location_id"] is not '':
            # lDao.getLocation(user_dn, user["location_id"])
            location_obj = lDao.getLocation(user_dn, user["location_id"])
            user["location_name"] = location_obj["location_name"]
            user["location_active"] = location_obj["location_active"]
            user['location_class'] = ''
            if location_obj['location_active'] == 'no':
                user['location_class'] = 'disabled'

    return users

def getAdmins(user_dn, user_obj):
    admins = uDao.getAdmins(user_dn, user_obj)
    for admin in admins:
        if "location_id" in admin and admin["location_id"] is not '':
            location_obj = lDao.getLocation(user_dn, admin["location_id"])
            admin["location_name"] = location_obj["location_name"]
            admin["location_active"] = location_obj["location_active"]
            admin['location_class'] = ''
            if location_obj['location_active'] == 'no':
                admin['location_class'] = 'disabled'

    return admins


def update_user(user_dn, user_obj):
    user_obj = json.loads(user_obj)
    user_obj["last_active"] = datetime.datetime.now()
    if 'location_name' in user_obj:
        del user_obj['location_name']
    # user_obj["last_active_milli"] = datetime.datetime.now().timestamp() * 1000

    res = uDao.update_user(user_dn, user_obj)

    print("LOG: User " + user_obj["user_dn"] + " has been updated by " + user_dn + ".")
    return user_obj


def delete_user(user_dn, user_obj):
    user_obj = json.loads(user_obj)
    return uDao.delete_user(user_dn, user_obj)


def set_user(user_dn, user_obj):
    # print("setting a new user in set_user()")
    if type(user_obj) is str:
        user_obj = json.loads(user_obj)
    if "id" not in user_obj:
        id = base64.b64encode(bytes(user_dn, 'utf-8'))
        id = str(id).replace("\n", "")
        user_obj["id"] = str(id)
    user_obj["last_active"] = datetime.datetime.now()
    user_obj["last_active_milli"] = datetime.datetime.now().timestamp() * 1000

    uDao.update_user(user_dn, user_obj)
    # print("user_obj on users.py: ", user_obj)
    global current_user
    current_user = user_obj
    # print("current_user on users.py: ", user_obj)
    return user_obj

def getCurrentUser():
    # print("current user from getCurrentUser() py: ", current_user)
    return current_user

def search_users(user_dn, search_terms):
    #basic input validation
    # print("searching users: ", search_terms)
    flag = False
    for ch in search_terms:
        if ch in ['<','>','?','#','%', '{', '}']:
            flag = True
            break
    if flag:
        return uDao.search_users(user_dn, str(None))
    if not search_terms: 
        return uDao.search_users(user_dn, '*')
    else:
        return uDao.search_users(user_dn, search_terms)

def chkSoleAdmin(user_dn, userdata_obj):
    if type(userdata_obj) is str:
        userdata_obj = json.loads(userdata_obj)
    return uDao.chkSoleAdmin(user_dn, userdata_obj)

def chkSoleMaintainer(user_dn, userdata_obj):
    if type(userdata_obj) is str:
        userdata_obj = json.loads(userdata_obj)
    return uDao.chkSoleMaintainer(user_dn, userdata_obj)

# def getUserDnInfo(fullDn):
#     userDnInfo = {'DN': fullDn, 'CN': '', 'last_name': '', 'first_name': '', 'middle_initial': '', 'd_number': '', 'org_units': [], 'org': '', 'country': ''}
#     orgUnits = []

#     dnParts = fullDn.split(",")

#     for dnPart in dnParts:
#         part = dnPart.split("=")
#         if part[0].strip() == "CN":
#             userDnInfo['CN'] = part[1].lstrip()
#             cnParts = userDnInfo['CN'].split(" ")
#         elif part[0].strip() == "OU":
#             orgUnits.append(part[1])
#         elif part[0].strip() == "O":
#             userDnInfo['org'] = part[1]
#         elif part[0].strip() == "C":
#             userDnInfo['country'] = part[1]

#     userDnInfo['org_units'] = orgUnits

#     if len(cnParts) > 3:# this CN has a middle intial
#         userDnInfo['last_name'] = cnParts[0]
#         userDnInfo['first_name'] = cnParts[1]
#         userDnInfo['middle_initial'] = cnParts[2]
#         userDnInfo['d_number'] = cnParts[3]
#     else:
#         userDnInfo['last_name'] = cnParts[0]
#         userDnInfo['first_name'] = cnParts[1]
#         userDnInfo['middle_initial'] = "NMI"
#         userDnInfo['d_number'] = cnParts[2]

#     return userDnInfo
