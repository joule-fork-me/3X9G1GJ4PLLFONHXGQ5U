/**
 * This is the boilerplate repository for creating joules.
 * Forking this repository should be the starting point when creating a joule.
 */

/*
 * The handler function for all API endpoints.
 * The `event` argument contains all input values.
 *    event.httpMethod, The HTTP method (GET, POST, PUT, etc)
 *    event.{pathParam}, Path parameters as defined in your .joule.yml
 *    event.{queryStringParam}, Query string parameters as defined in your .joule.yml
 */
var Response = require('joule-node-response');
var {google} = require('googleapis');
var scopes = [
      'https://www.googleapis.com/auth/admin.directory.user',
      'https://www.googleapis.com/auth/admin.directory.group'
    ];
const authClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY,
  scopes,
  process.env.IMPERSONATE_EMAIL
);
const admin = google.admin('directory_v1');

exports.handler = function(event, context) {
	var response = new Response();
  var groupKey = event.query['groupKey'] || '';
	response.setContext(context);

  authClient.authorize(function(err, data) {
    if (err) {
      response.send(err.response.data);
      return;
    }
    
    const memberParams = {groupKey:groupKey, auth: authClient};
    admin.groups.get(memberParams, function(err, data) {
      if (err) {
        response.send(err.response.data);
        return;
      }
      var result = {
        "group": data.data
      };
      
      response.send(result);
    });
  });

};
