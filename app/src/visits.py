import json
import datetime
import uuid
from .dao import visitsDAO as vDao
import pandas as pd
from flask import make_response, jsonify
# import io
# import xlsxwriter

def createVisit(user_dn, visit_obj):
    # print("visit.py visit_obj: ", visit_obj)
    visit_obj = json.loads(visit_obj)
    # visit_obj["visit_id"] = str(uuid.uuid4())
    visit_obj["visit_create_date"] = datetime.datetime.now()
    
    location_info = visit_obj['location_name'].split(":")
    
    visit_obj['location_name'] = location_info[0]
    visit_obj['location_id'] = location_info[1]
    visit_obj['visit_classification_full'] = visit_obj['visit_classification']
    if (visit_obj['visit_classification_dissem'] == True):
        visit_obj['visit_classification_dissem'] = "NOFORN"
        visit_obj['visit_classification_full'] = visit_obj['visit_classification'] + "//" + visit_obj['visit_classification_dissem']

    return vDao.updateVisit(user_dn, visit_obj)

def updateVisit(user_dn, visit_obj):
    visit_obj = json.loads(visit_obj)
   # visit_obj["visit_update_date"] = datetime.datetime.now()
    
    res = vDao.updateVisit(user_dn, visit_obj)
    
    return visit_obj

def getVisits(user_dn):
    res = vDao.getVisits(user_dn)
    return res

def getVisitsByUser(user_dn):
    res = vDao.getVisitsByUser(user_dn)
    return res

def exportVisits(user_dn, visit_data):
        df = pd.read_json(visit_data)
        output = make_response(df.to_csv())
        output.headers["Content-Disposition"] = "attachment; filename=visit_export.csv"
        output.headers["Content-type"] = "text/csv"
        return output

def searchVisits(user_dn, search_data):
    searchResults = vDao.searchVisits(user_dn, search_data)

    for searchResult in searchResults:# work up display fields (traveler full name and visit full name) so we have
                                      # single fields for mat sort column
        searchResult['traveler_full_name'] = str(searchResult['traveler_fname']) + " " + str(searchResult['traveler_m_initial']) + " " + str(searchResult['traveler_lname'])
        searchResult['visit_POC_full'] = str(searchResult['visit_fname']) + " " + str(searchResult['visit_lname'])
        
    
    return searchResults

def deleteVisit(user_dn, visit_obj):
    visit_obj = json.loads(visit_obj)
    return vDao.delete_visit(user_dn, visit_obj['visit_id'])


# def exportExcel(visit_data):
#     df = pd.DataFrame(json.loads(visit_data))
#     buffer = io.BytesIO()
#     with pd.ExcelWriter(buffer) as writer:
#         excelFile = df.to_excel(writer)
#         print("excelFile: ", excelFile)

    # my_writer = xlwt_writer('whatever.xls')  #make pandas happy 
    # xl_out = StringIO.StringIO()
    # my_writer.path = xl_out  
    # df.to_excel(my_writer)
    # my_writer.save()
    # print base64.b64encode(xl_out.getvalue())

    # print("visit_data: ", visit_data)
    # output = StringIO.StringIO(visit_data)
    # writer = pd.ExcelWriter(output, engine='xlsxwriter')
    # visitIO = io.StringIO(visit_data)
    # writer = pd.ExcelWriter('temp.xlsx', engine='xlsxwriter')
    # writer.book.filename = io
    # pd.DataFrame().to_excel(writer, sheet_name='Sheet1')
    # writer.save()
    # xlsx_data = io.getvalue()
    # print("xlsx_data: ", xlsx_data)

    # df = pd.DataFrame(json.loads(visit_data))
    # filename = io.BytesIO()
    # workbook=xlsxwriter.Workbook(filename,{'in_memory': True})
    # worksheet=workbook.add_worksheet('visits')
    # worksheet.write(1,1,'Exported Visits')
    # print("workbook.get_worksheet_by_name('visits'): ", type(workbook.get_worksheet_by_name('visits')))
    # df = pd.DataFrame(json.loads(visit_data))
    # print("df: ", df)
    # output = make_response(df.to_excel('visit_data.xlsx'))
    # print("output: ", output)
    # output.headers["Content-Disposition"] = "attachment; filename=visit_data.xlsx"
    # output.headers["Content-type"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    
    # print("df: ", df)
    # print("df.to_excel('visit_data.xlsx')", df.to_excel('visit_data.xlsx'))
    # return {}  #df.to_excel('visit_data.xlsx')

    

