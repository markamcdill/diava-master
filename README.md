# DIAVA

Software
* Angular 11.2.1
* Angular Material 11.2.3
* Elasticsearch 5
* Python 2.7.1
* Fontawesome 5.15.2

(U) project links
* Jenkins: https://jenkins.code.dicelab.net/job/CIO2D/job/DIAVA/
* Confluence: https://confluence.code.dicelab.net/display/DIAVA/CIO2D-DIAVA
* Jira: https://jira.code.dicelab.net/projects/DIAVA/summary
* Artifactory: https://artifactory.code.dicelab.net/ui/packages
    * Service Account:  svc-cio2d-diava-dev
    * Namespace:  cio2d-diava/**
                  cio2d/diava/**
* SonarQube: https://sonarqube.code.dicelab.net/
    * Project Name:  cio2d-diava
    * Project Key Pattern: cio2d-diava:.* 

NOTES
1. Elasticsearch server on UC2S is: http://10.12.163.108:9200
2. Flask Location: http://localhost/
3. Angular Location: http://localhost:4200/
4. Kibana Location: http://localhost:5601
5. Angular is set by default to listen to http://0.0.0.0:5000 for Python service calls. to overwrite this, change the "target" in the proxy.conf.json
6. @angular cdk version needed is: npm install @angular/cdk@11.2.3

INITIAL SETUP FOR DEVELOPMENT
1. Setup your FIDOS instance
    - UC2S FIDOS setup instructions: https://confluence.code.dicelab.net/display/CIO2/Create+a+Dev+%28U-FIDOS%29+Environment
2. Create a folder "workspace" in your home directory and git clone the project into it. once cloned, move the "workspace" folder to the root of your instance.  so the project should be located at: /workspace/diava
3. Run the setup.sh script to install all dependent python modules
4. Copy the diava.conf file to /etc/httpd/conf.d/
5. In a terminal, go to [working directory/application]/development/web-app/ and run npm install
    - if errors are for missing node modules, then download them OUTSIDE the application and copy to the node_modules folder in the app
6. Install Kibana 5.x
    - On UC2S can be downloaded from s3 diava bucket
    - In [kibana folder]/config/kibana.yml uncomment elasticsearch.url and change to elasticsearch.url: "http://10.12.163.108:9200"


TO RUN THE APPLICATION FOR DEVELOPMENT
The application runs on Apache using Python Flask and Angular.  For development, python and Angular will run on different servers. THIS IS ONLY FOR DEVELOPMENT!
1. Start Apache: sudo apachectl start
    - python services are located here: http://localhost/diava/
    - apache logs are located here: sudo tail -f /var/log/httpd/error_log
2. Start Aangular: ../development/web_app/nmp start
    - Angular application is located here: http://localhost:4200/
3. If needed, start kibana
    - Web Console located here: http://localhost:5601


TO BUILD and RUN THE APPLICATION for RELEASE
1. Make sure angular.json "outputPath" is set to "../../app/web-app"
2. From development/web-app: ng build --aot=false --deploy-url "../web-app/"


TROUBLESHOOTING

1. To get the location of the mod_wsgi module: mod_wsgi-express module-config


************************************************
PYTHON SETUP
1. Run the installAnaconda.sh script to install Anaconda3 with Python 3.7.4
    - For Python 3, create a conda env: conda create -n DIAVA flask
    - For Python 2 to support DIAVA 1.0: conda create -n DIAVA python=2.7 flask
    - then start up the environment with: conda activate DIAVA
    - check the version by running: python --version
    - list conda env: conda env list
    - deactivate a conda env: conda deactivate
2. Run install
    - pip install -r requirements.txt (add --user if getting permission error)
2. Make sure Python module flask_cors is in the requirements.txt and has been installed. This allows for cross-site rest server calls
3. Make sure app.py routing is using send_from_directory:
    @app.route('/<path:path>', methods=['GET'])
    def static_proxy(path):
        return send_from_directory('web-app/', path)

    @app.route('/')
    def root(): return send_from_directory('web-app/', 'index.html')

ANGULAR FRONTEND SETUP
1. Run the setup.sh script (Ang7_env_setup)
2. Create directory 'development'
    - if ng command not recognized, run: npm link @angular/cli
3. Inside 'development' run the angular CLI create project:
    - ng new web-app --routing
4. add "module":"esnext", to the tsconfif.app.json of the project under "compilerOptions"
5. CD to web-app and start the NPM server: npm start
6. Add bootstrap, jquery and fontawesome: npm install bootstrap, npm install jquery, npm install font-awesome
  - may need to run from web-app folder that contains node_modules folder
  - add node_modules path to css and js to angular.json

NOTES:
* Need npm install @ng-bootstrap/ng-bootstrap@2.0.0


RUN THE APPLICATION
1. cd to the directory: [project]/development/web-app
2. run: npm start
3. access http locally at: http://localhost:4200
4. The application is set by default to listen to http://0.0.0.0:5000 for service calls. to overwrite this, change the "target" in the proxy.conf.json

DEPLOY THE FRONTEND:
1. Make sure angular.json "outputPath" is set to "../../app/web-app"
2. From development/web-app: ng build --aot=false --deploy-url "../web-app/"

## Material Design for Angular Installation

Use the Angular Material getting started guide [https://material.angular.io/guide/getting-started](https://material.angular.io/guide/getting-started)

By default Angular Material adds external links to your project that point to Material Icons. Material icons must be installed internal the application (locally). Folow steps below...
1. Delete the two lines listed below from the *index.html*
```bash
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```
2. Install Material design locally at development/web-app/
```bash
npm install material-design-icons --save
```
3. Add the path below to point to the node_modules/material-design-icons in the styles section of *angular.json* file
```bash
"styles": [
              "node_modules/material-design-icons/iconfont/material-icons.css",
              "./node_modules/@angular/material/prebuilt-themes/deeppurple-amber.css",
              "src/styles.scss"
            ],
```
4. Start angular server

## User Roles
* read-only
* administrator
* maintainer

## Elasticsearch

Elasticsearch Structure
```
- index
    - diava
    - diava_util
- doc_type
    - diava/visits
    - diava_util/users
    - diava_util/locations
    - diava_util/settings
```
