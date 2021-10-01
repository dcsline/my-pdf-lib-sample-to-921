var express = require('express');
var fs = require('fs');
var path = require('path');
var favicon = require('serve-favicon');

const client = require('socket.io').listen(3396).sockets
const { PDFDocument } = require('pdf-lib');
const custenv=require('custom-env').env();   //'testing');

//const Swal = require('sweetalert2');
//var index = require('./routes/index');
//var users = require('./routes/users');
//var bkview = require('./routes/bkv');
var strStation = '';
var dstation = '00';
var b_mw = false;
var right_mw = false;
var b_bk = false;
var right_bk = false;
var dbtype = "";
var connStat = false;
var app = express();
var ppath = process.env.PPATH;

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res){
    s='/public/sample.html';
   res.sendFile(path.join(__dirname + s));
});

app.get('/smallF', function(req, res){
  s='/public/fillForm.html';
  res.sendFile(path.join(__dirname + s));
});

module.exports = app;

client.on('connection', socket => {
  
  socket.on('bldPDF', data => {
   
    console.log("bldPDF::"+ actWZ);
    (async () => {
        await fillForm(actWZ);
        socket.emit('resK1', actWZ+'_'+timeStamp());
       })();
});
 
  socket.on('chkPDF', data => {
    let swznr='';
    console.log("clsWART:::" + data.wfile);
    (async () => {
        let bok = await checkPDF(data.wfile);
        console.log("BOK::1::" + bok);    
        socket.emit('resCW', bok);
      
     })();     
    
});    


socket.on('svwz', data => {    
  actWZ = data.selection;
  
  console.log("markWERKZEUG::" + actWZ);
}); 

//##########################################################################

function timeStamp() {
var dt = new Date();
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

return stamp;
}

async function fillForm(propName) {  
   console.log("propName::" + propName);
  var templ= './public/template/TEMPLATE_MAINENANCE_REPORT.pdf';
  const pdfDoc = await PDFDocument.load(fs.readFileSync(templ)); 
  const form = pdfDoc.getForm()

  // Get all fields in the PDF by their names
  const fldPropName = form.getTextField('fieldPropName')
  const fldfldOptMonths = form.getDropdown('fieldOptMonths')
 /*
  const chk1aField = form.getCheckBox('FieldChk1a')
  const fldText1 = form.getTextField('fieldText1')
  const chk2aField = form.getCheckBox('FieldChk2a')
  const fldText2 = form.getTextField('fieldText2')   
  const chk3aField = form.getCheckBox('FieldChk3a')
  const fldText3 = form.getTextField('fieldText3')
  const chk4aField = form.getCheckBox('FieldChk4a')
  const chk4bField = form.getCheckBox('FieldChk4b')
  const fldText4 = form.getTextField('fieldText4')
  const chk5aField = form.getCheckBox('FieldChk5a')
  const fldText5 = form.getTextField('fieldText5')
  const chk6aField = form.getCheckBox('FieldChk6a')
  const chk6bField = form.getCheckBox('FieldChk6b')
  const fldText6 = form.getTextField('fieldText6')
  const chk7aField = form.getCheckBox('FieldChk7a')
  const fldText7 = form.getTextField('fieldText7')
  const chk8aField = form.getCheckBox('FieldChk8a')
  const fldText8 = form.getTextField('fieldText8')
  const chk9aField = form.getCheckBox('FieldChk9a')
  const chk9bField = form.getCheckBox('FieldChk9b')
  const fldText9 = form.getTextField('fieldText9')
  const chk10aField = form.getCheckBox('FieldChk10a')
  const chk10bField = form.getCheckBox('FieldChk10b')
  const fldText10 = form.getTextField('fieldText10')
  const chk11aField = form.getCheckBox('FieldChk11a')
  const chk11bField = form.getCheckBox('FieldChk11b')
  const fldText11 = form.getTextField('fieldText11')
  const chk12aField = form.getCheckBox('FieldChk12a')
  const fldText12 = form.getTextField('fieldText12') 
  .
  .
  .
   */
  const fldOptPers = form.getDropdown('fieldOptPers') 
  const fldMDAT = form.getTextField('fieldMDAT') 
  const fldREMARKS = form.getTextField('fieldREMARKS') 

  fldPropName.setText(propName);  
  fldPropName.enableReadOnly();
  fldREMARKS.enableRequired();    

  const fillpdfBytes = await pdfDoc.save();

  var zstempel = timeStamp();    
  actWZ_Stamp = actWZ + '_' + timeStamp();    
  tempFile='./public/'+ actWZ_Stamp  + '.pdf';   
  fs.writeFileSync('./public/'+ actWZ_Stamp  + '.pdf', fillpdfBytes);  //await pdfDoc.save());

return fillpdfBytes;
}



async function checkPDF(pdfFile) {   //actWZ,vteile,vanzk,vaktzahl) {
  var bfinished = true;
  console.log("FILE::" + pdfFile);    
  const pdfDoc = await PDFDocument.load(fs.readFileSync(ppath + pdfFile+'.pdf')); 
  const form = pdfDoc.getForm()

  // Get all fields in the PDF by their names
  const fldPropName = form.getTextField('fieldPropName')
  const fldfldOptMonths = form.getDropdown('fieldOptMonths')
 /*
  const chk1aField = form.getCheckBox('FieldChk1a')
  const fldText1 = form.getTextField('fieldText1')
  const chk2aField = form.getCheckBox('FieldChk2a')
  const fldText2 = form.getTextField('fieldText2')   
  const chk3aField = form.getCheckBox('FieldChk3a')
  const fldText3 = form.getTextField('fieldText3')
  const chk4aField = form.getCheckBox('FieldChk4a')
  const chk4bField = form.getCheckBox('FieldChk4b')
  const fldText4 = form.getTextField('fieldText4')
  const chk5aField = form.getCheckBox('FieldChk5a')
  const fldText5 = form.getTextField('fieldText5')
  const chk6aField = form.getCheckBox('FieldChk6a')
  const chk6bField = form.getCheckBox('FieldChk6b')
  const fldText6 = form.getTextField('fieldText6')
  const chk7aField = form.getCheckBox('FieldChk7a')
  const fldText7 = form.getTextField('fieldText7')
  const chk8aField = form.getCheckBox('FieldChk8a')
  const fldText8 = form.getTextField('fieldText8')
  const chk9aField = form.getCheckBox('FieldChk9a')
  const chk9bField = form.getCheckBox('FieldChk9b')
  const fldText9 = form.getTextField('fieldText9')
  const chk10aField = form.getCheckBox('FieldChk10a')
  const chk10bField = form.getCheckBox('FieldChk10b')
  const fldText10 = form.getTextField('fieldText10')
  const chk11aField = form.getCheckBox('FieldChk11a')
  const chk11bField = form.getCheckBox('FieldChk11b')
  const fldText11 = form.getTextField('fieldText11')
  const chk12aField = form.getCheckBox('FieldChk12a')
  const fldText12 = form.getTextField('fieldText12') 
  .
  .
  .
   */
  const fldOptPers = form.getDropdown('fieldOptPers') 
  const fldMDAT = form.getTextField('fieldMDAT') 
  const fldREMARKS = form.getTextField('fieldREMARKS') 


    console.log("OptPers:::" + fldOptPers.getSelected());
    if(fldOptPers.getSelected()!='') {
        fldOptPers.disableSelectOnClick();  //.enableReadOnly();
        fldOptPers.disableEditing();  
    } else {
        return false;
    }  
 
    
    if(bfinished) {
        const fillpdfBytes = await pdfDoc.save();
       await fs.writeFileSync(ppath+'completed/' + pdfFile + '.pdf', fillpdfBytes);  
       await fs.unlink(ppath + pdfFile + '.pdf', (err) => {
        if (err) {
            console.log("failed to delete:"+err);
        } else {
            console.log('successfully deleted::::' + ppath + pdfFile + '.pdf');       
            console.log("actWZ_Stamp:::" + actWZ_Stamp);
            console.log("tempFile:::"+ tempFile);            
        }
         });   
        await fs.unlink(tempFile, (err) => {
            if (err) {
                console.log("failed to delete:"+err);
            } else {
                console.log('successfully deleted::::' + ppath + pdfFile + '.pdf');       
                tempFile="";
            }       
        });
    }

return bfinished;
}

  //  connection.end()
})