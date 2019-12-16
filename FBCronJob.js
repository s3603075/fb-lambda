'use strict';

var AWS = require('aws-sdk')
var FB = require('fb')

var documentClient = new AWS.DynamoDB.DocumentClient(); 

exports.handler = function(event, context, callback){
  
  var coeff = 1000 * 60;
  var date = new Date(); 
  var timeNow = Math.floor(new Date(Math.round(date.getTime() / coeff) * coeff) /1000);

  findTime(timeNow);
  
}

function publishPost(params) {
  FB.api(params.api_endpoint, 'post', params , (res) => {
      if(!res || res.error) {
          console.log(res.error);
          return;
      } else  {
        console.log(res);
      }
  });
}``

function findTime(timeNow) {
  const params = {
      TableName: 'fb-scheduler',
      FilterExpression: '#time = :time',
      ExpressionAttributeNames: {
          '#time': 'time',
      },
      ExpressionAttributeValues: {
          ':time': timeNow,
      },
  };
  
  documentClient.scan(params, function(err, data) {
      if (err) {
            return;
      } else {
            for (var i = 0; i < data.Items.length; ++i) {
                var params = {
                    access_token : data.Items[i].pageat,
                    message : data.Items[i].text,
                    api_endpoint : data.Items[i].pageid+'/feed'
                }
                publishPost(params);
            }
      }
  });
}
