from flask import Flask, jsonify, Response, request, send_from_directory, render_template
import pandas as pd
from flask_cors import CORS
from flask_mail import Mail
import cgi
from src import users
from src import visits
from src import locations
from src import emailUtil
from src import settings as settingsUtil

import json

app = Flask(__name__, static_folder="web-app", template_folder="web-app")
CORS(app)
mail = Mail(app)
app.debug = False




@app.route("/")
def index():
    print ("FLASK IS WORKING")
    #return render_template("index.html")
    return {"IS_FLASK_WORKING": "A YUP"}


def get_post(request):
    payload = request.data
    payload = json.loads(payload)
    return payload


def get_credentials(request):
    if "dn" in request.environ:
        user_dn = request.environ['dn']
        user_dict = dict(x.split('=') for x in user_dn.split(',') if '=' in x)
        user_obj = {"user_cn": "", "user_dn":user_dn, "user_role":"read-only"}
        user_obj['user_cn'] = user_dict['CN']
        user_obj = users.get_user(user_dn, user_obj)
        return user_obj
    else:  # USED FOR TEST RUNNING NON-SSL
        print("NOT RUNNING SSL PROLLY")
        user_dn = get_user_dn(request)
        user_obj = {"user_cn": user_dn, "user_dn": user_dn, "user_role":"read-only"}
        user_obj = users.get_user(user_dn, user_obj)
        return user_obj


def get_user_dn(request):
    try:
        user_dn = request.environ['dn']
        print("LOG FROM REQUEST: " + user_dn + " is accessing " + request.url)
        return user_dn
    except Exception as e:
        # user_dn = "Mark not running ssl" + request.environ["REMOTE_ADDR"] #DO NOT DELETE THIS LINE


        # fullDn = "CN = McDill Mark A. d123987, OU=People, OU=DoDIIS, OU=DoD, O=U.S. Government, C=US"
        # fullDn = "CN = McDill Mark A. d123987"
        # userDnInfo = users.getUserDnInfo(fullDn)
        # user_dn = userDnInfo['CN']
        # print("userDnInfo: ", userDnInfo)
        # McDill Mark d123987

        # user_dn = "McDill Mark d123987" #maintainer
        # user_dn = "McDill Mark A. d123987" #administrator DO NOT DELETE THIS LINE
        # user_dn = Johnson Toria M d123456
        # user_dn = "Thapa Sharshin d1000015"
        # user_dn = "Mastromonaco Anthony M d123456" #DO NOT DELETE THIS LINE

        

        # user_dn = "Smith Snuffy d123456"
        # user_dn = "Pyle Goober d123456"
        # user_dn = "Malph Ralph d012316"
        # user_dn = "Mouse Mickey d012316"
        # user_dn = "Wilson Wade d989898"
        # user_dn = "Rubble Bamm-Bamm d1000020"
        user_dn = "Rubble Barney d1000013" 
        # user_dn = "Flinstone Fred d1000013" 
        # user_dn = "Stinson Barney d1000014" #Admin
        # user_dn = "Odinson Thor d108981"

        # user_dn = "Tribbiani Joey d1000013" #Admin
        # user_dn = "Geller Ross d1000014" #Traveler
        # user_dn = "Geller Monica d1000015" #Admin
        # user_dn = "Green Rachel d1000016"
        # user_dn = "Bing Chandler d1000017"
        # user_dn = "Buffay Phoebe d1000017"
        # user_dn = "Brown Ben d123434"

 

        print("LOG: " + user_dn + " is accessing " + request.url)
        return user_dn

@app.route('/diava/currentUser', methods=['GET', 'POST'])
def currentUser():
    return users.getCurrentUser()


@app.route('/diava/user', methods=['GET', 'POST'])
def user():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    if request.method == "GET":
        user_obj = users.get_user(user_dn, user_obj)
    if request.method == "POST" and "id" not in user_obj:
        user_obj = users.set_user(user_dn, user_obj)

    
    return jsonify(user_obj)

@app.route('/diava/getUsers', methods=['GET', 'POST'])
def getUsers():

    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    print("THE USER ACCESSING THE PAGE: ")
    # print(user_obj)
    

    search_data = ""

    if request.method == "GET":
        search_data = request.args["search_data"]
    if request.method == "POST":
        post = get_post(request)
        search_data = post["search_data"]


    return jsonify(users.getUsers(user_dn, user_obj, search_data))

@app.route('/diava/getAdmins', methods=['GET', 'POST'])
def getAdmins():

    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    return jsonify(users.getAdmins(user_dn, user_obj))


@app.route('/diava/createVisit', methods=['GET', 'POST'])
def createVisit():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    visit_obj = ""

    if request.method == "GET":
        visit_obj = request.args["visit_obj"]
    if request.method == "POST":
        post = get_post(request)
        visit_obj = post["visit_obj"]
    return jsonify(visits.createVisit(user_dn, visit_obj))
    

@app.route('/diava/getVisits', methods=['GET', 'POST'])
def getVisits():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    return jsonify(visits.getVisits(user_dn))

@app.route('/diava/getVisitsByUser', methods=['GET'])
def getVisitsByUser():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    return jsonify(visits.getVisitsByUser(user_dn))

@app.route('/diava/updateUser', methods=['GET', 'POST'])
def updateUpdate():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    userdata_obj = ""

    if request.method == "GET":
        userdata_obj = request.args["user"]
    if request.method == "POST":
        post = get_post(request)
        userdata_obj = post["user"]
        
    return jsonify(users.update_user(user_dn, userdata_obj))

