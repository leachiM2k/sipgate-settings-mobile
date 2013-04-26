<?php
$url = "http://api.dev.sipgate.net";

$handler = array(
	'extension' => array(
		'url' => '/my/settings/extensions/',
		'version' => '2.41'
	)
);

#$post = $_POST;
$post = $_GET;
if(!isset($post) || count($post) < 1)
{
	die("Method not allowed");
}

if(!isset($post['username']) || $post['username'] == "")
{
	die("Username not specified");
}
if(!isset($post['password']) || $post['password'] == "")
{
	die("Password not specified");
}

if(!isset($post['action']) || $post['action'] == "")
{
	die("Action not specified");
}

if(!isset($post['params']) || $post['params'] == "")
{
	die("Params not specified");
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url . $handler['extension']['url']);
#curl_setopt($ch, CURLOPT_POST, 0);
#curl_setopt($ch, CURLOPT_POST, 1);
#curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post['params']));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERPWD, $post['username'] .":" . $post['password']);
curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_BASIC);
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Accept: application/json'));
$result = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);


echo "result:";
var_dump($result);

echo "info:";
var_dump($info);