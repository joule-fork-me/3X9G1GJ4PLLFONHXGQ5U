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
var Response = require('joule-node-response')
    , JouleNodeDatabase = require('joule-node-database')
    , myDb = new JouleNodeDatabase()
    , {google} = require('googleapis')
    , jexl = require('Jexl')
    , scopes = [
      'https://www.googleapis.com/auth/admin.directory.user'
      , 'https://www.googleapis.com/auth/admin.directory.group'
    ];

const authClient = new google.auth.JWT(
        process.env.CLIENT_EMAIL,
        null,
        process.env.PRIVATE_KEY,
        scopes,
        process.env.IMPERSONATE_EMAIL
      )
      , admin = google.admin('directory_v1');

jexl.addTransform('lower', function(val) {
    return val.toLowerCase();
});

var handler = function(event, context) {
	var response = new Response()
      , pathArray = event.path
      , httpMethod = event.httpMethod;
	response.setContext(context);

  if(pathArray.length === 0) {
    // base path is the webhook
    webhook(event, context, response);
  } else {
    switch(pathArray[0]) {
      case 'api':
        switch(httpMethod) {
          case 'GET':
            api_get(event, context, response);
            break;
          case 'POST':
            api_post(event, context, response);
            break;
        }
        break;
    }
  }
};

var api_get = function(event, context, response) {
  return;
  var user = {name: {fullName: 'Jaisen'}};
};

var api_post = function(event, context, response) {
  return;
  myDb.set('groups', {foo: 'bar'}).done(function(err, data) {
    if(err) {
      console.log(err);
      response.send(err);
    }
    console.log(data);
    response.send('hi');
  });
};

var webhook = function(event, context, response) {
  const userKey = event.post['id'];
  memberParams = {userKey:userKey, auth: authClient};
  admin.users.get(memberParams, function(err, data) {
    if (err) {
      console.log(err);
      response.send(err.response.data);
      return;
    }
    const user = data.data;
    var rules = {
      'dynamic-group-of-jaisens@shelterplus.in': '"jaisen" in name.fullName|lower'
      , 'dynamic-group-of-joes@shelterplus.in': '"joe" in name.fullName|lower'
    };
    ruleCount = 0;
    ruleTotal = Object.keys(rules).length;
    for(group in rules) {
      process_rule(group, rules[group], user, response);
    }
  });
};

var process_rule = function(group, rule, user, response) {
  ruleCount++;
  authClient.authorize(function(err, data) {
    if (err) {
			console.log(err);
      response.send(err.response.data);
      return;
    }
    
    admin.users.get(memberParams, function(err, data) {
      if (err) {
				console.log(err);
        response.send(err.response.data);
        return;
      }

      const user = data.data;

      jexl.eval(rule, user, function(err, condition_status) {
        if(condition_status) {
          const resource = Object.assign(user, {role: 'MEMBER'});
          const insertMemberParams = {groupKey: group, resource: resource, auth: authClient};
          admin.members.insert(insertMemberParams, function(err, data) {
            if (err) {
              console.log('add_to_group err');
              //console.log(err);
              return;
            }
            console.log('add_to_group success');
            if(ruleCount === ruleTotal) {
              response.send('done'/*{"user": data.data}*/);
            }
            return;
          });
        } else {
          const deleteMemberParams = {groupKey: group, memberKey: user.id, auth: authClient};
          admin.members.delete(deleteMemberParams, function(err, data) {
            if (err) {
              console.log('remove_from_group err');
              //console.log(err);
              return;
            }
            console.log('remove_from_group success');
            if(ruleCount === ruleTotal) {
              response.send('done'/*{"user": data.data}*/);
            }
            return;
          });
        }
      });
    });
  });
};

exports.handler = handler;

// exports.handler = watch_users;
// exports.handler = get_group_by_key;
//
/*
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
*/
/*var watch_users = function(event, context) {
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
      , address: event.base_url
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
};*/
