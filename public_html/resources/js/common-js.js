var jpdbIRL = '/api/irl';
var jpdbIML = '/api/iml';
var connToken = "90939056|-31949282519550032|90940645";

var db_rel = {};

function loadNavbar() {
    $("#hrNavBar").load("resources/header.html");
}

function loadFooter() {
    $("#hrFooter").load("resources/footer.html");
}

function listHighlight(hdPageId) {
    if (hdPageId === "employee") {
        $("#hd-hlt-employee").addClass("active");
    }
    if (hdPageId === "hdHome") {
        $("#hd-hlt-home").addClass("active");
    }
}

function loadConn() {
    var conn = localStorage.getItem("conn");
    $("#yo").html(conn);
}

function createGET_ALL_DBRequest(token) {
    var req = "{\n"
            + "\"token\" : \""
            + token
            + "\",\n" + "\"cmd\" : \"GET_ALL_DB\"\n"
            + "}";
    return req;
}

function navBarDB(dbArr) {
    var start = '' +
            '<li class=\'nav-item\'>' +
            '                    <a href=\'dataTable.html\' id=\'hd-hlt-profile\' class=\'nav-link\'>' +
            '                        <i class=\'nav-icon fas fa-user\'></i>' +
            '                        <p>' +
            '                            Database(s)' +
            '                        </p>' +
            '                    </a>' +
            '                </li>' +
            '';
    var change = '';
    console.log(dbArr);
    var dblen = dbArr.length;
    for (var i = 0; i < dblen; i++) {
        var relArr;
        change += '                <li class="nav-item">' +
                '            <a href="#" class="nav-link">' +
                '              <i class="nav-icon fas fa-copy"></i>' +
                '              <p id="rel_name">' + dbArr[i] +
                '                <i class="fas fa-angle-left right"></i>' +
                '                <span class="badge badge-info right"></span>' +
                '              </p>' +
                '            </a>' +
                '            <ul class="nav nav-treeview">';
        var relReq = createGET_ALL_RELATIONRequest(localStorage.getItem("conn"), dbArr[i]);
        jQuery.ajaxSetup({async: false});
        var relJsonObj = executeCommand(relReq, jpdbIRL);
        jQuery.ajaxSetup({async: true});
        //localStorage.setItem('dbName', dbArr[i]);
        relArr = relJsonObj.data;
        var rellen = relArr.length;
        for (var j = 0; j < rellen; j++) {
            db_rel[dbArr[i] + " " + relArr[j].relName] = relArr[j];
            change += '   <li class="nav-item" onclick="setClickedData(this)">' +
                    '                <a href="#" class="nav-link">' +
                    '                  <i class="far fa-circle nav-icon"></i>' +
                    '                  <p>' + relArr[j].relName + '</p>' +
                    '                </a>' +
                    '              </li>' +
                    '';
        }


        change += '</ul>' +
                '</li>' +
                '';
    }
    document.getElementById("db-content").innerHTML = start + change;
    console.log(db_rel);
}




function setData() {
    var db=localStorage.dbName;
    var rel=JSON.parse(localStorage.relObj);
    localStorage.setItem("relName", rel.relName);
    document.getElementById('table_head').innerHTML = "";
    document.getElementById('table_body').innerHTML = "";
    var relName = rel.relName;
    var relSize = rel.record_count;
    jQuery.ajaxSetup({async: false});
    var obj = Get_All_Data(db, relName);
    jQuery.ajaxSetup({async: true});
    console.log(obj);
    var colObj = obj[0].Columns;
    var dataObj = obj[1].Records;
    console.log(dataObj[0][0]);
    var col = "<tr>";
    for (var i = 1; i < colObj.length; i++) {    //here
        col += "<th>" + colObj[i] + "</th>";
    }
    col += "<th>Remove</th>";
    col += "</tr>";
    document.getElementById('table_head').innerHTML = col;
//<span class="oi" data-glyph="delete"></span>
    var rows = "";
    for (var i = 0; i < relSize; i++) {
        var idNo=dataObj[i][0];
        rows += '<tr id="'+idNo+'" style="cursor:pointer;">';
        for (var j = 1; j < colObj.length; j++) {    //here
            rows += '<td onclick="setUpdateData(this)">' + dataObj[i][j] + '</td>';
        }
        rows += '<td onclick="deleteSelectedRow(this)"><img src="resources/img/trash.svg" width="25" height="20"></td>';
        rows += "</tr>";
    }
    document.getElementById('table_body').innerHTML = rows;
}

function setClickedData(e) {
    var relName = e.innerText;
    console.log(relName);
    var parent = e.parentElement.closest('li');
    var dbName = parent.querySelector("#rel_name").innerText;

    var k = dbName + relName;
    var key = k.replace(/[\r\n]+/gm, "");
    var input = key.split(" ");
    var relObj = db_rel[key];
    localStorage.setItem("dbName", dbName);
    localStorage.setItem("relObj",JSON.stringify(relObj));
    window.location.replace("dataTable.html");
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
