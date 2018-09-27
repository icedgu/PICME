[recipebot_v3]
: code based on Github (https://github.com/hjjo/chatbot-sample)

1. /api
- message.js
 : for getting input and output through watson-conversation service.
  1) /message.js : for webpage
  2) kakao/message.js * : for message platform kakao talk, removed all HTML tags before output text.

- actions/main.js *
 : for doing actions that watson-conversation requested. (using context variable $command from watson-conversation)
   call functions to access DB using '../../util/mysql.js'

2. /public 
 : for webpages. main part is index.html

3. util folder.
- mysql.js *
 : most important file for this application.
 : functions for accessing DB. (send query to ClearDB in IBM Cloud and get response with JSON format).
   and refine them with HTML format. (more prettier)
  ( recommend_recipe, search_recipe, check_id, login, user_settings, search_term )

4. server.js 
-  starting file for this nodejs application.
-  call app.js file.

5. app.js 
- set public directory for web access.

¢º * means that this file is modified from original one.