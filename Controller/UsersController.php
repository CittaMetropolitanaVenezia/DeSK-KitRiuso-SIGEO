<?php
App::uses('AppController', 'Controller');

/**
 * Users Controller
 *
 * @property User $User
 */
class UsersController extends AppController {

    public function beforeFilter() {
        parent::beforeFilter();
        $this->Auth->allow(
            'login',
            'logout',
            'checksession',
            'changepwd',
			'phpinfos'
        );
    }
	
    private function fixConditions() {
        // get request type (GET or POST)
        $reqType = ($this->request->is('post')) ? 'data' : 'query';
        // get conditions
        $conditions = (array_key_exists('conditions', $this->request->{$reqType}) ? json_decode($this->request->{$reqType}['conditions']) : array());
        // loop over conditions (and overwrite)
        $fixedConditions = array();
        // loop over passed conditions
        foreach ($conditions AS $condition) {
            switch ($condition->property) {
                case 'town_id':
                    $condition->property = 'UPPER(User.town_name) LIKE';
                    $condition->value = '%'.strtoupper($condition->value).'%';
                    $fixedConditions[] = $condition;
                break;
                default:
                    $fixedConditions[] = $condition;
                    break;
            }
        }
        // encode
        $encodedConditions = json_encode($fixedConditions);

        // reassign modified conditions
        $this->request->{$reqType}['conditions'] = $encodedConditions;
    }

    public function index() {
        if (@$this->request->params['ext'] == 'json') {
            // remove unwanted fields
            $this->Paginator->deniedFields = array('password', 'session_id', 'can_impersonate');

            $this->fixConditions();
            // do the query
            $data = $this->paginate();
            // send response
            $this->sendRestResponse($data);
        } else {
            $this->User->recursive = 0;
            $this->set('users', $this->Paginator->paginate());
        }
    }

