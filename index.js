var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

const client = require('socket.io').listen(3366).sockets
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const custenv=require('custom-env').env();   //'testing');
const log = require('log-to-file');

var dbtype = "";
var actWZ = "";
var actWZ_Stamp = "";
var app = express();
//const CONFIG = require('./config/config');
//console.log("Environment:", CONFIG.app);
//console.log("HOST>>"+process.env.DB_HOST);
var ppath = process.env.PPATH;

app.use(express.static(path.join(__dirname, 'public')));



app.get('/nopr', function(req, res){
   // console.log("GG::" + req.body.username);
 // res.render('error',{'message' :req.flash('message')});
       s='/public/error/501.html';
   res.sendFile(path.join(__dirname + s));
});

app.get('/smallF', function(req, res){
  //  console.log("GG::" + req.body.username);
 // res.render('login/index',{'message' :req.flash('message')});
   //  s='/public/error/500.html';
 //20210326   
    s='/public/fillForm.html';
 // test  s='/public/wzwhit/klDevelope.html';
    dbtype="MW";
   res.sendFile(path.join(__dirname + s));
});

app.get('/smallM', function(req, res){
  //  console.log("GG::" + req.body.username);
 // res.render('login/index',{'message' :req.flash('message')});
   //  s='/public/error/500.html';
    s='/public/wzwhit/klWZWP.html';
    dbtype="MW";
   res.sendFile(path.join(__dirname + s));
});



app.get('/', function(req, res){
  //  console.log("GG::" + req.body.username);
 // res.render('login/index',{'message' :req.flash('message')});
   //  s='/public/error/500.html';
    s='/public/index.html';
    
   res.sendFile(path.join(__dirname + s));
});



module.exports = app;
//---------------------------------------------------------------------------------------




//---------------------------------------------------------------------------------------  
client.on('connection', socket => {

     
//############################## F I N D 2 ########################################    

  
    socket.on('bldPDF', data => {
         (async () => {
             var zstamp = timeStamp().substring(0,8);
            var qupd="update guest.wzwart set startdat='" + zstamp +"' where wznr = '" + actWZ +"' stat+0=1"; 
            var wupd = await msQRY(qupd,0); 
            console.log("bldPDF-UPD:::" + qupd); 
           })();   
         (async () => {
            var q="select wznr, teile,anzk,aktzahl,ddb,dr,dz,wzgew,einh,formh,formb from guest.wzwart where stat=1 and wznr = '" + actWZ +"'";   //'W48332F1'";
            console.log("bldPDF_für WZ:::" + actWZ); 
            var rest = await msQRY(q,0);
             console.dir(rest); //.anzk);
             await fillForm(rest, data.form);
             console.log("Form is filled...");
             socket.emit('resK1', actWZ_Stamp);
            //console.log("LL:" + obj.length);
            })();
    });
    

// ###########################  c l s W A R T  ############################################  
   //  socket.on('clsWART', data => {
    socket.on('chkPDF', data => {
         let swznr='';
         console.log("clsWART:::" + data.wfile);
         (async () => {
                   let bok = await checkPDF(data.wfile);
                  //if(!bok) console.log("PDF noch unvollständig");
                  console.log("BOK::1::" + bok);    
                  socket.emit('resCW', bok);
           
          })();     
         
     });    
 
//##########################################################################

    
async function run_test1() {
  // Create a new document and add a new page
  const doc = await PDFDocument.create();
  const page = doc.addPage();

  // Load the image and store it as a Node.js buffer in memory
  let img = fs.readFileSync('./Magna-Logo-LR20.png');
  img = await doc.embedPng(img);

  // Draw the image on the center of the page
  const { width, height } = img.scale(1);
  page.drawImage(img, {
    x: page.getWidth() / 2 - width / 2,
    y: page.getHeight() / 2 - height / 2
  });

  // Write the PDF to a file
  fs.writeFileSync('./test.pdf', await doc.save());
}
    
async function run(act) {
   const pdfTemplate = await PDFDocument.load(fs.readFileSync(__dirname+'\\public\\template\\template_klWZW.pdf')); 
  
    const form = pdfTemplate.getForm()

      // Get all fields in the PDF by their names
      const fldWZNR = form.getTextField('fieldWZNR')
      const fldArtNR = form.getTextField('fieldArtNR')
      const fldAktSchuss = form.getTextField('fieldAktSchuss')
       fldWZNR.setText(act[1]);  //'W44444')
      fldWZNR.enableReadOnly()
        fldArtNR.setText(act[3]);
        fldAktSchuss.setText('12345');  //act[7].toString());
        fldAktSchuss.enableReadOnly();
      const pdfDoc = await PDFDocument.create();

  // Add the cover to the new doc
  const [templPage] = await pdfDoc.copyPages(pdfTemplate, [0]);
  pdfDoc.addPage(templPage);
        fs.writeFileSync('./neu.pdf', await pdfDoc.save());
}

// ###########################  svwz  ############################################     
    socket.on('svwz', data => {    
             actWZ = data.selection;
             actZAHL = data.iz;
             console.log("markWERKZEUG::" + actWZ);
         }); 
    
   function timeStamp() {
              var dt = new Date();
    //var dt1=d.yyyymmdd();    
   // Date.prototype.yyyymmdd = function() {
   var yyyy = dt.getFullYear();
   var mm = dt.getMonth() < 9 ? "0" + (dt.getMonth() + 1) : (dt.getMonth() + 1); // getMonth() is zero-based
   var dd  = dt.getDate() < 10 ? "0" + dt.getDate() : dt.getDate();
   var hh = dt.getHours(); 
   if (hh < 10)  hh = '0' + hh;           
   var min = dt.getMinutes();  
   if (min < 10)  min = '0' + min;   
   var ss = dt.getSeconds();      
   if (ss < 10)  ss = '0' + ss;   
    var stamp = "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
    //var stamp = yyyy+mm+dd+hh+min+ss;  
       console.log("ZSTEMPEL::::"+ stamp);
       return stamp;
    }
    
    function checkNum(nval){
            if(nval>0) {
                return nval
            } else {
                return null
            }
        }
        
        function checkChr(nval){
            if(nval>'') {
                return nval.toString()
            } else {
                return ''
            }
        }
    
    
    
})