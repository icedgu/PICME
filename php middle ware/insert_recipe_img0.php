<?php
  if(isset($_POST['submit'])){
    $db_server = "us-cdbr-sl-dfw-01.cleardb.net";
    $db_id = "bbcec353a2bef7";
    $db_password = "a8da4683";
    $db_name = "ibmx_e2d7bb714b1c241";
    $db = mysqli_connect($db_server, $db_id , $db_password, $db_name);

    if(mysqli_connect_errno())
      echo "</br>"."error !"."</br>";

    $image_name = date("Ymd").uniqid().".jpg";
    $target = "images/{$image_name}";
    $image = "http://csy9608.cafe24.com/IBM/".$target;
    $type_id = $_POST['type_id'];
    $menu = $_POST['menu'];
    $ingredients = $_POST['ingredients'];
    $amounts = $_POST['amounts'];

    $steps = "";
    for($i=0; $i<count($_POST['steps']); $i++){
      $steps = $steps.("{$_POST['steps'][$i]}");
      if($i !== (count($_POST['steps'])-1))
        $steps = $steps."|";
    }
    $time_ = $_POST['time'];
    $calorie = $_POST['calorie'];

    if(empty($time_)){
      $time_ = 'null';
    }

    if(empty($calorie)){
      $calorie = 'null';
    }

    // 1. insert row in recipe table and get id
    echo "</br>Part1 : insert recipe</br>";
    $query1 = "INSERT INTO recipe(`type_id`, `menu`, `image`, `steps`, `time`, `calorie`) VALUES ({$type_id}, '{$menu}', '{$image}', '{$steps}', {$time_}, {$calorie});";
    echo "{$query1}.</br>";
    mysqli_query($db, $query1);

    $query1 = "SELECT id FROM recipe WHERE `menu`='{$menu}';";
    echo "{$query1}.</br>";
    $result1 = mysqli_query($db, $query1);
    $row1 = mysqli_fetch_array($result1);
    $recipe_id = $row1['id'];
    // send query1
    echo "=> {$recipe_id}</br>";

    // 2. check ingredient table and get id (if not exsits add row in ingredient table)
    echo "</br>Part2 : insert ingredient and get Id</br>";
    $ingredients_id = array();

    for($i=0; $i<count($ingredients); $i++){
      // query : insert ingredient if not exists and get id of ingredient
      $query2 = "SELECT id FROM ingredient WHERE name='{$ingredients[$i]}';";
      echo "{$query2}</br>";
      $result2 = mysqli_query($db, $query2);
      if(mysqli_num_rows($result2)==0){
        $query2 = "INSERT INTO ingredient (name) VALUES ('{$ingredients[$i]}');";
        echo "{$query2}</br>";
        mysqli_query($db, $query2);
        $query2 = "SELECT id FROM ingredient WHERE name='{$ingredients[$i]}';";
        echo "{$query2}</br>";
        $result2 = mysqli_query($db, $query2);
      }
      $row2 = mysqli_fetch_array($result2);
      $ingredients_id[$i] = $row2['id'];
      echo " => {$ingredients_id[$i]} </br>";
    }

    // 3. insert rows in recipe+ingredient table
    echo "</br>Part3 : Insert recipe+ingredient</br>";
    for($i=0; $i<count($ingredients); $i++){
      // insert recipe+ingredient
       $query3 = "INSERT INTO `recipe+ingredient`(`ingredient_id`, `recipe_id`, `amount`) VALUES ({$ingredients_id[$i]}, {$recipe_id}, '{$amounts[$i]}');";
       echo "{$query3}</br>";
       mysqli_query($db, $query3);
    }
    mysqli_close($db);

    echo "</br>Part4 : upload image and update recipe table</br>";
    if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
      echo "Image uploaded successfully";
    }
    else{
      echo "Failed to upload image in {$target} : ";
      echo $_FILES['image']['error'];
    }

    echo "</br> <h2><a href='search_menu0.php?id={$recipe_id}'>see result</a></h2>";
  }
?>

<!DOCTYPE html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="utf-8">
    <title>insert recipe</title>
    <script type="text/javascript">
      var ingredient_cnt = 0;
      var recipe_cnt = 0;

      function add_ingredient(){
        ingredient_cnt++;
        var para = document.createElement("p");

        var ingredient = document.createElement("INPUT");
        ingredient.setAttribute("type", "text");
        ingredient.setAttribute("name", "ingredients[]");
        ingredient.setAttribute("placeholder", "재료이름");

        var amount = document.createElement("INPUT");
        amount.setAttribute("type", "text");
        amount.setAttribute("name", "amounts[]");
        amount.setAttribute("placeholder", "수량");

        para.appendChild(ingredient);
        para.innerHTML += ' ';
        para.appendChild(amount);

        var element = document.getElementById("ingredients");
        element.appendChild(para);
      }
      function add_recipe(){
        recipe_cnt++;
        var para = document.createElement("p");
        para.innerHTML += ((recipe_cnt+1)+". ");

        var step = document.createElement("INPUT");
        step.setAttribute("type", "text");
        step.setAttribute("name", "steps[]");

        para.appendChild(step);

        var element = document.getElementById("steps");
        element.appendChild(para);
      }
    </script>
  </head>
  <body>
    <h1>[ 메뉴 레시피 넣기 :D ]</h1>
        <form class="" action="insert_recipe_img0.php" method="post" enctype="multipart/form-data">
          <p>● 메뉴 이름:
            <input type="text" name="menu">
          </p>
          <p>● 종류: <input type="radio" name="type_id" value="1">일반레시피</input>
              <input type="radio" name="type_id" value="2">배달음식</input>
              <input type="radio" name="type_id" value="3">편의점꿀팁레시피</input>
          </p>
          <p>● 재료:
            <p>
                <div id="ingredients">
                  <p>
                      <input type="text" name="ingredients[]" placeholder="재료 이름">
                      <input type="text" name="amounts[]" placeholder="수량">
                  </p>
                </div>
                <button type="button" onclick="add_ingredient()">재료 추가</button>
            </p>
          </p>
          <p>● 칼로리:
            <input type="text" name="calorie">
          </p>
          <p>● 시간:
            <input type="number" name="time">
          </p>
            ● 조리방법:
            <div id="steps">
              <p>
                1.&nbsp;<input type="text" name="steps[]">
              </p>
            </div>
            <button type="button" onclick="add_recipe()">단계 추가</button>
          <p>
            ● 이미지:
            <input type="file" name="image">
          </p>
      </br><input type="submit" name="submit" value="레시피 업로드" style="width:100px;height:50px">
    </form>
  </body>
</html>
