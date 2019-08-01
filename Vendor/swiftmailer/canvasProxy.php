<?php
/*
  html2canvas-proxy-php 0.0.4
  Copyright (c) 2013 Guilherme Nascimento (brcontainer@yahoo.com.br)

  Released under the MIT license
*/

error_reporting(E_ALL|E_STRICT);//disable/enable errors eg: error connection

define('EOL',chr(10));
define('WEOL',chr(13));
define('GMDATECACHE', gmdate('D, d M Y H:i:s'));

//Setup
define('PATH','images');//Path relative
define('CCACHE', 60 * 5 * 1000);//Limit access-control and cache
define('TIMEOUT',30);//Timeout from load SERVER

//set access-control
header('Access-Control-Max-Age:' . CCACHE);
header('Access-Control-Allow-Origin: *');
header('Access-Control-Request-Method: *');
header('Access-Control-Allow-Methods: OPTIONS, GET');
header('Access-Control-Allow-Headers: *');

//mime
header('Content-Type: application/javascript');

if(isset($_GET['url']{0}, $_GET['callback']{0})){
	$uri = parse_url($_GET['url']);
	$secure = strcasecmp($uri['scheme'],'https')===0;
	if(!in_array($uri['scheme'], Array('http','https'))){
		$err = 'the '.$uri['scheme'].' scheme is invalid';
	} else {
		$fp = NULL;

		$saveFile = false;
		$exist = is_dir(PATH);
		$locationFile = '';
		$token = '';
		
		$errno = 0;
		$errstr = '';
		$err = '';

		if(!$exist){
			$exist = mkdir(PATH, 755);
		}
		if($exist){
			$token = mt_rand(0,1000).'_'.(isset($_SERVER['REQUEST_TIME']) ? $_SERVER['REQUEST_TIME'] : time());
			$locationFile = PATH . '/' . sha1($_GET['url']);
			$sf = fopen($locationFile.'.'.$token,'w');
		}

		if($exist && $sf){
			$fp = fsockopen(
				($secure ? 'ssl://':'') . $uri['host'],
				isset($uri['port']) ? $uri['port']:(
					$secure ? 443 : 80
				),
				$errno, $errstr, TIMEOUT
			);
			if($fp && $errno!=0){
				$err = 'CONNECTION ERROR '.$errno;
				fclose($fp);
				$fp = null;
			}
			
			if($fp){
				fwrite(
					$fp,'GET ' . (
						isset($uri['path']) ? $uri['path']:'/'
					) . (
						isset($uri['query']) ? ('?'.$uri['query']):''
					) . ' HTTP/1.1' . EOL
				);

				if(isset($_SERVER['HTTP_ACCEPT']{0})){
					fwrite($fp,'Accept: ' . $_SERVER['HTTP_ACCEPT'] . EOL);
				}
				if(isset($_SERVER['HTTP_USER_AGENT']{0})){
					fwrite($fp,'User-Agent: ' . $_SERVER['HTTP_USER_AGENT'] . EOL);
				}
				fwrite($fp,'Host: ' . $uri['host'] . EOL);
				fwrite($fp,'Connection: close' . EOL);
				fwrite($fp, EOL);

				$isBody = false;
				$allowMimes = Array(
					'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
					'text/html', 'application/xhtml', 'application/xhtml+xml'
				);

				while(!feof($fp)){
					if(($data = fgets($fp))===false){
						continue;
					}
					if($isBody===false){
						if(stripos($data,'HTTP/1.')===0){
							$tmp = preg_replace('#(HTTP/1[.]\d |[^0-9])#i','',$data);
							$err = stripos($tmp,'20')!==false ? '' : ('Request error '.$tmp.': '.$_GET['url']);
							if($err!==''){ break; }
						} else if(stripos($data,'content-type:')===0){
							$mime = trim(
								str_replace('content-type:','',
									str_replace('/x-','/',strtolower($data))
								)
							);
							if(!in_array($mime, $allowMimes)){
								$err = $mime.' mime is invalid';
								break;
							}
						}
					}
					if($isBody===false && trim($data)===''){
						$isBody = true;
						continue;
					}

					if($isBody===true){
						fwrite($sf,$data);
					}
				}
				$data = '';

				fclose($sf);
				fclose($fp);

				if($mime===false){
					$err = 'Server did not return the mimetype';
				}

				clearstatcache();
				$source = file_exists($locationFile.'.'.$token);
				if($err!==''){
					if($source){
						unlink($locationFile.'.'.$token);
					}
				} else {
					$size = filesize($locationFile.'.'.$token)>0;

					if($source && $size){
						$cache = CCACHE-1;

						$mime = str_replace(Array('image/','text/','application/'),'',$mime);
						$mime = str_replace('xhtml+xml','xhtml',$mime);

						if(!rename($locationFile.'.'.$token, $locationFile.'.'.$mime)){
							$err='File no data';
						} else {
							//set cache
							header('Last-Modified: ' . GMDATECACHE . ' GMT');
							header('ETag: ' . md5(GMDATECACHE . ' GMT'));
							header('Cache-Control: max-age=' . $cache . ', must-revalidate');
							header('Pragma: max-age=' . $cache);
							header('Expires: ' . gmdate('D, d M Y H:i:s', $_SERVER['REQUEST_TIME'] + $cache));

							echo $_GET['callback'],'(',
								json_encode(
									($_SERVER['SERVER_PORT']==443 ? 'https':'http://').
									$_SERVER['HTTP_HOST'].
									($_SERVER['SERVER_PORT']==80 || $_SERVER['SERVER_PORT']==443 ? '':(':'.$_SERVER['SERVER_PORT'])).
									dirname($_SERVER['SCRIPT_NAME']).'/'.
									$locationFile.'.'.$mime
								),
							')';
							exit;
						}
					} else if($err===''){
						if($size===false){
							$err='File no data';
						} else if($source===false){
							$err='no such file';
						}
					}
				}
			} else {
				$err = 'CONNECTION ERROR '.$errno;
			}
		}

		$fp = null;
	}
} else if(!isset($_GET['url']{0})){
	$err = 'No such param "url"';
} else if(!isset($_GET['callback']{0})){
	$err = 'No such param "callback"';
}
header('Pragma: no-cache');
header('Cache-control: no-cache');
header('Expires: '. GMDATECACHE .' GMT');

echo $_GET['callback'],'(' , json_encode('error:'.$err) , ')';
?>