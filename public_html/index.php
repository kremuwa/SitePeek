<?php

    include('functions.php');

    $messages = [];

    if (isAnybodyLoggedIn()) {
        redirect('panel.php');
    }

    try {

        if(isset($_POST['register'])) {

            if(!isset($_POST['username'], $_POST['password'], $_POST['repeated-password']) || isAnyEmpty($_POST['username'], $_POST['password'], $_POST['repeated-password'])) {
                throw new Exception("Fill in all fields.");
            }

            if($_POST['password'] != $_POST['repeated-password']) {

                throw new Exception("Passwords do not match.");
            }

            if(checkUserExists($_POST['username'])) {

                throw new Exception("User with this username already exists.");
            }

            $hashedPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);

            $insertSite = $dbh->prepare('INSERT INTO users VALUES(?, ?, ?)');
            $insertSite->execute([null, $_POST['username'], $hashedPassword]);

        } else if(isset($_POST['login'])) {

            if(!isset($_POST['username'], $_POST['password'])) {
                throw new Exception("Fill in all fields.");
            }

            if(!checkUserExists($_POST['username'])) {
                throw new Exception("Username or password invalid.");
            }

            $getIdAndHashForUser
                = $dbh->prepare('SELECT id, passwordHash FROM users WHERE username = ?');

            $getIdAndHashForUser->execute([$_POST['username']]);

            $userIdAndHash = $getIdAndHashForUser->fetch();

            $userPasswordHash = $userIdAndHash['passwordHash'];
            $userId = $userIdAndHash['id'];

            if (!password_verify($_POST['password'], $userPasswordHash)) {
                throw new Exception("Username or password invalid.");
            }

            // mark as logged in

            $_SESSION['loggedIn'] = true;
            $_SESSION['id'] = $userId;

            redirect('panel.php');
        }

    } catch(Exception $exception) {

        $messages[] = ['status' => 'error', 'msg' => $exception->getMessage()];
    }
?>

    <?php include('header.php'); ?>

    <?php printMessages($messages); ?>

    <h2>Register</h2>

    <form method="post">
        <div>
            <label for="username">Username</label>
            <input type="text" name="username" id="username">
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" name="password" id="password">
        </div>
        <div>
            <label for="repeated-password">Repeat password</label>
            <input type="password" name="repeated-password" id="repeated-password">
        </div>

        <input type="submit" name="register" value="Register">
    </form>

    <h2>Log in</h2>

    <form method="post">
        <div>
            <label for="username">Username</label>
            <input type="text" name="username" id="username">
        </div>
        <div>
            <label for="password">Password</label>
            <input type="password" name="password" id="password">
        </div>

        <input type="submit" name="login" value="Log in">
    </form>

<?php include('footer.php') ?>