    public function checksession() {
		//Configure::write('debug',2);
        // already logged in -> return configuration
        if ($this->Auth->loggedIn()) {
			if($this->Session->read('project_id')){
				$project_id = $this->Session->read('project_id');
				if(!$project_id != $this->request['data']['project_id']){
					$project_id = $this->request['data']['project_id'];
				}
			}else{
			$project_id = $this->request['data']['project_id'];			
			}
			if($this->Session->read('user_id')){
				$user_id = $this->Session->read('user_id');
				if(!$user_id != $this->request['data']['user_id']){
					$user_id = $this->request['data']['user_id'];
				}
			}else{
			$user_id = $this->request['data']['user_id'];			
			}
			$this->loadModel('Project');
			$selectedProject = $this->Project->find('first',array(
				'conditions' => array(
					'id' => $project_id)));
			$settings = json_decode($selectedProject['Project']['ini_settings'],true); 
			if(!$settings['general.title']){
				$this->sendLoginResponse(false,array(),'Il progetto selezionato non ha alcuna impostazione. Contattare l\'amministrazione.');
			}else{
			$msg = '';
			$this->loadModel('Project');
			$is_active = $this->Project->find('first',array(
				'conditions' => array(
					'id' => $project_id),
				'fields' => array(
					'active')));
			//se progetto non attivo lo carica solo admin		
			if(!$is_active['Project']['active']){
				$msg = 'Il progetto non è attivo';
			}
			
		
			//carico la configurazione dei layer dal db
			$this->loadModel('Overlaylayer');
			$this->Overlaylayer->setSource('project_configuration');
			$layers_association = $this->Overlaylayer->find('first', array(
				'conditions' => array('project_id' => $project_id)
				));
			$layers_configurations = json_decode($layers_association['Overlaylayer']['layers_configurations'],true);
				//creo l'array dei base layer
				for($i=0; $i<count($layers_configurations['Baselayers']); $i++) {
					$tempblayers[$i]['type'] = $layers_configurations['Baselayers'][$i]['type'];
					$tempblayers[$i]['title'] = $layers_configurations['Baselayers'][$i]['title'];
					$tempblayers[$i]['url'] = $layers_configurations['Baselayers'][$i]['url'];
					$tempblayers[$i]['options']['attribution'] = $layers_configurations['Baselayers'][$i]['options_attribution'];
					$tempblayers[$i]['options']['maxZoom'] = $layers_configurations['Baselayers'][$i]['options_maxZoom'];
					if($layers_configurations['Baselayers'][$i]['type'] == 'tms'){
						$tempblayers[$i]['options']['tms'] = true;
					}
				}
				//creo l'array degl'overlay layer
				for($i=0; $i<count($layers_configurations['Overlaylayers']); $i++) {
					$tempolayers[$i]['photo'] = $layers_configurations['Overlaylayers'][$i]['photo'];
					$tempolayers[$i]['username'] = $layers_configurations['Overlaylayers'][$i]['username'];
					$tempolayers[$i]['password'] = $layers_configurations['Overlaylayers'][$i]['password'];
					$tempolayers[$i]['code'] = $layers_configurations['Overlaylayers'][$i]['code'];
					$tempolayers[$i]['title'] = $layers_configurations['Overlaylayers'][$i]['title'];
					$tempolayers[$i]['url'] = $layers_configurations['Overlaylayers'][$i]['url'];
					$tempolayers[$i]['options']['layers'] = $layers_configurations['Overlaylayers'][$i]['options_layers'];
					$tempolayers[$i]['options']['format'] = $layers_configurations['Overlaylayers'][$i]['options_format'];
					$tempolayers[$i]['options']['attribution'] = $layers_configurations['Overlaylayers'][$i]['options_attribution'];
					$tempolayers[$i]['active'] = $layers_configurations['Overlaylayers'][$i]['active'];
					if($layers_configurations['Overlaylayers'][$i]['options_transparent'] == 1){
						$tempolayers[$i]['options']['transparent'] = true;
					}else{
						$tempolayers[$i]['options']['transparent'] = false;
					}
				}	
			//utente loggato
			$loggedUser = $this->User->find('first',array(
			'conditions' => array('id' => $user_id) ));
			
			//carico la configurazione del progetto da db
			
				//rimuovo la chiave dei settings dai dati(general,map,geometries,mail)
				foreach($settings as $key => $val){
					$explodedKey = explode('.',$key, 2);
					$explodedSettings[$explodedKey[1]] = $val;
				}
				
				
				//prendo la parte di configurazione statica dal file config del sistema (geodbt e print)
				$parsed_sett = parse_ini_file(APP.'Config/settings.ini',true);
				
				$printSettings['url'] = $parsed_sett['map']['print.url'];
				$printSettings['qgisUrl'] = $parsed_sett['map']['print.qgisUrl'];
				$printSettings['layers'] = $parsed_sett['map']['print.layers'];
				$printSettings['mapWidth'] = $parsed_sett['map']['print.mapWidth'];
				
				$geodbtBase['attribution'] = $parsed_sett['map']['geodbt.base.attribution'];
				$geodbtBase['featureinfo']['endpoint'] = $parsed_sett['map']['geodbt.base.featureinfo.endpoint'];
				$geodbtBase['featureinfo']['geoJSONEndPoint'] = $parsed_sett['map']['geodbt.base.featureinfo.geoJSONEndPoint'];
				$geodbtBase['featureinfo']['layers'] = $parsed_sett['map']['geodbt.base.featureinfo.layers'];
				$geodbtBase['featureinfo']['mapendpoint'] = $parsed_sett['map']['geodbt.base.featureinfo.mapendpoint'];
				$geodbtBase['layers'] = $parsed_sett['map']['geodbt.base.layers'];
				$geodbtBase['url'] = $parsed_sett['map']['geodbt.base.url'] ;
				$general = array (
					'startDate' => $explodedSettings['startDate'],
					'endDate' => $explodedSettings['endDate'],
					'uploadLimit' => $explodedSettings['uploadLimit'],
					'uploadPath' => $explodedSettings['uploadPath'],
					'maxUserXtown' => $explodedSettings['maxUserXtown'],
					'enableInfo' => $explodedSettings['enableInfo'],
					'enablePrint' => $explodedSettings['enablePrint']
					);
				$mail = array (
					'smtp.host' => $explodedSettings['smtp.host'],
					'smtp.user' => $explodedSettings['smtp.user'],
					'smtp.port' => $explodedSettings['smtp.port'],
					'smtp.pswd' => $explodedSettings['smtp.pswd'],
					'notification.from' => $explodedSettings['notification.from.address'].'#'.$explodedSettings['notification.from.name'],
					'subject.newSubmission' => $explodedSettings['subject.newSubmission'],
					'subject.newOpinion' => $explodedSettings['subject.newOpinion']);
				
				$map = array (
					'dataProj' => $explodedSettings['dataProj'],
					'displayProj' => $explodedSettings['displayProj'],
					'draw' => array(
							'buffer' => $explodedSettings['draw.buffer']),
					'geodbt' => array(
						'base' => $geodbtBase),
					'layers' => array(
						'base' => $tempblayers ,
						'minimap' =>array(
								'options' => array(
									'attribution' =>$explodedSettings['layers.minimap.options.attribution'] ,
									'maxZoom' => $explodedSettings['layers.minimap.options.maxZoom']),
								'url' => $explodedSettings['layers.minimap.url']) ,
						'overlay' => $tempolayers,
								),
					'print' =>$printSettings);
			
	
				
				//importo il controller per utilizzare funzioni riguardanti la configurazione
				 App::import('Controller', 'Configurations');
				$ConfigurationFunctions = new ConfigurationsController();
				//towndata
				$townData = $ConfigurationFunctions->_loadTownData($loggedUser['User']['town_id'], $explodedSettings['draw.buffer'],$project_id);
			
				//submissions_enable
				
				$submissions_enable = $ConfigurationFunctions->_projectCheckSubmissionsPeriodLimit($explodedSettings);
				$Configuration = array(
					'loggedin' => true,
					'settings' => array(
						'title' => $explodedSettings['title'],
						'user' => $loggedUser['User'],
						'enableInfo' => $explodedSettings['enableInfo'],
						'enablePrint' => $explodedSettings['enablePrint'],
						'drawOverLimits' => $explodedSettings['drawOverLimits'],
						'submissions_enable' => $submissions_enable,
						'startDate' => $explodedSettings['startDate'] ,
						'endDate' => $explodedSettings['endDate'],
						'xmin' => $explodedSettings['x_min'],
						'ymin' => $explodedSettings['y_min'],
						'xmax' => $explodedSettings['x_max'],
						'ymax' => $explodedSettings['y_max'],
						'geometries' => array(
							'allow_line' => $explodedSettings['allow_line'],
							'allow_point' => $explodedSettings['allow_point'],
							'allow_polygon' => $explodedSettings['allow_poligon']),
						'map' => array(
							'controls' => array(),
							'dataProj' => $explodedSettings['dataProj'],
							'displayProj' => $explodedSettings['displayProj'],
							'draw' => array(
								'buffer' => $explodedSettings['draw.buffer']),
							'geodbt' => array(
								'base' => $geodbtBase),
							'layers' => array(
								'base' => $tempblayers ,
								'minimap' =>array(
									'options' => array(
										'attribution' =>$explodedSettings['layers.minimap.options.attribution'] ,
										'maxZoom' => $explodedSettings['layers.minimap.options.maxZoom']),
									'url' => $explodedSettings['layers.minimap.url']) ,
								'overlay' => $tempolayers,
								),
							'print' =>$printSettings ,
							'town_buffer_geojson' =>$townData['buffer'],
							'town_max_bounds' => $townData['bounds'],
							'town_neighbors' => $townData['neighbors'])),
					'labels' => null
						); 
						
						
				// get configuration
				//$conf = $ConfigurationFunctions->get($this->Auth, $this->Session);
				$this->Session->write('project_id', $project_id);
				$this->Session->write('user_id', $user_id);
				$this->Session->write('settings', array(
				'general' => $general,
				'mail' => $mail,
				'map' => $map,
				'labels' => null
				));
				// send response
				$this->sendLoginResponse(true, $Configuration, $msg);
			}
        } else {
            $this->sendLoginResponse(false);
        }
    }

