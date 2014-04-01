<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
$post = $_POST;

if(!isset($post['username']) || $post['username'] == "")
{
	die("Username not specified");
}
if(!isset($post['password']) || $post['password'] == "")
{
	die("Password not specified");
}

$scapeSite = new ScapeSite($post['username'], $post['password']);
header("Content-Type: application/json");
echo json_encode($scapeSite->getDirectdials());

class ScapeSite
{
  private $username;
  private $password;
  private $cookieFile;

  public function __construct($username, $password)
  {
    $this->username = $username;
    $this->password = $password;
    $this->cookieFile = $this->getCookieFile();
  }

  private function login()
  {
    $ch = curl_init("https://secure.live.sipgate.de/signin/team");
    curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookieFile);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookieFile);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    $query = http_build_query(array(
          'username' => $this->username,
          'password' => $this->password,
          'login' => 'login'
          ));
    curl_setopt($ch, CURLOPT_POSTFIELDS, $query);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
  }

  private function getDirectdialsFromSite()
  {
    $ch = curl_init("https://secure.live.sipgate.de/ajax-fast.php/contacts/getdirectdialcontacts");
    curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookieFile);
    curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookieFile);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, "");
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
  }

  public function getDirectdials()
  {
    $res = $this->getDirectdialsFromSite();
    $contacts = json_decode($res);

    if(isset($contacts->faultCode) && $contacts->faultCode == 405)
    {
      $this->login();
      $res = $this->getDirectdialsFromSite();
      $contacts = json_decode($res);
    }

    return $contacts;
  }

  protected function getCookieFile()
  {
    return "/tmp/cookiesipgate_" . md5($this->username);
  }
}

