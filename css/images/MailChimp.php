<?php

class MailChimp
{
	
	private $apiKey;
	private $apiUrl = 'https://<dc>.api.mailchimp.com/3.0/';
	
	/** 
	* Create a new instance
	* @param string $apiKey - Optional
	*/
	public function __construct($apiKey = false)
	{
		if($apiKey){ 
			$this->apiKey = $apiKey;
			list(, $datacentre) = explode('-', $this->apiKey);
			$this->apiUrl = str_replace('<dc>', $datacentre, $this->apiUrl);
		}
	}
	
	/** 
	* Method to Set Api Key
	* @param string $apiKey
	*/
	public function setApiKey($apiKey)
	{
		$this->apiKey = $apiKey;
		list(, $datacentre) = explode('-', $this->apiKey);
		$this->apiUrl = str_replace('<dc>', $datacentre, $this->apiUrl);
	}
	
	/** 
	* Magic Method to request http verb
	* @return array
	*/
	public function __call($method, $arguments)
	{
		$httpVerb = strtoupper($method);
		$allowedHttpVerbs = array('GET', 'POST', 'PATCH', 'DELETE');
		
		//Validate http verb
		if(in_array($httpVerb, $allowedHttpVerbs)){
			$endPoint = $arguments[0];
			$data = isset($arguments[1]) ? $arguments[1] : array();
			return $this->request($httpVerb, $endPoint, $data);
		}
		
		throw new \Exception('Invalid http verb!');
	}
	
	/** 
	* Call MailChimp API
	* @param string $httpVerb
	* @param string $endPoint - (http://kb.mailchimp.com/api/resources)
	* @param array $data - Optional
	* @return array
	*/
	public function request($httpVerb = 'GET', $endPoint, $data = array())
	{
		//validate API
		if(! $this->apiKey){
			throw new \Exception('MailChimp API Key must be set before making request!');
		}
		
		$endPoint = ltrim($endPoint, '/');
		$httpVerb = strtoupper($httpVerb);
		$requestUrl = $this->apiUrl.$endPoint;
		
		return $this->curlRequest($requestUrl, $httpVerb, $data);
	}
	
	/** 
	* Request using curl extension
	* @param string $url
	* @param string $httpVerb
	* @param array $data - Optional
	* @return array
	*/
	private function curlRequest($url, $httpVerb, array $data = array(), $curlTimeout = 15)
	{
		if(function_exists('curl_init') && function_exists('curl_setopt')){
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
			curl_setopt($ch, CURLOPT_USERAGENT, 'VPS/MC-API:3.0');
			curl_setopt($ch, CURLOPT_TIMEOUT, $curlTimeout);
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
			curl_setopt($ch, CURLOPT_USERPWD, "user:".$this->apiKey);
			curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $httpVerb);
			
			//Submit data
			if(!empty($data)){
				$jsonData = json_encode($data);
				curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
			}
			
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
			$result = curl_exec($ch);
			curl_close($ch);
			
			return $result ? json_decode($result, true) : false;
		}

		throw new \Exception('curl extension is missing!');
	}
}