    /**
     * login method
     */
    public function login() {
        // check login
        if ($this->Auth->login()) {

            //inserisco sul db il tentativo di login
            $StatisticModel = ClassRegistry::init('Statistic');
            $arrTosave = array(
              'Statistic' =>array(
                  'id' => false,
                  'user_id' => $this->Auth->user('id'),
                  'statistic_type' => 'access'
              )
            );

            $StatisticModel->save($arrTosave);

            // controllo la validata e se attivo
            $active = $this->Auth->user('active');
            if (!$active) {
                $this->sendLoginResponse(false, array(), "Utenza non attiva");
            }
            // check OTP
            if ($this->Auth->user('otp')) {
                $myFile = APP . 'Config/settings.ini';
				$settings = parse_ini_file($myFile,true);
				$message = $settings['general']['message'];
				
                $this->sendLoginResponse(false, array('otp' => true, 'message' => $message), "Primo accesso, cambia la tua password");
            }
            // update last_login date/time
            $this->User->id = $this->Auth->user( 'id' );
            $this->User->saveField( 'last_login', date( 'Y-m-d H:i:s' ) );
            // update current session id (in user record)
            $this->User->id = $this->Auth->user( 'id' );
            $this->User->saveField( 'session_id', $this->Session->id() );
            // redirect to generic checksession method
            //$this->checksession();
			$this->loadModel('UserProject');
			$userProjects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.user_id' => $this->User->id)));
			if(count($userProjects)>0){
			$this->sendLoginResponse(true,$this->User->id);
			}else{
			$this->sendLoginResponse(false,array(),'Impossibile effettuare l\'accesso, l\'utente corrispondente alle credenziali non è associato a nessun progetto.');
			}
        }
        // send response
        $this->sendLoginResponse(false, array(), 'Credenziali errate, riprovare.');
    }

