var relList;

function onLoadData() {
    var dbReq = createGET_ALL_DBRequest(localStorage.getItem("conn"));
    jQuery.ajaxSetup({async: false});
    var dbJsonObj = executeCommand(dbReq, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    localStorage.dbList = JSON.stringify(dbJsonObj.data);
    if(localStorage.dbName===undefined){
        getData(JSON.parse(localStorage.dbList)[0]);
        navBarDB(JSON.parse(localStorage.dbList));    
    }
    else{
        navBarDB(JSON.parse(localStorage.dbList));
        setData();
    }
}

function getData(dbName) {
    var relReq = createGET_ALL_RELATIONRequest(localStorage.getItem("conn"), dbName);
    jQuery.ajaxSetup({async: false});
    var relJsonObj = executeCommand(relReq, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    relList = relJsonObj.data;
    localStorage.relObj=relList[0];
    localStorage.dbName=dbName;
    setData();
}

function Get_All_Data(db, rel) {
    var req = "{\n"
            + "\"token\" : \""
            + localStorage.getItem("conn")
            + "\",\n" + "\"select\" : {\"cols\":\"*\"}\n"
            + "\"from\" : \""
            + db + "|" + rel
            + "\"}";
    console.log(req);
    jQuery.ajaxSetup({async: false});
    var colJsonObj = executeCommand(req, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    return colJsonObj.data;
}

function setUpdateData(c){
    var e = c.parentElement.closest('tr');
    localStorage.rowNo=e.id;
    var child=e.childNodes;
    var len=child.length;
    var arr=[];
    for(var i=0;i<len;i++){
        arr[i]=child[i].innerText;
    }
    localStorage.values=JSON.stringify(arr);
    window.location.replace("form.html");     
}

function deleteSelectedRow(c){
    var e = c.parentElement.closest('tr');
    var rowID=e.id;
    var formDb=localStorage.dbName;
    var formRel=localStorage.relName;
    var req = "{\n"
            + "\"token\" : \""
            + localStorage.conn
            + "\","
            + "\"dbName\": \""
            + formDb
            + "\","
            + "\"rel\": \""
            + formRel
            + "\","
            + "\"record\": "
            + rowID
            + ","
            + "\"jsonStr\": {}"
            + ",\n" + "\"cmd\" : \"REMOVE\"\n"
            + "}";
    console.log(req);
    jQuery.ajaxSetup({async: false});
    var deleteCol = executeCommand(req, jpdbIML);
    jQuery.ajaxSetup({async: true});
    console.log(deleteCol.status);
    if(deleteCol.status===200){
        $("#"+rowID).closest('tr').remove();
    }
}
