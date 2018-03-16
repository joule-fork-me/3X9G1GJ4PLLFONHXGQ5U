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
      'https://www.googleapis.com/auth/admin.directory.user'
      , 'https://www.googleapis.com/auth/admin.directory.group'
    ];

const authClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY,
  scopes,
  process.env.IMPERSONATE_EMAIL
);
const admin = google.admin('directory_v1');

var watch_users = function(event, context) {
	var response = new Response();
  var groupKey = event.query['groupKey'] || '';
	response.setContext(context);

  authClient.authorize(function(err, data) {
    if (err) {
      console.log("AUTH FAILED");
			console.log(err);
      response.send(err.response.data);
      return;
    }
    
    const watchParams = {
      event: "update"
      , viewType: "admin_view"
      , customer: "my_customer"
    };
    const watchOptions = {
      id: '' + parseInt(Math.random()*1000000000)
      , auth: authClient
      , address: "https://dg.jmathai.com/jmathai/d-groups-syn-2"
      , token: '' + parseInt(Math.random()*1000000000)
      , type: "web_hook"
      , payload: true
    };
    //const params = Object.assign(watchParams, watchOptions);
    admin.users.watch(watchParams, watchOptions, function(err, data) {
      if (err) {
        console.log("WATCH FAILED");
				console.log(err.response.data);
				console.log(err.response.data.error.errors);
        response.send(err.response.data);
        return;
      }
      var result = {
        "watch": JSON.stringify(data.data)
      };
      
      response.send(result);
    });
  });
};

var get_group_by_key = function(event, context) {
	var response = new Response();
  var groupKey = event.query['groupKey'] || 'jaisen-test@shelterplus.in';
	response.setContext(context);

  authClient.authorize(function(err, data) {
    if (err) {
			console.log(err);
      response.send(err.response.data);
      return;
    }
    
    const memberParams = {groupKey:groupKey, auth: authClient};
    admin.groups.get(memberParams, function(err, data) {
      if (err) {
				console.log(err);
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

var dynamic_group = function(event, context) {
	var response = new Response();
	response.setContext(context);
  authClient.authorize(function(err, data) {
    if (err) {
			console.log(err);
      response.send(err.response.data);
      return;
    }
    
    const userKey = event.post['id'];
    const memberParams = {userKey:userKey, auth: authClient};
    admin.users.get(memberParams, function(err, data) {
      if (err) {
				console.log(err);
        response.send(err.response.data);
        return;
      }

      console.log(data);
      const user = data.data;

      if(user.name.fullName.toLowerCase().indexOf('jaisen') !== -1) {
        const resource = Object.assign(user, {role: 'MEMBER'});
        const insertMemberParams = {groupKey: 'dynamic-group-of-jaisens@shelterplus.in', resource: resource, auth: authClient};
        admin.members.insert(insertMemberParams, function(err, data) {
          if (err) {
            console.log('add_to_group err');
            console.log(err);
            return;
          }
          console.log('add_to_group success');
          console.log(data);
          return;
        });
      } else {
        const resource = Object.assign(user, {role: 'MEMBER'});
        const deleteMemberParams = {groupKey: 'dynamic-group-of-jaisens@shelterplus.in', memberKey: user.id, auth: authClient};
        admin.members.delete(deleteMemberParams, function(err, data) {
          if (err) {
            console.log('remove_from_group err');
            console.log(err);
            return;
          }
          console.log('remove_from_group success');
          console.log(data);
          return;
        });
      }

      var result = {
        "user": data.data
      };
      
      response.send(result);
    });
  });
};

var add_to_group = function(admin, user) {
  const resource = Object.assign(user, {role: 'MEMBER'});
  const memberParams = {groupKey: 'dynamic-group-of-jaisens@shelterplus.in', resource: resource};
  authClient.authorize(function(err, data) {
    if (err) {
			console.log(err);
      response.send(err.response.data);
      return;
    }
    admin.members.insert(memberParams, function(err, data) {
      if (err) {
        console.log('add_to_group err');
        console.log(err);
        return;
      }
      console.log('add_to_group success');
      console.log(data);
      return;

    });
  });
};

exports.handler = dynamic_group;
// exports.handler = watch_users;
// exports.handler = get_group_by_key;