    /**
     * logout method
     */
    public function logout() {
        // redirect to login page
        $this->Auth->logout();
		$this->Session->destroy();
        return $this->redirect('/');
    }

    /**
     * renew password, after using OTP
     */
    public function changepwd() {


        // get input
        $input = $this->request->data;
        // 767852d17b8638176563dd75a5d779083248e358
        // password confirmation check
        if ($input['new_password'] == $input['confirm_new_password']) {
            // login check
            if ($this->Auth->login()) {
                // get user record
                $userData = $this->Auth->user();
                // encrypt new password
                $userData['password'] = $input['new_password'];
                // update last renew date
                $userData['last_renew'] = date('Y-m-d H:i:s');
                // update date_otp date
                $userData['date_otp'] = date('Y-m-d H:i:s');
                // reset otp flag
                $userData['otp'] = false;
                // set current user id
                $this->User->id = $userData['id'];
                // set user record
                $userRecord = array('User' => $userData);
                // save/update user record
                if ($this->User->save($userRecord)) {
                    //$this->checksession();
					$this->sendLoginResponse(true);
                } else {
                    $this->Auth->logout();
                    $this->sendLoginResponse(false, 'Impossibile aggiornare la password in questo momento');
                }
            } else {
                $this->sendLoginResponse(false, 'Password corrente errata');
            }
        } else {
            $this->sendLoginResponse(false, 'Password non coincidenti');
        }
    }

    /**
     * Helper method to all login messages
     *
     * @param $status
     * @param string $message
     */
    private function sendLoginResponse($status, $data = array(), $message="") {
        // action without view
        $this->autoRender = false;
        // status is false, logout Auth component
        if ($status != TRUE) $this->Auth->logout();
        // send response
        echo json_encode(array(
            'success' => $status,
            'message' => $message,
            'data' => $data
        ));
        exit;
    }

