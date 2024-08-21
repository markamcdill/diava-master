from flask_mail import Message

# construct email and send to email recipients found in visitRequest
def sendEmail(mail, visitRequest):
    # print("visitRequest: ", visitRequest)

    location_name = visitRequest['location_name'].split(":")[0]
    subject = location_name +" Visit Notification - "+visitRequest['visit_status']
    sender = visitRequest['settings']['settings_mail_sender']
    

    # iterate over emailRecipients dictionary and build the msg object for each email group (e.g. admin, traveler, poc, onbehalf)
    for key,val in visitRequest['emailRecipients'].items():
        if key == 'adminEmails': # admin emails
            adminEmails = ""
            for adminEmail in val: #create a comma separated value of admin emails (for the email body)
                adminEmails += adminEmail + ", "
            visitRequest['adminEmails'] = adminEmails[:-2] #place the email address csv back into the visit request for use in the email body

            msg = Message(subject=subject, sender=sender, recipients=val) # val IS an array
            msg.html = buildEmailBody(key, visitRequest) # build the email body
            mail.send(msg)
        elif key == 'traveler_email_jwics': # traveler's email
            msg = Message(subject=subject, sender=sender, recipients=[val]) # val must be an array
            msg.html = buildEmailBody(key, visitRequest) # build the email body
            mail.send(msg)
        elif key == 'onbehalf_submitted_by_email_jwics' and val != "": # submitter onbehalf email
            msg = Message(subject=subject, sender=sender, recipients=[val]) # val must be an array
            msg.html = buildEmailBody(key, visitRequest) # build the email body
            mail.send(msg)
        elif key == 'visit_email':  # POC email
            msg = Message(subject=subject, sender=sender, recipients=[val]) # val must be an array
            msg.html = buildEmailBody(key, visitRequest) # build the email body
            mail.send(msg)

