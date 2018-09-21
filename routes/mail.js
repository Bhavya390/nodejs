var express = require('express');
var router = express.Router();
var authHelper = require('../helpers/auth');
var graph = require('@microsoft/microsoft-graph-client');
var db = require('../dbconnection.js');
var ArrayList = require('ArrayList');
db.connect();

/* GET /mail */
router.get('/', async function(req, res, next) {
  let parms = { title: 'Inbox', active: { inbox: true } };

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

  db.query("select * from employeeDay where DATE_FORMAT(DOB,'%m/%d') = DATE_FORMAT(CURDATE(),'%m/%d')", function (error, results, fields) {
    if (error) throw error;

    if(results != null) {
      var employeeSameDOB = new ArrayList;
      results.forEach(function(employee) {
        employeeSameDOB.add(employee['EmpName'] + " from " +employee['Org'] + " Team" + "\n");
      });
    // construct the email object
    const mail = {
      subject: "Microsoft Graph JavaScript Sample",
      toRecipients: [{
        emailAddress: {
            address: "bhavp@paypal.com"
        }
      }],
      body: {
        content: "<h1>see how many ppl have same DOB " + "\n" + employeeSameDOB,
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
    //res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
  });

  } else {
    // Redirect to home
    res.redirect('/');
  }

  res.render('index', parms);
});

module.exports = router;