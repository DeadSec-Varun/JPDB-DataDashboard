var formDb="";
var formRel="";
//$("#empid").focus();
//var valArr=[];
var dbCol=[];


/*
 "data": [
        {"colName": "empAllowance", "colType": "Double" },
        {"colName": "empBasic", "colType": "Long" },
        {"colName": "empDed", "colType": "Double" },
        {"colName": "empDsg", "colType": "String" },
        {"colName": "empID", "colType": "String"  },
        {"colName": "empName", "colType": "String"},
        {"colName": "deptID", "colType": "String"},
    ]
*/

function onLoadFormData(){
    navBarDB(JSON.parse(localStorage.dbList));
    formDb=localStorage.dbName;
    formRel=localStorage.relName;
    var valArr=JSON.parse(localStorage.values);
    setFormCol();
    setFormData(valArr);
}

function setFormCol(){
    GET_ALL_COL();
    var HTMLtext="";
    console.log(dbCol);
    var len=dbCol.length;
    for(var i=0;i<len;i++){
        var inputName=dbCol[i].colName;
        var inputType=dbCol[i].colType;
        
        HTMLtext+='' + 
'   <div class=\'form-group\'>' + 
'   <label>'+inputName+' :</label>' + 
'   <input type=\''+inputType+'\' id=\''+inputName+'\' class=\'form-control\'>' + 
'   </div>' + 
'';       
    }
    document.getElementById("form-js").innerHTML=HTMLtext;
}

function setFormData(valArr){
    var len=dbCol.length;
    for(var i=len-1;i>=0;i--){
        var id="#"+dbCol[i].colName;
        $(id).val(valArr[i]);
        $(id).prop("disabled",true);
    }
}

function GET_ALL_COL(){
    var req = "{\n"
            + "\"token\" : \""
            + localStorage.conn
            + "\","
            + "\"dbName\": \""
            + formDb
            + "\","
            + "\"rel\": \""
            + formRel
            + "\",\n" + "\"cmd\" : \"GET_ALL_COL\"\n"
            + "}";
    console.log(req);
    jQuery.ajaxSetup({async: false});
    var dbJsonCol = executeCommand(req, jpdbIRL);
    jQuery.ajaxSetup({async: true});
    console.log(dbJsonCol);
    dbCol=dbJsonCol.data;
}




///////////////////////////////////////////////////////////



function saveRecordNo2LS(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("recno",data.rec_no);
}

//*******************//

function initEmpForm(){
    localStorage.removeItem("first_rec");
    localStorage.removeItem("last_rec");
    localStorage.removeItem("rec_no");
    console.log("init_form() done");
}

function newData(){
    var len=dbCol.length;
    for(var i=len-1;i>=0;i--){
        var id="#"+dbCol[i].colName;
        $(id).val("");
    }
    disableForm(false);
    $("#empid").focus();
    disableNav(true);
    disableCtrl(true);
    $("#save").prop("disabled",false);
    $("#reset").prop("disabled",false);    
}

//*******************//

function saveData(){
    var jsonStrObj=validateData();
    if(jsonStrObj===""){
        return "";
    }
    var putRequest=createPUTRequest(localStorage.conn,jsonStrObj,formDb,formRel);
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommand(putRequest,jpdbIML);
    jQuery.ajaxSetup({async:true});
    setLastRecord(resJsonObj);
    setRecentRecord(resJsonObj);
    resetData();    
}

//*******************//

function editData(){
    disableForm(false);
    //var id="#"+dbCol[0].colName;
    //$(id).prop("disabled",true);
    //id="#"+dbCol[1].colName;
    //$(id).focus();
    disableNav(true);
    disableCtrl(true);
    $("#change").prop("disabled",false);
    $("#reset").prop("disabled",false);
}

//*******************//

function changeData(){
    jsonChange=validateData();
    var id=localStorage.rowNo;   
    var updateRequest=createUPDATERecordRequest(localStorage.conn,jsonChange,formDb,formRel,id);
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommandAtGivenBaseUrl(updateRequest,baseUrl,jpdbIML);
    jQuery.ajaxSetup({async:true});
    console.log(updateRequest);
    console.log(resJsonObj);
    localStorage.setItem("rec_no",id);
    resetData();   
    //$("#empid").focus();
    $("#edit").focus();
}

//*******************//

function resetData(){
    disableCtrl(true);
    disableNav(false);
    
    var getRequest=createGET_BY_RECORDRequest(localStorage.conn,formDb,formRel,localStorage.getItem("rec_no"));
    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getRequest,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    fillData(result);
    
    $("#new").prop("disabled",false);
    //if()
}

//*******************//

function validateData(){
    var dataValues=[];
    var len=dbCol.length;
    for(var i=0;i<len;i++){
        var id="#"+dbCol[i].colName;
        dataValues[i]=$(id).val();
        if(dataValues[i]===""){
        alert(id+" Missing");
        $(id).focus()
        return "";
    }
    }
    /*
    deduct=$("#deduct").val();
    
    if(deduct===""){
        alert("Deduct Missing");
        $("#deduct").focus()
        return "";
    }
    */
    var jsonStrObj={};
    for(var i=0;i<len;i++){
        jsonStrObj[dbCol[i].colName]=dataValues[i];
    }
    return JSON.stringify(jsonStrObj);
}

//*******************//

function getEmpIdJsonStr(){
    var empid=$("#empid").val();
    var jsonStr={
        id:empid
    };
    return JSON.stringify(jsonStr);
}

//*******************//

function getEmp(){
    var empIdJsonStr=getEmpIdJsonStr();
    getData(empIdJsonStr);
}

