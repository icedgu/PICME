<?php

  if(isset($_POST['send'])){
    $db_server = "us-cdbr-sl-dfw-01.cleardb.net";
    $db_id = "bbcec353a2bef7";
    $db_password = "a8da4683";
    $db_name = "ibmx_e2d7bb714b1c241";
    $db = mysqli_connect($db_server, $db_id , $db_password, $db_name);

    if(mysqli_connect_errno())
      echo "[error]: ".mysqli_connect_error();

    // get query by POST parameter.
    $query = $_POST['query'];
    echo "<p>".$query."</p>";

    // send query to database and print result.
    $result = mysqli_query($db, $query);
    while ($row = mysqli_fetch_array($result)) {
      echo "<p>";
      foreach ($row as $key => $val) {
          echo "{$key}:{$val}";
          echo "<br>";
      }
      echo "</p>";
    }
    mysqli_close($db);
  }
?>

<!DOCTYPE html>
<html>
<head>
	<title>DB QUERY</title>
</head>
<body>
<form class="" action="db_query0.php" method="post">
  <textarea name="query" rows="8" cols="80"></textarea></br>
  <input type="submit" name="send" value="send">
</form>

<?php

?>

</body>
</html>
