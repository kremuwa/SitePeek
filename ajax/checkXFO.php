<?php
/**
 * Created by PhpStorm.
 * User: kremuwa
 * Date: 2015-05-06
 * Time: 12:26
 */

function parseHeaders( $headers )
{
    $head = array();
    foreach( $headers as $k=>$v )
    {
        $t = explode( ':', $v, 2 );
        if( isset( $t[1] ) )
            $head[ trim($t[0]) ] = trim( $t[1] );
        else
        {
            $head[] = $v;
            if( preg_match( "#HTTP/[0-9\.]+\s+([0-9]+)#",$v, $out ) )
                $head['reponse_code'] = intval($out[1]);
        }
    }
    return $head;
}

// TODO server-side form validation

file_get_contents($_GET['url']);
$parsedHeaders = parseHeaders($http_response_header);

if(isset($parsedHeaders['X-Frame-Options']) && ($parsedHeaders['X-Frame-Options'] == 'SAMEORIGIN' || ($parsedHeaders['X-Frame-Options'] == 'DENY'))) {
    echo "true";
}
else {
    echo "false";
}