@app.route('/diava/deleteUser', methods=['GET', 'POST'])
def deleteUser():
    
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    userdata_obj = ""

    if request.method == "GET":
        userdata_obj = request.args["user"]
    if request.method == "POST":
        post = get_post(request)
        userdata_obj = post["user"]
    
    return jsonify(users.delete_user(user_dn, userdata_obj))

@app.route('/diava/deleteVisit', methods=['GET', 'POST'])
def deleteVisit():
    
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    visit_obj = ""

    if request.method == "GET":
        visit_obj = request.args["visit"]
    if request.method == "POST":
        post = get_post(request)
        visit_obj = post["visit"]
    
    return jsonify(visits.deleteVisit(user_dn, visit_obj))

@app.route('/diava/chkSoleAdmin', methods=['GET','POST'])
def chkSoleAdmin():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    if request.method == "GET":
        userdata_obj = request.args["user"]
    if request.method == "POST":
        post = get_post(request)
        userdata_obj = post["user"]
    return jsonify(users.chkSoleAdmin(user_dn, userdata_obj))

@app.route('/diava/chkSoleMaintainer', methods=['GET','POST'])
def chkSoleMaintainer():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    if request.method == "GET":
        userdata_obj = request.args["user"]
    if request.method == "POST":
        post = get_post(request)
        userdata_obj = post["user"]
    print("userdata_obj: ", userdata_obj)
    return jsonify(users.chkSoleMaintainer(user_dn, userdata_obj))

@app.route('/diava/updateVisit', methods=['GET', 'POST'])
def updateVisit():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    visit_obj = ""

    if request.method == "GET":
        visit_obj = request.args["visit_obj"]
    if request.method == "POST":
        post = get_post(request)
        visit_obj = post["visit_obj"]

    #visit_obj = json.dumps(visit_obj)
    # end delete when tying to fronend
    
    return jsonify(visits.updateVisit(user_dn, visit_obj))

# @app.route('/diava/getVisits', methods=['GET', 'POST'])
# def getVisits():
#     user_obj = get_credentials(request)
#     user_dn = get_user_dn(request)

#     return jsonify(visits.getVisits(user_dn))

@app.route('/diava/exportVisits', methods=['POST'])
def exportVisits():
    user_dn = get_user_dn(request)
    try:
        visit_data = request.form.get('visit_data')
        res = visits.exportVisits(user_dn, visit_data)
    except Exception as e:
        res = {'Failed' : str(e)}
    
    return res

# @app.route('/diava/exportExcel', methods=['GET','POST'])
# def exportExcel():
    # user_dn = get_user_dn(request)

    # if request.method == "GET":
    #     visit_data = request.args["visit_data"]
    # if request.method == "POST":
    #     post = get_post(request)
    #     visit_data = post["visit_data"]

    # return visits.exportExcel(visit_data)


@app.route('/diava/searchVisits', methods=['GET', 'POST'])
def searchVisits():
    user_dn = get_user_dn(request)

    search_data = ""
    if request.method == "GET":
        search_data = request.args["search_data"]
    if request.method == "POST":
        post = get_post(request)
        search_data = post["search_data"]

    json.loads(search_data)

    return  jsonify(visits.searchVisits(user_dn, search_data))


@app.route('/diava/createLocation', methods=['GET', 'POST'])
def createLocation():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    location_obj = ""

    if request.method == "GET":
        location_obj = request.args["location"]
    if request.method == "POST":
        post = get_post(request)
        location_obj = post["location"]

    print("create location")
    return jsonify(locations.createLocation(user_dn, location_obj))

@app.route('/diava/updateLocation', methods=['GET', 'POST'])
def updateLocation():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    location_obj = ""

    if request.method == "GET":
        location_obj = request.args["location"]
    if request.method == "POST":
        post = get_post(request)
        location_obj = post["location"]

    return jsonify(locations.updateLocation(user_dn, location_obj))


@app.route('/diava/getLocation', methods=['GET', 'POST'])
def getLocation():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    location_id = ""

    if request.method == "GET":
        location_id = request.args["location_id"]
    if request.method == "POST":
        post = get_post(request)
        location_id = post["location_id"]

        theLocation = jsonify(locations.getLocation(user_dn, location_id))

    return jsonify(locations.getLocation(user_dn, location_id))


@app.route('/diava/getLocations', methods=['GET', 'POST'])
def getLocations():
    user_obj = get_credentials(request)
    user_dn = get_user_dn(request)

    return jsonify(locations.getLocations(user_dn))

@app.route('/diava/sendEmail', methods=['GET', 'POST'])
def sendEmail(): # send email notification to email recipients found in visitRequest

    if request.method == "GET":
        visitRequest = request.args["visitRequest"]
    if request.method == "POST":
        post = get_post(request)
        visitRequest = post["visitRequest"]
    visitRequest = json.loads(visitRequest)
    return jsonify(emailUtil.sendEmail(mail, visitRequest))


@app.route('/diava/getSettings', methods=['GET', 'POST'])
def getSettings():
    user_dn = get_user_dn(request)

    return jsonify(settingsUtil.getSettings(user_dn))

@app.route('/diava/editSettings', methods=['GET', 'POST'])
def editSettings():
    user_dn = get_user_dn(request)

    if request.method == "GET":
        settings = request.args["settings"]
    if request.method == "POST":
        post = get_post(request)
        settings = post["settings"]

    settings = json.loads(settings)
    return jsonify(settingsUtil.editSettings(user_dn, settings))


if __name__ == "__main__":
    try:
        app.run(host="0.0.0.0")
    except Exception:
        app.logger.exception("Failed")