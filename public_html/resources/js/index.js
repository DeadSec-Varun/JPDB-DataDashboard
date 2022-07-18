function getConnection(){
    var conn=$("#connToken").val();
    var dbReq=createGET_ALL_DBRequest(conn);
    jQuery.ajaxSetup({async:false});
    var dbJsonObj=executeCommand(dbReq,jpdbIRL);
    jQuery.ajaxSetup({async:true});
    if(dbJsonObj.status===200){
    localStorage.setItem("conn",conn);
    window.location.replace("dataTable.html");     
    }
    else{
        alert("Invalid Connection Token");
        $("#connToken").val("");
    }
}



function validateConnection(conn){
    
}