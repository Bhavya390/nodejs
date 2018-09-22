var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
var db = require('../dbconnection.js');
var ArrayList = require('ArrayList');
db.connect();

/* GET /mail */
router.get('/sendBirthdayWishes', async function(req, res, next) {
  let parms = { title: 'SendBirthdayWishes', active: { sendBirthdayWishes: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;
    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    var employeeSameDOB = new ArrayList;
    
    db.query("select * from employeeDay where DATE_FORMAT(DOB,'%m/%d') = DATE_FORMAT(CURDATE(),'%m/%d')", function (error, results, fields) {
      if (error) throw error;
      results.forEach(function(employee) {
        employeeSameDOB.push(employee['EmpName'] + " from " +employee['Org'] + " Team" + "</br>");
      });
      if(employeeSameDOB.length > 0) {
        // construct the email object
        const mail = {
          subject: "Microsoft Graph JavaScript Sample",
          toRecipients: [{
            emailAddress: {
            address: "bhavp@paypal.com"
          }
        }],
          body: {
            content: "<h1>Wishing you all very happy birthday from paypal </h1></br><p>" + employeeSameDOB,
            contentType: "html"
          }
        }
 
        try {
          client
            .api('/users/me/sendMail')
            .post({message: mail}, (err, res) => {
            console.log(res)
          });
        } catch (err) {
          parms.message = 'Error in sending messages';
          parms.error = { status: `${err.code}: ${err.message}` };
          parms.debug = JSON.stringify(err.body, null, 2);
          res.render('error', parms);
        } 
      }
    });
    //} 
  } else {
    // Redirect to home
    res.redirect('/');
  }

  res.render('SucessPage', parms);
});

/* GET /mail */
router.get('/sendWorkingAnniversaryWishes', async function(req, res, next) {
  let parms = { title: 'SendWorkingAnniversaryWishes', active: { sendWorkingAnniversaryWishes: true } };

  const accessToken = await authHelper.getAccessToken(req.cookies, res);
  const userName = req.cookies.graph_user_name;

  if (accessToken && userName) {
    parms.user = userName;
    // Initialize Graph client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      }
    });

    var employeeSameDOJ = new ArrayList;
    
    db.query("select * from employeeDay where DATE_FORMAT(DOJ,'%m/%d') = DATE_FORMAT(CURDATE(),'%m/%d')", function (error, results, fields) {
      if (error) throw error;
      results.forEach(function(employee){
        var DOJ = new Date(employee['DOJ']);
        var currentDate = new Date();
        var noOfWorkingMonths = currentDate.getYear() - DOJ.getYear();
        if(noOfWorkingMonths%1 == 0) {
          employeeSameDOJ.push(employee['EmpName'] + " from "+ employee['Org'] + " Team" + " Congratulations on your Service Anniversary at PayPal! for " + noOfWorkingMonths +" years looking for many more years to come :) ATB");
        }
      });
      if(employeeSameDOJ.length > 0) {
        // construct the email object
        const mail = {
          subject: "Microsoft Graph JavaScript Sample",
          toRecipients: [{
            emailAddress: {
            address: "bhavp@paypal.com"
          }
        }],
          body: {
            content: "<h1>Congratulations to all for your annual Service Anniversary at PayPal, looking for many more years to come :) ATB</h1></br>" + employeeSameDOJ,
            contentType: "html"
          }
        }
 
        try {
          client
            .api('/users/me/sendMail')
            .post({message: mail}, (err, res) => {
            console.log(res)
          });
        } catch (err) {
          parms.message = 'Error in sending messages';
          parms.error = { status: `${err.code}: ${err.message}` };
          parms.debug = JSON.stringify(err.body, null, 2);
          res.render('error', parms);
        } 
      }
    });
  } else {
    // Redirect to home
    res.redirect('/');
  }
  res.render('SucessPage', parms);
});

module.exports = router;