#  construct the body of each email (based on its type)
def buildEmailBody(emailType, visitRequest):
    """
        EMAIL RULES
        Request On Behalf of Traveler (4 emails sent)
            1) Admin Email Has:
                On Behalf Statement: Yes
                App Link: Yes
                Visit ID: Yes
                Contact Info: No
            2) Traveler Email Has:
                On Behalf Statement: Yes
                App Link: No
                Visit ID: No
                Contact Info: Yes but modified (submitter's contact info, NOT admin contact info)
            3) Visit (POC) Email Has:
                On Behalf Statement: Yes
                App Link: No
                Visit ID: No
                Contact Info: Yes
            4) On Behalf Email Has: (everything)
                On Behalf Statement: Yes
                App Link: Yes
                Visit ID: Yes
                Contact Info: Yes

        Requestor is Submitter (3 emails sent)
            1) Admin Email Has:
                On Behalf Statement: No
                App Link: Yes
                Visit ID: Yes
                Contact Info: No
            2) Traveler Email Has: (everything)
                On Behalf Statement: No
                App Link: Yes
                Visit ID: Yes
                Contact Info: Yes
            3) Visit (POC) Email Has:
                On Behalf Statement: No
                App Link: No
                Visit ID: No
                Contact Info: Yes
            On Behalf Email Has:
                NOT SENT
    """
    # set values for email body (string)
    settings_app_url = visitRequest['settings']['settings_app_url']
    visit_classification_full = visitRequest['visit_classification']
    if visitRequest['visit_classification_dissem']:
        visit_classification_full = visitRequest['visit_classification'] + '//NOFORN'
    location_name = visitRequest['location_name'].split(":")[0]
    traveler_full_name = visitRequest['traveler_fname'] +' '+ visitRequest['traveler_lname']
    visit_office_name = visitRequest['visit_office_name']
    # delete visitRequest['visit_start_dt_display']
    # delete visitRequest['visit_end_dt_display']
    # delete visitRequest['traveler_dob_display']


    visit_start_dt = visitRequest['visit_start_dt_display']
    visit_end_dt = visitRequest['visit_end_dt_display']
    visitID = visitRequest['visit_id']
    traveler_rank_grade = visitRequest['traveler_rank_grade']
    traveler_email_jwics = visitRequest['traveler_email_jwics']
    visit_email = visitRequest['visit_email'] #POC's email of office visiting - required
    emailRecipients = visitRequest['emailRecipients']#json object with all recipient emails (by type)
    adminEmails = visitRequest['adminEmails'] # admin emails transformed into a comma separated value for email body
    visit_status = visitRequest['visit_status'].upper()
    status_clause = "is scheduled to visit"
    if visit_status == "CANCELLED":
        status_clause = "has cancelled their visit request for"

    # Default Values for Email Body
    appLink = """ Visit <a href='{settings_app_url}'>{settings_app_url}</a> to view visit details.""".format(**locals())
    onBehalf = ""
    contactInfo = """<div style='font-size: 13pt;'><p>For more information contact the {location_name} administrator(s): {adminEmails}</p></div>""".format(**locals())
    emailVisitID = """<h4 style='padding: 0; margin: 0;'>Visit Notification ID:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{visitID}</span></h5>""".format(**locals())

    # Manipulate email body values for each email type (reference EMAIL RULES)
    if visitRequest['on_behalf'] == 'Yes': #Request On Behalf of Traveler
        onbehalf_submitted_by_email_jwics = visitRequest['onbehalf_submitted_by_email_jwics']
        submittedByParts = visitRequest['visit_submitted_by'].split(" ")
        submittedBy = submittedByParts[1] + " " + submittedByParts[0]
        onBehalf = """            <div style='font-size: 13pt;'><p>This Visit Request submitted by {submittedBy} on behalf of {traveler_full_name}</p></div>""".format(**locals())
        if emailType == 'adminEmails': # gets everything except contact info
            contactInfo = ""
        elif emailType == 'traveler_email_jwics': # gets modified contact info (submitter's contact info, not admin contact info)
            appLink = ""
            emailVisitID = ""
            contactInfo = """<div style='font-size: 13pt;'><p>For more information contact {submittedBy} at {onbehalf_submitted_by_email_jwics}</p></div>""".format(**locals())
        elif emailType == 'visit_email':
            appLink = ""
            emailVisitID = "" 

        # onbehalf_submitted_by_email_jwics gets all default values
            
    else: # requestor is submitter
        if emailType == 'adminEmails': # gets everything except contact info
            contactInfo = ""
        elif emailType == 'visit_email': # remove link and visit for poc email
            appLink = ""
            emailVisitID = ""

        # traveler_email_jwics gets all default values

    additionalVisitors = "<div style='font-size: 13pt;'><p>ADDITIONAL VISITORS: NONE</div>" # default no additional visitors
    if len(visitRequest['additional_visitors']) > 0: # build the additional visitor's table
        additionalVisitors = buildAdditionalVisitors(visitRequest['additional_visitors'])

    emailBody = """
    <div>
        <p>Classification: {visit_classification_full}</p>
        <div style='font-family: Helvetica, sans-serif; color: #595959; padding: 2em 4em 3em 4em; margin: 0 3em 0 1em; border-radius: 15px; border: 1px solid #cccccc'>
            <div style='font-weight: bold; color: black; font-size: 2em; border-bottom: 1px solid #bfbfbf'>
                D&#299;<span style='color: #007af3;font-weight: normal;'>AVA</span>
            </div>
            <div style='margin-bottom: 2em 0 0 0; font-size: 10pt; color: #666666'>
                DIA Visit Application
            </div>
            <div style='font-size: 13pt;'><p>VISIT STATUS: {visit_status}</div>
            <div style='font-size: 13pt;'>
                <p>This is and automated email, please do not reply. {traveler_full_name} {status_clause} {location_name} on {visit_start_dt}. {appLink}</p>
            </div>
            <div style='font-size: 13pt;'><p>VISIT DETAILS: </div>
            {onBehalf}
            <div style='text-indent: 20px;'>
                {emailVisitID}
                <h4 style='padding: 0; margin: 0;'>Classification of this visit:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{visit_classification_full}</span></h4>
                <h4 style='padding: 0; margin: 0;'>Visit Office Name:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{visit_office_name}</span></h4>
                <h4 style='padding: 0; margin: 0;'>Traveler's Rank / Grade:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{traveler_rank_grade}</span></h4>
                <h4 style='padding: 0; margin: 0;'>Traveler's Name:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{traveler_full_name}</span></h4>
                <h4 style='padding: 0; margin: 0;'>Arrival Date:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{visit_start_dt}</span></h4>
                <h4 style='padding: 0; margin: 0;'>Departure Date:<span style='color: #666666; font-weight: normal; padding-left: 10px;'>{visit_end_dt}</span></h4>
            </div>
            {additionalVisitors}
            {contactInfo}
        </div>
    </div>
    """.format(**locals())
    # print("emailBody: ", emailBody)
    return emailBody

def buildAdditionalVisitors(additional_visitors):
    additionalVisitors = "<div style='font-size: 13pt;'><p>ADDITIONAL VISITORS: </div>"
    tableStart = "<table style='text-indent: 20px;'>"
    header = "<th style='text-align: left;'>Name</th><th style='text-align: left;'>Rank</th><th style='text-align: left;'>Record Protect</th>"
    tableEnd = "</table>"

    additionalVisitors += tableStart
    additionalVisitors += header

    for additionalVisitor in additional_visitors:
        addVisitorFullName = additionalVisitor['add_visitor_fname'] + ' ' + additionalVisitor['add_visitor_lname']
        rank = additionalVisitor['add_visitor_rank_grade']
        rp = additionalVisitor['add_visitor_rp'].capitalize()
        additionalVisitors += """
            <tr style='color: #666666; font-weight: normal;'><td style='white-space: nowrap; text-align: left;'>{addVisitorFullName}</td><td style='text-align: left;'>{rank}</td><td style='text-align: left;'>{rp}</td></tr>
            """.format(**locals())

    additionalVisitors += tableEnd
    return additionalVisitors