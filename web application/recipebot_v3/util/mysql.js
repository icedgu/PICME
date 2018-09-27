// util/mysql1.js

'use strict';

const credentials = require('./service_credentials');
const mysql = require('mysql');

var con = mysql.createConnection({
  host: credentials.clearDB.host,
  user: credentials.clearDB.user,
  password: credentials.clearDB.password,
  database : credentials.clearDB.database
});
const enter = "</br>"; // enter in HTML format
const space = "&emsp;"; // space in HTML format


// refine json data to 'key-> value' hash type.
let prettify_json = (ugly_json) => {
  var pretty_json = [];
  JSON.parse(JSON.stringify(ugly_json), (u,v) => {
    pretty_json[u] = v;
  });

  return pretty_json;
}

// refine json data to hash -> string
let prettify_term_descript = (ugly_term_descript) => {
  var pretty_term_descript = ugly_term_descript['descript']; // description for cooking term.
  return pretty_term_descript;
}

// refine recipe data with HTML format.
let prettify_recipe = (ugly_recipe) => {
  var image = "<img src='" + ugly_recipe['image'] +"' alt='image' style='width:300px;height:300px;'>"; // set image with html
  var menu = ugly_recipe['menu'];
  var ingredient = ugly_recipe['ingredients'].split('|'); // ingredients infomation delimetered with '|', (string -> array)
  var cooking_step = ugly_recipe['steps'].split('|'); // each step is delimetered with '|'. (string -> array)
  var cooking_time = ugly_recipe['time'];
  var calorie = ugly_recipe['calorie'];
  var pretty_recipe = {};

  var ingredients = "";
  for(var i=0; i<ingredient.length; i++){
    if(i!=0){
        ingredients = ingredients + ","; // concat ingredients with ','
    }
    ingredients += " " + ingredient[i];
  }

  // add number for each steps
  for(var i=0; i<cooking_step.length; i++){
    cooking_step[i] = (i+1) + ". " + cooking_step[i];
  }

  pretty_recipe.meta = image + enter + " - 재료: " + ingredients + enter + " - 조리 시간: "+ cooking_time + enter +" - 칼로리: " + calorie ; // meta data of recipe.
  pretty_recipe.steps = cooking_step;
  pretty_recipe.total_step_num = cooking_step.length;
  pretty_recipe.step_num = 0; // current step number (for printing step with multiple responses.)

  return pretty_recipe;
}

// get recommendation from ingredients
let recommend_recipe = (context) => {
  context.command = undefined;
  context.need_conversation = true;

  return new Promise((resolved, rejected) => {

    var ingredients = context.data.ingredients; // list of ingredients user has.
    var menu_type = context.data.menu_type;
    var query = "";
    var similar = "";

    // search as similiarity of recipe_name for store24
    if (menu_type == 'store24'){
      similar = "%";
    }

    // select all recipes including each ingredient and union all of them.
    for (var i=0; i<ingredients.length; i++){
      if(i!=0){
        query += " UNION ALL";
      }

      query += "(SELECT `menu`, `calorie`, `time` FROM " + menu_type + " WHERE `id` IN (SELECT recipe_id FROM `recipe+ingredient` WHERE `ingredient_id` IN (SELECT `id` FROM `ingredient` WHERE `name` LIKE '" + similar + ingredients[i] + similar + "')))";
  }

  // list recipes based on frequency of menu and different sorting order.
  query = "SELECT `menu` , COUNT(`menu`) AS `freq`, `calorie`, `time` FROM (" + query + ") AS `M` GROUP BY `menu` ORDER BY `freq` DESC";
  if(typeof context.data.preference.priority !== undefined){
      switch (context.data.preference.priority) {
        case "CA":
          query += ", `calorie` ASC";
          break;
        case "CD":
          query += ", `calorie` DESC";
          break;
        case "TD":
          query += ", `time` DESC";
          break;
        case "TA":
          query += ", `time` ASC";
          break;
        default:
      }
  }
  query += " LIMIT 5"; // limit 5 recipes.
  query = "SELECT GROUP_CONCAT(`menu`) AS `menus` FROM (" + query +") as `R`;"; // get concated menu lists.
  console.log(query);

  con.query(query , function(err, result) {
    if(err){
      console.log("error ! :" + err);
      context.error = true;
    }
    else{
      var pretty_json = prettify_json(result);
      var pretty_menus = pretty_json['menus']; // recommened menu lists.

      context.data.recom_menu_list = pretty_menus || {};
      console.log(context.data.recom_menu_list);
      resolved(context);
    }
  });
  });
}

let search_recipe = (context) => {
    context.command = undefined;
    context.need_conversation = true;

    return new Promise((resolved, rejected) => {
      var menu = context.data.menu.replace(/ /gi,""); // erase space in name.

      // get recipe and ingredients with amounts(delimited with '|') from recipe, ingredient, recipe+ingredient table.
      var query = "SELECT `id`, `menu`, `image`, GROUP_CONCAT(CONCAT(`ingredient_name`, ' ', `ingredient_amount`) SEPARATOR '|') as ingredients, `steps`, `time`, `calorie` FROM (SELECT `recipe_id`,`ingredient_id`, `name` as `ingredient_name`, `amount` as `ingredient_amount` FROM `ingredient` AS `I` INNER JOIN `recipe+ingredient` AS `RI` ON `I`.`id`=`RI`.`ingredient_id`) AS `I+RI` INNER JOIN `recipe` AS `R` ON `R`.`id`=`I+RI`.`recipe_id` WHERE REPLACE(`menu`, ' ', '')='" + menu + "';";

      console.log(query);
      con.query(query, function(err, result){
        if(err){
          console.log("error ! :" + err);
          context.error = true;
        }
        else{
          var pretty_json = prettify_json(result); // refine JSON -> hash.
          var pretty_recipe = prettify_recipe(pretty_json); // refine hash -> string.
          context.data.recipe_result = pretty_recipe || {};
          context.data.recipe_result.recipe_id = pretty_json['id'];
          context.image = pretty_json['image']; // set image url (For kakaotalk photo output)
          console.log(context.data.recipe_result);
        }
        resolved(context);
      });
    });
}


