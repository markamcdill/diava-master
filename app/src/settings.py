import json
import uuid

from .dao import settingsDAO as sDAO 


def getSettings(user_dn):
    appSettings = sDAO.getSettings(user_dn)
    if len(appSettings) == 0: # no settings in ES (first time site is accessed); return these default settings then put in ES
        appSettings = [{ # default settings if none in ES; have to return an array for angular
          "settings_id": str(uuid.uuid4()),
          "settings_app_alert_message": " ",
          "settings_app_alert_end_dt": '1900-01-01T06:00:00.000Z',
          "settings_app_alert_start_dt": '1900-01-01T06:00:00.000Z',
          "settings_app_idle_time": 600,
          "settings_app_timeout_duration": 50,
          "settings_app_url": "http://localhost:4200/",
          "settings_app_welcome_message": "Welcome to DiAVA. Planning to go TDY to a combatant command? A Travel Notification is required before you travel. Notifications must be submitted 10 days prior to visiting a DIA office.",
          "settings_mail_sender": "DIAVA@gmail.com"
        }]
        editSettings(user_dn, appSettings[0]) # put in ES; as a dictionary (not an array)
        sDAO.refreshUtil() # MUST REFRESH THE INDEX IMMEDIATELY! the app calls getSettings twice; index must be refreshed by second call so the query finds the settings in ES and doesn't put the defaults in twice

    return appSettings

def editSettings(user_dn, settings):
    # the settings doc_type is a single record (always/only); the first record will not have an ID; create it here, but never again
    if "settings_id" not in settings:
        settings["settings_id"] = str(uuid.uuid4())
    return sDAO.editSettings(user_dn, settings)
