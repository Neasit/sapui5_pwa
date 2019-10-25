# Intro

Create web application based on SAP UI5 framework with offline mode using service worker API

This is example project: how to create offline application based on SAP UI5 with PWA tools (Service worker)

> UI5 version have to be at least 1.52 (will work without oData), starting with 1.56 - can be create/work with oData clien model

## How to use

-   clone project
    
-   SAP UI5 core is needed (can be downloaded from [link](https://tools.hana.ondemand.com/#sapui5))

-   change path to UI5 core in "gruntConfig.json" -> setting "ui5Path"
    
-   build project using predefined grunt tasks and run test server
    

> npm install
> grunt
> npm run dev-serve

-   web app will be availabe on http://localhost:3050/Index.html

## Use case

User can scan equipments (barcode like '\<material\>\*SN\*\<UII>') and store it locally in browser in offline mode -> then upload it to SAP (online)