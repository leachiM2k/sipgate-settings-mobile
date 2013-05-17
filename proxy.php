<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
include 'httpful-0.2.0.phar';
$url = "https://api.sipgate.net";

$post = $_POST;
//$post = $_GET;
if(!isset($post) || count($post) < 1)
{
	die("Method not allowed");
}
if(!isset($post['method']) || !in_array($post['method'], array('get','post','put','delete')))
{
	die("method not specified");
}
if(!isset($post['url']) || $post['url'] == "")
{
	die("url not specified");
}
if(!isset($post['username']) || $post['username'] == "")
{
	die("Username not specified");
}
if(!isset($post['password']) || $post['password'] == "")
{
	die("Password not specified");
}

$url .= $post['url'];

$method =  $post['method'];
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