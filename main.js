var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require("./classMysql-v2");
var cors = require('cors');

var config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
var object_define = JSON.parse(fs.readFileSync('element.json', 'utf8'));

var strig = require("./classStrigger");
var aStrig = [];

var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
}));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get("/", function(req, res) {
    res.render("index", {
        mainPage: "index",

    });
});
var oControl = {};
app.post("/check", function(req, res){
    oControl = {};
    console.log(req.body);
    console.log(aStrig);
    for(i in aStrig){
        if(aStrig[i].idsensor == req.body.idsensor){
            if(req.body.data[aStrig[i].name_sensor] != undefined){
                console.log("CHECK:", req.body.data[aStrig[i].name_sensor])
                oControl[aStrig[i].note] = aStrig[i].strig.uploadData(parseFloat(req.body.data[aStrig[i].name_sensor]));
            } else {
                console.log("CHECK-2:", aStrig[i].name_sensor)
                console.log(req.body.data);
            }

        } else {
            console.log("NOTHING")
        }
    }
    res.send({
        status: "OK",
        code: req.body.code,
        data: oControl
    })
})


app.get("/object", function(req, res){
    res.send({
        status: "ERROR",
        data: "CANNOT FOUND OBJECT, YOU CAN DEFINE BEFORE USING",
    })
})
app.get("/object/:obj", function(req, res) {
    if((object_define.object[req.params.obj] == undefined)||(req.params.obj == undefined)) {
        res.send({
            status: "ERROR",
            data: "CANNOT FOUND OBJECT, YOU CAN DEFINE BEFORE USING",
        });
    } else {
        res.render("element", {
            mainPage: req.params.obj,
            form: object_define.object[req.params.obj].element,
            title: object_define.object[req.params.obj].element
        });
    }
});

app.post("/insert/:table", function(req, res){
    var a = req.body;
    mysql.connect2query(object_define.database[object_define.object[req.params.table].database], mysql.object2query(a, a, req.params.table)).then((a)=>{
        res.render("back")
    }).catch((e)=>{
        res.send({
            status: "ERROR",
            data: e
        })
    })
});

app.post("/insertid/:table", function(req, res){
    var a = req.body;
    mysql.connect2query(object_define.database[object_define.object[req.params.table].database], mysql.object2query(a, a, req.params.table)).then((a)=>{
        res.send({
            status: "OK",
            data: {
                id: a.insertId
            }
        })
    }).catch((e)=>{
        console.log(e)
        res.send({
            status: "ERROR",
            data: e
        })
    })
});

app.get("/table", function(req, res){
    var a = req.query;
    console.log(a.table);
    if(a.c1 == undefined){
        mysql.connect2query(object_define.database[object_define.object[a.table].database], "select * from " + a.table).then((a)=>{
            res.send({
                status: "OK", 
                data: a
            });
        }).catch((e)=>{
            console.log(e);
            res.send({
                status: "ERROR",
                error: e.code
            })
        })
    } else {
        mysql.connect2query(object_define.database[object_define.object[a.table].database], "select * from " + a.table + " where " + a.c1 + "='" + a.v1 + "'").then((a)=>{
            res.send({
                status: "OK", 
                data: a
            });
        }).catch((e)=>{
            console.log(e);
            res.send({
                status: "ERROR",
                error: e.code
            })
        })
    }
    
})

app.put("/update", function(req, res) {
    var a = req.body;
    console.log("HERE ==> ", a);
    mysql.connect2query(object_define.database[object_define.object[a.table].database], mysql.update2query("id" + a.table, a.data["id" + a.table], a.table, a.data)).then((a)=>{
        console.log(a);
        res.send({
            status: "OK",
            data: ""
        })
        begin();
    }).catch((e)=>{
        console.log(e)
        res.send({
            status: "ERROR",
            data: ""
        })
    })
})

app.get("/delete", function(req, res) {
    var a = req.query;
    console.log(a);
    mysql.connect2query(object_define.database[object_define.object[a.table].database], mysql.delete2query("id" + a.table, a.id, a.table)).then((a)=>{
        res.send({
            status: "OK",
            data: ""
        })
    }).catch((e)=>{
        res.send({
            status: "ERROR",
            data: "e"
        })
    })
});

function begin(){
    aStrig = [];
    mysql.connect2query(object_define.database[object_define.object["xtek_support"].database], "select * from xtek_support").then((a)=>{
        for(i in a){
            aStrig.push({
                idsensor: a[i].idsensor,
                strig: new strig.Strigger(),
                name_sensor: a[i].name_sensor, 
                note: a[i].note
            });
            aStrig[aStrig.length - 1].strig.setValueUp(parseFloat(a[i].max));
            aStrig[aStrig.length - 1].strig.setValueDown(parseFloat(a[i].min));
        }
        console.log(aStrig);
    }).catch((e)=>{

    })
}

begin();
app.listen(config.port);
