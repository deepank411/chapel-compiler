var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');
var multiparty = require('multiparty');
var fs = require("fs");

var app = express();

app.set('views', __dirname + '/');
app.engine('html', require('consolidate').handlebars);
app.set('view engine', 'html');

//compilex
var compiler = require('compilex');
var option = {stats : true};
compiler.init(option);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/' , function (req , res ) {
   res.sendFile( __dirname + "/index.html");
});

app.post('/compilecode', function(req, res){
   var file_code;
   var formfield_code;
   var input;
   var input_radio;
   var code;

   var form = new multiparty.Form();
   form.parse(req, function(err, fields, files) {

      formfield_code = fields['code'][0];
      console.log(formfield_code);

      input = fields['input'][0];
      console.log(input);

      if(fields['inputRadio'] != undefined){
         input_radio = fields['inputRadio'][0];
         console.log(input_radio);
      }

      local_path = files['chplCode'][0]['path']
      console.log(local_path);

      // blocking code
      file_code = fs.readFileSync(local_path, 'UTF-8');
      console.log(file_code);

      if(file_code)
         code = file_code;
      else
         code = formfield_code;

      if(input_radio === "true"){
         var envData = { OS : "linux" , cmd : "chpl"};
         compiler.compileCHPLWithInput(envData , code ,input , function (data) {
            if(data.error)
               res.render("result.html", {output: data.error});
            else
               res.render("result.html", {output: data.output});
         });
      }
      else{
         var envData = { OS : "linux" , cmd : "chpl"};
         compiler.compileCHPL(envData , code , function (data) {
            if(data.error)
               res.render("result.html", {output: data.error});
            else
               res.render("result.html", {output: data.output});
         });
      }

   });
})

module.exports = app;
