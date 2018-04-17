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

            $insertUser = $dbh->prepare('INSERT INTO users VALUES(?, ?, ?)');
            $insertUser->execute([null, $_POST['username'], $hashedPassword]);

            $messages[] = ['status' => 'success', 'msg' => 'Registration successful. You can now log in below.'];

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

    <?php include('header-site.php'); ?>

    <div class="container">
        <div class="row">

            <div class="center-block wrapper">

                <div class="text-center logo">
                    <a href="/">
                        <img src="img/logo.png">
                    </a>
                </div>

                <?php printMessages($messages); ?>

                <h2>Register</h2>

                <form method="post">
                    <div class="form-group">
                        <label for="username" class="control-label">Username</label>
                        <input type="text" name="username" id="username" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="password" class="control-label">Password</label>
                        <input type="password" name="password" id="password" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="repeated-password" class="control-label">Repeat password</label>
                        <input type="password" name="repeated-password" id="repeated-password" class="form-control">
                    </div>

                    <input type="submit" name="register" value="Register" class="btn btn-default">
                </form>

                <h2>Log in</h2>

                <form method="post">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" name="username" id="username" class="form-control">
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" name="password" id="password" class="form-control">
                    </div>

                    <input type="submit" name="login" value="Log in" class="btn btn-default">
                </form>

            </div>
        </div>
    </div>



<?php include('postbody-scripts.php'); ?>

<?php include('footer.php') ?>