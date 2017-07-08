<?php

// init script

include('functions.php');

$messages = [];

// initial checks

goHomeIfNotLoggedIn();

// process forms

try {

    if (isset($_POST['addSite'])) {

        if (!isset($_POST['domain']) || empty($_POST['domain'])) {
            throw new Exception("Fill in all fields.");
        }

        $insertSite = $dbh->prepare('INSERT INTO sites VALUES(?, ?, ?)');
        $insertSite->execute([null, getLoggedInUserId(), $_POST['domain']]);
    }

} catch (Exception $exception) {

    $messages[] = ['status' => 'error', 'msg' => $exception->getMessage()];
}

// prepare the view

$getUserSites = $dbh->prepare('SELECT * FROM sites WHERE user_id = ?');

$getUserSites->execute([getLoggedInUserId()]);

$userSites = $getUserSites->fetchAll();

?>

<?php include('header-site.php'); ?>

<div class="center-block wrapper">

    <div class="text-center logo">
        <a href="/">
            <img src="img/logo.png">
        </a>
    </div>

    <?php printMessages($messages); ?>

    <h2>Add a Site</h2>

    <form method="post">
        <div class="form-group">
            <label for="domain">Domain</label>
            <input type="text" name="domain" id="domain" class="form-control">
        </div>

        <input type="submit" name="addSite" value="Add site" class="btn btn-default">
    </form>

    <h2>List of your sites</h2>

    <table class="table table-striped table-sites">
        <tr>
            <th>Domain</th>
            <th></th>
        </tr>

        <?php foreach ($userSites as $site): ?>

            <tr>
                <td><?php _pr($site['domain']); ?></td>
                <td><a href="watch.php?site=<?php _pr($site['id']); ?>">Watch user activity</a></td>
            </tr>

        <?php endforeach; ?>

    </table>

    <hr>

    <a href="logout.php" class="btn btn-danger">Log out</a>
</div>

<?php include('postbody-scripts.php'); ?>

<?php include('footer.php'); ?>
