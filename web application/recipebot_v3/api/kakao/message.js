'use strict';

const conversation = require('../message');
const cloudant = require('../../util/db');
const db = cloudant.db['context'];

let postMessage = (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  console.log(req.body.user_key);

  let user_key = req.body.user_key;
  let type = req.body.type;
  let content = {
  	'text' : req.body.content
  };

  //user_key를 사용하여 db에 저장된 context가 있는지 확인합니다.
  db.get(user_key, (err, doc) => {

    if(err){
      console.log(3, err);
      // 처음 대화인 경우 context가 없습니다. 이러한 경우 context 없이 conversation api를 호출합니다.
      conversation.getConversationResponse(content, {}).then(data => {
        // context를 저장합니다.
        db.insert({
          '_id' : user_key,
          'user_key' : user_key,
          'session': {
            'context': Object.assign(data.context, {
              'channel' : 'kakao',
              'timezone' : "Asia/Seoul"
            })
          }
        }, (err, doc) => {

            var output = getOutputText(data);
            var kakao_output = {};
            kakao_output.message = {};
            // replace </br> to enter, &emsp; to space and remove img, source, audio tags
            kakao_output.message.text = output.replace(/<\/br>/gi,"\n").replace(/&emsp;/gi, " ").replace(/<img[^>]*>/g,"").replace(/<source[^>]*>/g,"").replace(/<\/source>/g,"").replace(/<audio controls autoplay buffered><\/audio>/g,"");

            var img = data.context.image;

            // if context.image exists -> print photo
            if(typeof img !== undefined && img != null){
              kakao_output.message.photo = {};
              kakao_output.message.photo.url = "" + img;
              kakao_output.message.photo.width = 640;
              kakao_output.message.photo.height = 640;
            }

            // if context.url exists -> set url on button
            var url = data.context.url;
            var label = data.context.label;
            if(typeof url !== undefined && url != null){
              kakao_output.message.message_button = {};
              kakao_output.message.message_button.url = url;
              kakao_output.message.message_button.label = label;
            }

            return res.json(kakao_output);
          });

        }).catch(function(err){
          return res.json({
              "message" : {
                "text" : JSON.stringify(err.message)
          }
        });
      });
    }

    else{
      //저장된 context가 있는 경우 이를 사용하여 conversation api를 호출합니다.
      conversation.getConversationResponse(content, Object.assign(doc.session.context, {
        'user_key' : user_key
      })).then(data => {
        // context를 업데이트 합니다.

        doc.session.context = Object.assign(data.context, {
              'channel' : 'kakao',
              'timezone' : 'Asia/Seoul'
        });

        db.insert(doc);

        var output = getOutputText(data);
        var kakao_output = {};
        kakao_output.message = {};
        // replace </br> to enter, &emsp; to space and remove img, source, audio tags
        kakao_output.message.text = output.replace(/<\/br>/gi,"\n").replace(/&emsp;/gi, " ").replace(/<img[^>]*>/g,"").replace(/<source[^>]*>/g,"").replace(/<\/source>/g,"").replace(/<audio controls autoplay buffered><\/audio>/g,"");

        var img = data.context.image;
        // if context.image exists -> print photo
        if(typeof img !== undefined && img != null){
          kakao_output.message.photo = {};
          kakao_output.message.photo.url = "" + img;
          kakao_output.message.photo.width = 640;
          kakao_output.message.photo.height = 640;
        }

        var url = data.context.url;
        var label = data.context.label;
        // if context.url exists -> set url on button
        if(typeof url !== undefined && url != null && label != null){
          kakao_output.message.message_button = {};
          kakao_output.message.message_button.url = url;
          kakao_output.message.message_button.label = label;
        }

        return res.json(kakao_output);

      }).catch(function(err){
        return res.json({
            "message" : {
              "text" : JSON.stringify(err.message)
            }
        });
      });
    }
  });
}



let getOutputText = (data) => {
  let output = data.output;
  if(output.text && Array.isArray(output.text)){
    return output.text.join('\n');
  }
  else if(output.text && output.text.values && Array.isArray(output.text.values)){
    return output.text.values.join('\n');
  }
  else if(output.text){
    return output.text;
  }
  else return "";
}

module.exports = {
    'initialize': function(app, options) {
        app.post('/api/kakao/message', postMessage);
    }
};