    /**
     * edit method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function edit($id = null) {

        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        $this->User->id = $id;

        //controllo il numero massimo di utenti con quel comune
        $maxUserXtown = $this->Session->read('settings.general.maxUserXtown');
        if (isset($this->request->data['town_id']) AND $this->request->data['town_id'] != 0) { //se non è provincia
            $checkMaxUserNumber = $this->User->find('first',array(
                'conditions'=>array("User.town_id" => $this->request->data['town_id']),
                'fields' => array('COUNT(*) as user_count'),
                'group' => 'User.town_id'
            ));
        }

        if (isset($checkMaxUserNumber) AND $checkMaxUserNumber AND $checkMaxUserNumber[0]['user_count'] >= $maxUserXtown) {
            $this->sendRestResponse(array(), false, 'Raggiunto il numero massimo di utenti per questo comune');
            return;
        }

        //controllo che non ci sia una mail gia inserita di un altro utente
        if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
            $checkE = $this->User->find('all',
                array('conditions'=>
                    array(
                        'User.id <>' => $id,
                        'User.email' => $this->request->data['email']
                    )
                )
            );

            //email esistente mando errore e esco
            if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                return;
            }
        }


        if (isset($this->request->data['town_id'])) {
            //recupero il town_name
            //carico il town model
            $TownModel = ClassRegistry::init('Town');

            //recupero il nome del comune
            $townData = $TownModel->find('first',array(
                'conditions' => array(
                    'gid' => $this->request->data['town_id']
                )
            ));

            $this->request->data['town_name'] = $townData['Town']['name'];
        }

        if ($this->User->save($this->request->data)) {
            $message = 'Saved';
        } else {
            $this->sendRestResponse(array(), false, 'Email già presente nel Database');
            return;
        }

        //recupero il dataset
        $dataSet = $this->User->find('first',array(
            'conditions'=>array(
                'User.id' => $id
            )
        ));

        $success = true;
        $this->set(array(
            'result' => array('success' => $success, 'data' => $dataSet['User'], 'msg' => ''),
            '_serialize' => array('result')
        ));
    }

    /**
     * add method
     *
     * @return void
     */
    public function add() {

        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        if ($this->request->is('post')) {
            // get input
            $data = array('User' => $this->request->data);
            $success = false;
            // remove null id
            unset($data['User']['id']);
            //check if username exists
            $checkU = $this->User->find('count',
                array('conditions'=>
                    array(
                        'User.username' => trim($data['User']['username'])
                    )
                )
            );
            //controllo se sto rispettando il numero massimo di utenti consentiti
            $maxUserXtown = $this->Session->read('settings.general.maxUserXtown');
            if ($this->request->data['town_id'] != 0) { //se non è provincia
                $checkMaxUserNumber = $this->User->find('first',array(
                   'conditions'=>array("User.town_id" => $this->request->data['town_id']),
                   'fields' => array('COUNT(*) as user_count'),
                   'group' => 'User.town_id'
                ));
            }

            //controllo se esiste un utente con una mail uguale
            if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
                $checkE = $this->User->find('all',
                    array('conditions'=>
                        array(
                            'User.email' => $this->request->data['email']
                        )
                    )
                );
            }
            //username esistente mando errore
            if (isset($checkU) AND $checkU AND count($checkU)>0 ) {
                $this->sendRestResponse(array(), false, 'Username già presente');
            }
            /*else if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                return;
            }
            else if (isset($checkMaxUserNumber) AND $checkMaxUserNumber AND $checkMaxUserNumber[0]['user_count'] >= $maxUserXtown) {
                $this->sendRestResponse(array(), false, 'Raggiunto il numero massimo di utenti per questo comune');
                return;
            }*/
            else {

                // create new record
                $this->User->create();
                //creo una password temporanea
                $data['User']['computepassword'] = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
                $data['User']['password'] = $data['User']['computepassword'];

                //carico il town model
                $TownModel = ClassRegistry::init('Town');

                //recupero il nome del comune
                $townData = $TownModel->find('first',array(
                   'conditions' => array(
                       'gid' => $data['User']['town_id']
                   )
                ));

                if (isset($townData) AND count($townData) > 0) {
                    $data['User']['town_name'] = $townData['Town']['name'];
                }
                else {
                    $data['User']['town_name'] = "ADMIN";
                }
                $data['User']['otp'] = true;
				if($data['User']['town_name'] == "ADMIN"){
					$data['User']['is_admin'] = true;
				}
                // try to save the record
                if ($this->User->save($data)) {
                    // set new ID
                    $data['User']['id'] = $this->User->id;
                    $success = true;
                }

                //mando la notifica
                $emailData = array();

                $emailData['computepassword'] = $data['User']['computepassword'];
                $emailData['type'] = 'newUser';
                $emailData['title'] = 'SI.C.L.A.: nuovo utente';
                $emailData['functions'] = '.json';
                $emailData['username'] = $data['User']['username'];

                $userMail = array($data['User']['email'] => $data['User']['surname'].' '.$data['User']['name']);
                //invio la mail
                $this->sendNotificationMail($userMail,$emailData);

                // send response
                $this->set(array(
                    'result' => array('success' => $success, 'data' => $data['User'], 'msg' => ''),
                    '_serialize' => array('result')
                ));
            }
        }
    }

    /**
     * delete method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
     public function delete($id = null) {
		
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        if ($this->User->delete($id)) {
            $success = true;
			$this->loadModel('UserProject');
			$userprojects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.user_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->UserProject->deleteAll(array('UserProject.user_id' => $id),false);
			}
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

    }

    /**
     * regeneratePassword method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function generatePassword() {

        $data = array();
        $msgError = "";

        $params = $this->params->data;

        $id = $params['id'];

        //recupero il record
        $dataUser = $this->User->find('first',array(
            'conditions' => array(
                'User.id' => $id
            )
        ));


        //non serve rigenerare
        if ($dataUser['User']['otp']) {
            $computepassword = $dataUser['User']['computepassword'];
        }
        else { //rigenero
            $computepassword = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
            $password = $computepassword;

            $arrToUpd = array(
                'User' => array(
                    'id' => $id,
                    'password' => $password,
                    'computepassword' => $computepassword,
                    'otp' => true
                )
            );

            if ($this->User->save($arrToUpd)) {
                $success = true;
                $msg = "";
            } else {
                $success = false;
                $msgError = "Errore del server!";
            }
        }

        $data['computepassword'] = $computepassword;

        $emailData['computepassword'] = $computepassword;
		$emailData['username'] = $dataUser['User']['username'];
        $emailData['type'] = 'generatePassword';
        $emailData['title'] = 'S.I.Geo.: nuova password';
        $emailData['functions'] = '/generatePassword';

        $userMail = array($dataUser['User']['email'] => $dataUser['User']['surname'].' '.$dataUser['User']['name']);
        //invio la mail
        $this->sendNotificationMail($userMail,$emailData);

        $success = true;
        //send response
        $this->sendJsonResponse($data,$success,$msgError);

    }

    /**
     * send a mail to provincia and all involved towns
     */
    private function sendNotificationMail($emailUsers,$emailData) {

        //load xtemplate class
        require_once ROOT . DS. APP_DIR . DS.'Vendor'.DS.'xtpl'.DS.'xtemplate.class.php';

        $MAILCONF = $this->Session->read('settings.mail');

        //spedisco


        //recupero l'oggetto
        if (isset($MAILCONF['subject']['generatePassword']) AND  $MAILCONF['subject']['generatePassword'] != "") {
            $subject = $MAILCONF['subject'][$emailData['type']];
        }
        else {
            $subject  = "S.I.Geo. - account password";
        }

        if ($emailData['type'] == 'generatePassword') {
            //$bodyMessage = "<p>La password per accedere ai servizi S.I.Geo. &egrave;:</p>";
			$bodyMessage = "<p>La credenziali per accedere ai servizi S.I.Geo. sono:</p>";
			$bodyMessage .= "<p>Username: <b>".$emailData['username']."</b></p>";
            $bodyMessage .= "<p>Password: <b>".$emailData['computepassword']."</b></p>";

        }
        else if ($emailData['type'] == 'newUser') {
            $bodyMessage = "<p>Benvenuto nel sistema informativo S.I.Geo.</p>";
            $bodyMessage .= "<p>I dati per accedere al servizio sono:<br></p>";
            $bodyMessage .= "username: <b>".$emailData['username']."</b><br>";
            $bodyMessage .= "password: <b>".$emailData['computepassword']."</b>";
        }
        //from email
        $emailFromToken = explode("#",$MAILCONF['notification.from']);

        $from = array($emailFromToken[0]=>$emailFromToken[1]);


        //setto il template
        $tpl = new XTemplate(ROOT.DS.APP_DIR.DS.'Config'.DS.'mailTemplate'.DS.'mail.html');
        //assegno i dati al template
        $tpl->assign('mainTitle',$emailData['title']);

        //find pathurl
        App::uses('HtmlHelper', 'View/Helper');
        $html = new HtmlHelper(new View());

        $imgHeaderPath = str_replace("users".$emailData['functions'],"",$html->url(null,true)).'/resources/login/header.png';
        $tpl->assign('headerPath',$imgHeaderPath);

        //assegno l'url dell applicazione
        $appUrl = str_replace("users".$emailData['functions'],"",$html->url(null,true));

        $tpl->assign('appUrl',$appUrl);

        //assegno i dati al template
        $tpl->assign('bodyMessage',$bodyMessage);

        $tpl->parse('main');

        $emailMessage = $tpl->text('main');

        //passo anche il disclaimer

        $emailParams = array(
            'subject' => $subject,
            'emailMessage' => $emailMessage,
            'to' => $emailUsers,
            'from' => $from
            //'attachment' => WWW_ROOT.'files'.DS.'disclaimer.pdf'
        );

        //invio la mail
        $this->sendEmail($emailParams, $MAILCONF);

    }

    public function export() {
        // set header array
        $headerLabels = Array();

        $headerLabels['username'] = "Username";
        $headerLabels['email'] = "Email";
        $headerLabels['town_name'] = "Comune";
        $headerLabels['otp'] = "Login";
        $headerLabels['name'] = "Nome";
        $headerLabels['surname'] = "Cognome";


        // get data
        $data = $this->User->find('all',array(
            'conditions' => array('User.town_id <>' => 0),
            'fields' => array('username','email','town_name','otp','name','surname')
        ));

        $data = Set::extract($data, '{n}.User');

        // fix data for output
        // fix output array (removing unwanted fields)
        foreach ($data AS &$row) {
            if ($row['otp']) $row['otp'] = 'NO';
            else $row['otp'] = 'SI';
        }

        $fileNameType = 'Utenti';
        // send to the view
        $this->set('header', array_values($headerLabels));
        $this->set('data', $data);
        $this->set('fileNameType', $fileNameType);
    }

}