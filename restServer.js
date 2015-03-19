'use strict'
var os      = require('os');
var es6shim = require('es6-shim');
var restify = require('restify');
var address = 3080;
var prefix ="/api/";

var server  = restify.createServer();
server.pre(restify.pre.sanitizePath());


var superParams = "";
server.use(restify.bodyParser({
    maxBodySize: 0,
    mapParams: true,
    mapFiles: false,
    overrideParams: false,
    /*multipartHandler: function(part) {
      console.log("multipartHandler", part );
        part.on('data', function(data) {
                console.log("multipartHandler", data );
          superParams = data;
        });
    },
    multipartFileHandler: function(part) {
      console.log("multipartFileHandler", part );
        part.on('data', function(data) {
        });
    },*/
    keepExtensions: true,
    uploadDir: "./uploads",//os.path.absPath(os.tmpdir(),
    multiples: true
 }));


////////////////////
function send(req, res, next) {
   res.send('hello ' + req.params.name);
   return next();
}

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}
/*server.post(prefix+'hello', function create(req, res, next) {
 res.send(201, Math.random().toString(36).substr(3, 8));
 return next();
});
server.put(prefix+'hello', send);
server.head(prefix+'hello/:name', send);
server.del(prefix+'hello/:name', function rm(req, res, next) {
 res.send(204);
 return next();
});*/

var designs = [
  {
  "name":"RobotoMaging",
  "title":"RobotoMaging",
  "description":"such a great design",
  "version": "0.0.2",
  "url":"youmagine.com/designs/authorName/RobotoMaging",
  "authors":[
    {
      "name":"otherGirl",
    "url": "www.mysite.com",
    "email":"gg@bar.baz"
    },
    {
    "name":"otherGuy",
    "url": "???",
    "email":"aGuy@bar.baz"
   }
  ],
  "tags": ["youmagine", "superduperdesign"],
  "licenses":[
    "GPLV3",
    "MIT",
    "CC-BY"
  ],
  "meta":{
    "state":"design",
  },
  //not part of the json
  "documentsUri":"./documents",
  "assembliesUri":"./assemblies",
  "annotations": "./annotations"
  }
];

var assemblies = {
  "RobotoMaging":[
      {
      "children": [
        {
          "iuid": "9D55A0B2-49A4-48BC-8801-D99FDD4124C2",
          "typeUid": "09A65A00-B809-4C8C-AD06-C0F14EC20A6C",
          "typeName": "UM2CableChainChainSegment",
          "name": "UM2CableChainChainSegment0",
          "color": "#FFFFFFFF",
          "pos": [
            -38.57904249959314,
            -44.40294131580217,
            0
          ],
          "rot": [
            0,
            0,
            0
          ],
          "sca": [
            1,
            1,
            1
          ]
        },
      ]
     }
  ]

}


////////////
server.get('/api', function (req, res, next) {
  res.send('welcome to the jam api!');
});


//designs
server.get(prefix+'designs', function (req, res, next) {
  res.send(designs);
});

server.post(prefix+'designs', function (req, res, next) {

  var params = req.params;
  var DEFAULTS = {
    "name":"RobotoMaging",
    "description":"such a great design",
    "version": "0.0.0",
    "licenses":[
    ],
    "meta":{
      "state":"design",
    },
    //not part of json files
    "documentsUri":"./documents",
    "assembliesUri":"./assemblies",
    "annotations": "./annotations"
  };
  var reqFields = ["name", "title"];
  
  if (! reqFields.every(function(x) { return x in params; }) )
  {
    res.send(400, "not all required fields were provided");
    return;
  }
  var name = params.name;
  name = name.replace(" ","");//TODO: validation NO spaces in design names
  params.name = name ;
  
  //CHECK for pre-existing design wih the same name
  var sameNames = designs.filter( function( design ){
    return design.name === name;
  });
  
  sameNames = ( sameNames.length > 0 );
  if( sameNames ){
    res.send(409 , "there is already a design called '"+name+"'");
    return;
  }
  
  var design = Object.assign({}, DEFAULTS, params); 
  console.log("design", design);
  designs.push( design );
  res.send(designs);
});

server.get(prefix+'designs/:name', function (req, res, next) {
  var design = designs.filter( function ( design ){
    return design.name === req.params.name;
  });
  //console.log("sending back this one", design, req.params.name);
  if( design.length === 0 ){
    res.send(404);
  }
  else{res.send(design[0]);}
});

server.patch(prefix+'designs/:_name', function (req, res, next) {
  
  var design = designs.filter( function ( design ){
    return design.name === req.params._name;
  });
  //console.log("sending back this one", design, req.params.name);
  if( design.length === 0 ){
    res.send(404);
    return;
  }
  console.log("PATCHING ", req.params._name,req.params);
  //update design
  var design = design[0];
  var params = req.params;
  //delete params[_name];
  //TODO: actual validation needed
  var validFields = ["name", "title","description","version","authors","tags","licences","meta"];
  for(var pName in params ){
    if( pName == "name") continue;//TODO: not sure: in this case, cannot change design name...
    //format
    var value = params[pName];
    if( pName === "tags" || pName ==="licences" )
    {
      value = JSON.parse(value);
    }
    if( validFields.indexOf(pName) > -1) design[pName] = value; 
  } 
  res.send(design);
});

server.del(prefix+'designs/:name', function (req, res, next) {
  var design = designs.filter( function ( design ){
    return design.name === req.params.name;
  });
  //console.log("sending back this one", design, req.params.name);
  if( design.length === 0 ){
    res.send(404);
    return
  }
  
  //delete design
  var design = design[0];
  designs.splice( designs.indexOf( design ), 1);
  res.send(200);
});



///documents
server.get(prefix+'designs/:name/documents', function (req, res, next) {
  console.log("returning documents of",req.params.name);
  res.send('documents !!');
});

//assemblies
server.get(prefix+'designs/:name/assemblies', function (req, res, next) {
  var designName = req.params.name;
  console.log("returning assemblies of",designName);
  res.send( assemblies[ designName ] );
});

server.post(prefix+'designs/:_name/assemblies', function (req, res, next) {
  var designName = req.params._name;
  console.log("returning assemblies of",designName, req.params, req.files);
  
  //req.files.data.name;
  //req.files.data.path;
  if( req.files ){
    var fs = require("fs");
    var _assemblies = fs.readFileSync( req.files.data.path,'utf8' );
    _assemblies = JSON.parse(_assemblies); 
    assemblies[ designName ] = _assemblies;
  }
  //assemblies.push( 
  res.send( assemblies[ designName ] );
});

server.get(prefix+'designs/:_name/assemblies/:assemblyId', function (req, res, next) {
  var designName = req.params._name;
  var assemblyId = parseInt(req.params.assemblyId);
  console.log("returning assembly of",designName,assemblyId);
  res.send( assemblies[ designName ][assemblyId] );
});



////////////start it up !
server.listen(address, function() {
  console.log('%s listening at %s', server.name, server.url);
});

