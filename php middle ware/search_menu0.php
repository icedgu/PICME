<?php
    $db_server = "us-cdbr-sl-dfw-01.cleardb.net";
    $db_id = "bbcec353a2bef7";
    $db_password = "a8da4683";
    $db_name = "ibmx_e2d7bb714b1c241";
    $db = mysqli_connect($db_server, $db_id , $db_password, $db_name);

    // use recipe id to search recipe.
    $recipe_id = $_GET['id'];
    $query = "SELECT * FROM recipe WHERE id={$recipe_id};";
    echo "</br>{$query}</br>";
    $result = mysqli_query($db, $query);

    // select recipe and ingredients with amount from recipe, recipe+ingredient, ingredient table.
    $query2 = "SELECT `ingredient`.name AS ingredient_name, `recipe+ingredient`.amount AS ingredient_amount FROM `ingredient` INNER JOIN `recipe+ingredient` ON `ingredient`.id=`recipe+ingredient`.ingredient_id AND `recipe+ingredient`.recipe_id={$recipe_id};";

    echo "</br>{$query2}</br>";
    $result2 = mysqli_query($db, $query2);

    // print recipe results.
    while ($row = mysqli_fetch_array($result)) {
      echo "Search Success";
      echo "<div id='img_div'>";
      echo "<p><img src='{$row['image']}' alt='image_load_failed' height='42' width='42'></p>";
      echo "</div>";
      echo "<p>id : {$recipe_id}</p>";
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
    }
    mysqli_close($db);

    // link to new page to check recipe inserted.
    echo "<h2><a href='insert_recipe_img0.php'>Back to insert recipe :)</a></h2>";
?>
