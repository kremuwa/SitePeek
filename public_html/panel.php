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

    <h2>I. Add a Site</h2>

    <form method="post">
        <div class="form-group">
            <label for="domain">Home URL</label>
            <input type="text" name="domain" id="domain" class="form-control">
            <div class="help-block"><span class="text-danger">Check if the site uses <em>http</em> or <em>https</em> scheme. It won't work if you type incorrect of those two above.</span></div>
        </div>

        <input type="submit" name="addSite" value="Add site" class="btn btn-default">
    </form>

    <h2>II. Install testing code</h2>

    <div class="alert alert-info">
        <p>Before you start the test on paticular site, add the following snippet of code somewhere <strong>after the
                line where you include jQuery</strong>:</p>
        <pre class="code-snippet"><code>&lt;script src=&quot;https://cdn.jsdelivr.net/gh/kremuwa/sitepeek@1.1.5/plugin/build/prod/sitepeek.min.js&quot;&gt;&lt;/script&gt;</code></pre>
        <p><strong>The earlier you add it, the faster the script will detect your test subject has loaded each new
                page</strong>. Tested with jQuery 1.x, possibly works with other versions, too.</p>
    </div>

    <h2>III. Start testing </h2>

    <h3>List of your sites</h3>

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
    <br/>
    <br/>
</div>

<?php include('postbody-scripts.php'); ?>

<?php include('footer.php'); ?>
