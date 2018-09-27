<?php
  if(isset($_POST['search'])){
      $db_server = "us-cdbr-sl-dfw-01.cleardb.net";
      $db_id = "bbcec353a2bef7";
      $db_password = "a8da4683";
      $db_name = "ibmx_e2d7bb714b1c241";
      $db = mysqli_connect($db_server, $db_id , $db_password, $db_name);

      // user menu name to search recipe.
      $recipe_menu = $_POST['menu'];
      $query = "SELECT * FROM recipe WHERE REPLACE(menu,' ', '')=REPLACE('{$recipe_menu}', ' ', '');"; // ignore space in menu name.
      echo "</br>{$query}</br>";
      $result = mysqli_query($db, $query);
      $row = mysqli_fetch_array($result);

      // select recipe and ingredients with amount from recipe, recipe+ingredient, ingredient table.
      $query2 = "SELECT `ingredient`.name AS ingredient_name, `recipe+ingredient`.amount AS ingredient_amount FROM `ingredient` INNER JOIN `recipe+ingredient` ON `ingredient`.id=`recipe+ingredient`.ingredient_id AND `recipe+ingredient`.recipe_id={$row['id']};";
      echo "</br>{$query2}</br>";
      $result2 = mysqli_query($db, $query2);

      // print recipe results.
      echo "Search Success";
      echo "<div id='img_div'>";
      echo "<p><img src='{$row['image']}' alt='image_load_failed' height='42' width='42'></p>";
      echo "</div>";
      echo "<p>id : {$row['id']}</p>";
      echo "<p>menu_type : {$row['type_id']}</p>";
      echo "<p>menu : {$row['menu']}</p>";
      echo "<p>ingredients: ";
      while($row2 = mysqli_fetch_array($result2)){
        echo "<p> {$row2['ingredient_name']} : {$row2['ingredient_amount']} </p>";
      }
      echo "</p>";
      echo "<p>steps : {$row['steps']}</p>";
      echo "<p>calorie : {$row['calorie']}</p>";
      echo "<p>time : {$row['time']}</p>";

      mysqli_close($db);
    }
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title></title>
  </head>
  <body>
    <form class="" action="search_menu0-1.php" method="post">
      <input type="text" name="menu" placeholder="MENU">
      <input type="submit" name="search" value="SEARCH">
    </form>
  </body>
</html>