function getData(empIdJsonStr){
    var putReqStr=createGET_BY_KEYRequest(connToken,formDb,formRel,empIdJsonStr);
    jQuery.ajaxSetup({async:false});
    var resJsonObj=executeCommandAtGivenBaseUrl(putReqStr,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    if(resJsonObj.status===400){
        $("#save").prop("disabled",false);
        $("#reset").prop("disabled",false);
        $("#empname").focus();        
    }
    else if(resJsonObj.status===200){
        $("#empid").prop("disabled",true);
        fillData(resJsonObj);
        $("#change").prop("disabled",false);
        $("#reset").prop("disabled",false);
        $("#empname").focus();
    }
}

//*******************//

function fillData(jsonObj){
    if(jsonObj.status===400){
        console.log("status failed");
        return;
    }
    var record=(JSON.parse(jsonObj.data)).record;
    setRecentRecord(jsonObj);
    var len=dbCol.length;
    console.log(record);
    for(var i=0;i<len;i++){
        var id=dbCol[i].colName;
        $("#"+id).val(record[id]);
    //$("#empid").val(record.id);
    }
    disableNav(false);
    disableForm(true);
    $("#save").prop("disabled",true);
    $("#change").prop("disabled",true);
    $("#reset").prop("disabled",true);
    $("#new").prop("disabled",false);
    $("#edit").prop("disabled",false);
    
    if(localStorage.getItem("rec_no")===localStorage.getItem("first_rec")){
        $("#prev").prop("disabled",true);
        $("#first").prop("disabled",true);
    }
    if(localStorage.getItem("rec_no")===localStorage.getItem("last_no")){
        $("#next").prop("disabled",true);
        $("#last").prop("disabled",true);        
    }
}

/////////////////////////////////////////////

function getFirst(){
    var getFirstRequest=createFIRST_RECORDRequest(localStorage.conn,formDb,formRel);
    
    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getFirstRequest,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    
    fillData(result);
    setFirstRecord(result);
//    $("#empid").prop("disabled",true);
    $("#first").prop("disabled",true);
    $("#prev").prop("disabled",true);
    $("#save").prop("disabled",true);
    $("#next").prop("disabled",false);
    $("#last").prop("disabled",false);
}

function getPrev(){
    var rec=localStorage.getItem("rec_no");
    var getPrevRequest=createPREV_RECORDRequest(localStorage.conn,formDb,formRel,rec);
    jQuery.ajaxSetup({async:false});
    var result=executeRequest=executeCommandAtGivenBaseUrl(getPrevRequest,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:false});
    fillData(result);
    if(result===localStorage.getItem("first_rec")){
        $("#first").prop("disabled",true);
        $("#prev").prop("disabled",true);
    }
    $("#save").prop("disabled",true);
}

function getNext(){
    var rec=localStorage.getItem("rec_no");
    var getNextRequest=createNEXT_RECORDRequest(localStorage.conn,formDb,formRel,rec);
    jQuery.ajaxSetup({async:false});
    var result=executeRequest=executeCommandAtGivenBaseUrl(getNextRequest,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:false});
    fillData(result);
    //var r=localStorage.getItem("rec_no");
    if(result===localStorage.getItem("last_rec")){
        $("#last").prop("disabled",true);
        $("#next").prop("disabled",true);
    }
    $("#save").prop("disabled",true);
}

function getLast(){
    var getLastRequest=createLAST_RECORDRequest(localStorage.conn,formDb,formRel);
    jQuery.ajaxSetup({async:false});
    var result=executeCommandAtGivenBaseUrl(getLastRequest,baseUrl,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    
    setLastRecord(result);
    fillData(result);
    $("#first").prop("disabled",false);
    $("#prev").prop("disabled",false);
    $("#save").prop("disabled",true);
    $("#next").prop("disabled",true);
    $("#last").prop("disabled",true);

}

function setRecentRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("rec_no",data.rec_no);
}

function setFirstRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("first_no",data.rec_no);
}

function setLastRecord(jsonObj){
    var data=JSON.parse(jsonObj.data);
    localStorage.setItem("last_no",data.rec_no);
}

function setRecords(){
    if(localStorage.getItem("first_rec")===undefined){
        localStorage.setItem("first_rec","0");
    }
    if(localStorage.getItem("last_rec")===undefined){
        localStorage.setItem("last_rec","0");
    }
}

function disableNav(ctrl){
    $("#first").prop("disabled",ctrl);
    $("#prev").prop("disabled",ctrl);
    $("#next").prop("disabled",ctrl);
    $("#last").prop("disabled",ctrl);
}

function disableCtrl(ctrl){
    $("#new").prop("disabled",ctrl);
    $("#save").prop("disabled",ctrl);
    $("#edit").prop("disabled",ctrl);
    $("#change").prop("disabled",ctrl);
    $("#reset").prop("disabled",ctrl);    
}

function disableForm(ctrl){
    var len=dbCol.length;
    for(var i=len-1;i>=0;i--){
        var id="#"+dbCol[i].colName;
        $(id).prop("disabled",ctrl);
    }
}

function checkForNoOrOneRecord(){
    if(localStorage.getItem("first_rec")==="0"){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled",false);
        return;
    }
    if(localStorage.getItem("first_rec")===localStorage.getItem("last_rec")){
        disableForm(true);
        disableNav(true);
        disableCtrl(true);
        $("#new").prop("disabled",false);
        $("#edit").prop("disabled",false);
        return;
    }
}

initEmpForm();
//getFirst();
//getLast();
//setRecords();
//checkForNoOrOneRecord();
$("#first").prop("disabled",false);
//$("#prev").prop("disabled",false);
$("#last").prop("disabled",false);

