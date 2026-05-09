# Project_GitOps_App_Repo

this is a repo for the app source codes to demo the gitops practices.
The app is a simple frontend + backend

requirements:

frontend
website shows title: GitOps Demo App - <version>
    the <version> value retrieved from the rest api
page layout: simple, only show the title centrally; green backgroud

backend:
    read the version value from env var APP_VERSION, default is 0.1.0
    pass the version to frontend

---

Module backend
tech stack: Spring boot with gradle
phases:
1. create empty spring boot project, 
   - name: GitOpsDemoApp
   - path: backend
   - checklist
2. create restful api
   - build api
   - hard code version
   - manuall test, postmane?
   - checklist
3. define reading version value from env var
   - test cases
   - checklist
4. create dockerfile with multiple stages
   - test
   - checklist
 
Module frontend
tech stack react
phases:
1. create empry react project
   - name: gitOpsDemoApp
   - path: frontend
   - checklist
2. build web page layout
   - title + backgroud
   - checklist
3. render version by a harcode
   - checklist
4. connect with backend
   - docker compose
   - checklist

