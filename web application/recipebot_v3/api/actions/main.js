/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 // api/actions/main.js

'use strict';

const calendar = require('./calendar.js');
const recommendation = require('./recommendation.js');
const mysql = require('../../util/mysql.js');

let doAction = (context) => {
    switch(context.command){
        case "recommend_recipe":
            return mysql.recommend_recipe(context);
        case "search_recipe":
            return mysql.search_recipe(context);
        case "check_id": // check if same id already exits.
            return mysql.check_id(context);
        case "login":
            return mysql.login(context);
        case "user_settings":
            return mysql.user_settings(context);
        case "search_term":
            return mysql.search_term(context);
    }
}

module.exports = {
    'doAction': doAction
};
