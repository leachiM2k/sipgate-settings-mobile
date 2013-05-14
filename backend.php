<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
include 'httpful-0.2.0.phar';
$url = "http://api.dev.sipgate.net";

$handler = array(
	'numbers' => array(
		'url' => '/my/settings/numbers/outgoing/',
		'version' => '2.42',
		'method' => 'get'
	)
);

$post = $_POST;
//$post = $_GET;
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

$url .= $handler[$post['action']]['url'];

if(isset($post['params']) && is_array($post['params']))
{
	$url .= '/' . http_build_query($post['params']);
}

$method = $handler[$post['action']]['method'];
$response = \Httpful\Request::$method($url)
	->mime(\Httpful\Mime::JSON)
	->withoutAutoParsing()
	->authenticateWith($post['username'], $post['password'])
    ->send();

header("HTTP/1.1 " . $response->code);
if($response->code == 200) {
	header("Content-Type: application/json");
	echo $response->body;
}