// check database if same id alreay exists.
let check_id = (context) => {
  context.command = undefined;
  context.need_conversation = true;

  return new Promise((resolved, rejected) => {
    var user_id = context.data.user_id;
    var query = "SELECT id FROM user WHERE id='" + user_id + "';";
    console.log(query);

    con.query(query, function(err, result) {
      if(err){
        console.log("error ! :" + err);
        context.error = true;
      }
      else{
        var pretty_json = prettify_json(result);

        // if id not exists in database, insert new id data.
        if(typeof pretty_json['id'] === 'undefined'){
          context.data.id_exists = false;
          var query = "INSERT INTO user(id) VALUES('" + user_id + "');";
          console.log(query);

          con.query(query, function(err, result) {
            if(err){
              console.log("error ! :" + err);
              context.error = true;
            }
            else{
              context.login = true;
              console.log(context.data.id_exists);
            }
          });
        }
        // if alreay same id exits.
        else{
          context.data.id_exists = true;
          context.data.user_id = undefined;
          console.log(context.data.id_exists);
          resolved(context);
        }
      }
      resolved(context);
    });
  });
}

// user login
let login = (context) => {
  context.command = undefined;
  context.need_conversation = true;

  return new Promise((resolved, rejected) => {
    var user_id = context.data.user_id;

    // get user data (user settings) from database.
    var query = "SELECT * FROM user WHERE id='" + user_id + "';";
    console.log(query);
    con.query(query, function(err, result){
      if(err){
        console.log("error ! :" + err);
        context.error = true;
      }
      else{
        var pretty_json = prettify_json(result); // JSON -> hash.

        // if id not exists in database. (no user info exists)
        if(typeof pretty_json['id'] === undefined || pretty_json['id'] == null){
          context.login = false;
          context.data.user_id = undefined;
        }
        else{
          context.login = true;

          // get user setting lists.
          context.data.preference = {};
          context.data.preference.allergy = pretty_json['allergy'];
          context.data.preference.priority = pretty_json['priority']; //sorting order.
          context.data.preference.likes = pretty_json['likes'];
          context.data.preference.hates = pretty_json['hates'];
        }
        console.log(context.data.login);
      }
      resolved(context);
    });
  });
}

// set user's preference based on id.
let user_settings = (context) => {
  context.command = undefined;
  context.need_conversation = true;

  return new Promise((resolved, rejected) => {
    var user_id = context.data.user_id;
    var allergy = context.data.preference.allergy;
    var priority = context.data.preference.priority;
    var likes = context.data.preference.likes;
    var hates = context.data.preference.hates;
    var settings = [];

    // set user settings (allergy, priority, likes, hates). only if data value exists.
    if(context.login){
          if (typeof allergy !== undefined && allergy != null){
              settings.push({col:'allergy', val:allergy});
          }

          if (typeof priority !== undefined && priority != null){
              settings.push({col:'priority', val:priority});
          }

          if (typeof likes !== undefined && likes != null){
              settings.push({col:'likes', val:likes});
          }

          if (typeof hates !== undefined && hates != null){
              settings.push({col:'hates', val:hates});
          }

          var query = "UPDATE user SET ";
          for(var j=0 ; j<settings.length; j++){
            var sub_query = settings[j]['col'] + "= '" + settings[j]['val'] + "'";
            console.log(sub_query);

            if (j != (settings.length-1)) {
              sub_query = sub_query + ",";
            }
            query = query + sub_query;
          }
          query = query + " WHERE id='" + user_id + "';"
          console.log(query);

          con.query(query, function(err, result){
            if(err){
              console.log("error ! :" + err);
              context.error = true;
            }
            else{
              context.data.preference.done = true; // user setting sucessfullly done.
              console.log(context.data.preference.done);
            }
            resolved(context);
          });
    }
    else {
      context.data.preference.done = true;
      resolved(context);
    }
  });
}

// search cooking term.
let search_term = (context) => {
  context.command = undefined;
  context.need_conversation = true;

  return new Promise((resolved, rejected) => {
    var term = context.data.term.replace(/ /gi,""); // erase space in name

    // search term descript from database.
    var query = "SELECT * FROM term WHERE REPLACE(title, ' ', '')='" + term + "';";

    console.log(query);
    con.query(query, function(err, result){
      if(err){
        console.log("error ! :" + err);
        context.error = true;
      }
      else{
        var pretty_json = prettify_json(result); // JSON -> hash.
        var pretty_term_descript = prettify_term_descript(pretty_json); // hash -> string
        context.data.term_descript = pretty_term_descript || {};
      }
      console.log(context.data.term_descript);
      resolved(context);
    });
  });
}

module.exports = {
    'recommend_recipe': recommend_recipe,
    'search_recipe' : search_recipe,
    'check_id' : check_id,
    'login' : login,
    "user_settings" : user_settings,
    "search_term" : search_term
};
