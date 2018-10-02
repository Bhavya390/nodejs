var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
var db = require('../dbconnection.js');
var ArrayList = require('ArrayList');
var utf8 = require("utf8")
var accessoryHelper = require('../helpers/accessory');
db.connect();

/* GET /mail */
router.get('/sendBirthdayWishes', async function (req, res, next) {
  let parms = {
    title: 'SendBirthdayWishes',
    active: {
      sendBirthdayWishes: true
    }
  };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;
  var employeeSameDOB = new ArrayList;
  var employeeCropId = new ArrayList;
  if (accessToken && userName) {
    parms.user = userName;
    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    db.query("select * from employeeDay where DATE_FORMAT(DOB,'%m/%d') = DATE_FORMAT(CURDATE(),'%m/%d')", function (error, results, fields) {
      if (error) throw error;
      results.forEach(function (employee) {
        employeeCropId.push(employee['cropId'] + "@paypal.com");
        employeeSameDOB.push("<h3><p>" + employee['EmpName'] + " from " + employee['Org'] + " Team" + "</p></h3>");
      });

      if (employeeSameDOB.length > 0) {

        //create cc list to send mail
        var ccRecipientsList = [];
        for (var i = 0; i < employeeCropId.length; i++) {
          ccRecipientsList.push({
            emailAddress: {
              address: employeeCropId[i]
            }
          });
        }

        //get the bday image to send in mail
        var image = accessoryHelper.getFiles("BirthdayPics");


        var contentBytes = accessoryHelper.base64_encode(image);
        var contentType = "image/jpg";
        var mailMarkup = "<h1>Wishing you all very happy birthday from paypal </h1></br><p>" + employeeSameDOB.toString().replace(",", "") + "<img src='cid:Birthday' alt='Birthday Wishes' />";

        const attachments_ = [{
          "@odata.type": "#microsoft.graph.fileAttachment",
          "contentBytes": contentBytes,
          "contentType": contentType,
          "name": "Birthday.jpg",
          "contentId": "Birthday"
        }];

        // construct the email object
        const mail = {
          subject: "It's 'Birthday Party' time!",
          toRecipients: [{
            emailAddress: {
              address: "bhavp@paypal.com"
            }
          }],
          ccRecipients: ccRecipientsList,
          body: {
            content: mailMarkup,
            contentType: "html"
          },
          hasAttachments: true,
          attachments: attachments_
        }

        try {
          client
            .api('/users/me/sendMail')
            .post({
              message: mail
            }, (err, res) => {
              console.log(res)
            });
        }
        catch (err) {
          parms.message = 'Error in sending messages';
          parms.error = {
            status: `${err.code}: ${err.message}`
          };
          parms.debug = JSON.stringify(err.body, null, 2);
          res.render('error', parms);
        }
        res.render('onSucessPage', parms);
      }
      else {
        res.render('onNotSucessPage', parms);
      }
    });
  }
  else {
    // Redirect to home
    res.redirect('/');
  }

});

/* GET /mail */
router.get('/sendWorkingAnniversaryWishes', async function (req, res, next) {
  let parms = {
    title: 'SendWorkingAnniversaryWishes',
    active: {
      sendWorkingAnniversaryWishes: true
    }
  };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;
  var employeeSameDOJ = new ArrayList;
  var employeeCropId = new ArrayList;
  if (accessToken && userName) {
    parms.user = userName;
    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    db.query("select * from employeeDay where DATE_FORMAT(DOJ,'%m/%d') = DATE_FORMAT(CURDATE(),'%m/%d')", function (error, results, fields) {
      if (error) throw error;
      results.forEach(function (employee) {
        var DOJ = new Date(employee['DOJ']);
        var currentDate = new Date();
        var noOfWorkingMonths = currentDate.getYear() - DOJ.getYear();
        if (noOfWorkingMonths % 1 == 0) {
          employeeCropId.push(employee['cropId']);
          employeeSameDOJ.push("<h3><p>"+employee['EmpName'] + " from " + employee['Org'] + " Team" + " Congratulations on your Service Anniversary at PayPal! for " + noOfWorkingMonths + " years looking for many more years to come :) ATB </h3></p>");
        }
      });
      if (employeeSameDOJ.length > 0) {

        //create cc list to send mail
        var ccRecipientsList = [];
        for (var i = 0; i < employeeCropId.length; i++) {
          ccRecipientsList.push({
            emailAddress: {
              address: employeeCropId[i]
            }
          });
        }

        // construct the email object
        const mail = {
          subject: "Congratulations to all for your annual Service Anniversary at PayPal, looking for many more years to come :) ATB",
          toRecipients: [{
            emailAddress: {
              address: "bhavp@paypal.com"
            }
          }],
          ccRecipients: ccRecipientsList,
          body: {
            content: employeeSameDOJ.toString().replace(",", ""),
            contentType: "html"
          }
        }

        try {
          client
            .api('/users/me/sendMail')
            .post({
              message: mail
            }, (err, res) => {
              console.log(res)
            });
        }
        catch (err) {
          parms.message = 'Error in sending messages';
          parms.error = {
            status: `${err.code}: ${err.message}`
          };
          parms.debug = JSON.stringify(err.body, null, 2);
          res.render('error', parms);
        }
        res.render('onSucessPage', parms);
      }
      else {
        res.render('onNotSucessPage', parms);
      }
    });
  }
  else {
    // Redirect to home
    res.redirect('/');
  }

});

module.exports = router;