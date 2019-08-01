<?php
App::uses('AppController', 'Controller');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
/**
 * Projects Controller
 *
 * @property Project $Project
 */
class ProjectsController extends AppController {
	
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
                case 'name':
                    $condition->property = 'UPPER(Project.name) LIKE';
                    $condition->value = '%'.strtoupper($condition->value).'%';
                    $fixedConditions[] = $condition;
                break;
                case 'description':
                    $condition->property = 'UPPER(Project.description) LIKE';
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
            $this->Paginator->deniedFields = array(/*'password', 'session_id', 'can_impersonate'*/);

            $this->fixConditions();
            // do the query
            $data = $this->paginate();			
            // send response
            $this->sendRestResponse($data);
			
        } else {
            $this->Project->recursive = 0;
            $this->set('users', $this->Paginator->paginate());
        }
    }
	public function unbindedprojectsindex() {
		if (@$this->request->params['ext'] == 'json') {	
		
			$user_id = $this->params->query['user_id'];
			$user_info = $this->Project->find('all',array());
			$x = 0;
			for($i=0; $i<count($user_info); $i++) {
					for($y = 0; $y < count($user_info[$i]['UserProject']); $y++) {
					if($user_info[$i]['UserProject'][$y]['user_id'] == $user_id) {						
						unset($user_info[$i]['Project']);	
					}										
				}
				if($user_info[$i]['Project'] != null) {
					$filteredInfo['Project'][$x] = $user_info[$i]['Project'];
					$x++;
				}
			}
			$success = true;
			$msg = false;
			$this->sendRestResponse($filteredInfo);
		}else{
			$this->Project->recursive = 0;
			$this->set('projects', $this->Paginator->paginate());
		}
			
	}
	public function unbindedtownprojectsindex() {
		if (@$this->request->params['ext'] == 'json') {						
			$user_info = $this->Project->find('all',array());
			$x = 0;
			for($i=0; $i<count($user_info); $i++) {
					for($y = 0; $y < count($user_info[$i]['TownProject']); $y++) {
					if($user_info[$i]['TownProject'][$y]['town_id'] == $this->params->query['town_id']) {						
						unset($user_info[$i]['Project']);	
					}										
				}
				if($user_info[$i]['Project'] != null) {
					$filteredInfo['Project'][$x] = $user_info[$i]['Project'];
					$x++;
				}
			}
			$success = true;
			$msg = false;
		$this->sendRestResponse($filteredInfo);
		}else{
			$this->Project->recursive = 0;
			$this->set('projects', $this->Paginator->paginate());
		}
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

        $this->Project->id = $id;
        if ($this->Project->save($this->request->data)) {
            $message = 'Saved';
			$success = true;
        } else {
            $this->sendRestResponse(array(), false, 'Progetto già esistente');
            return;
        }

        //recupero il dataset
        $dataSet = $this->Project->find('first',array(
            'conditions'=>array(
                'Project.id' => $id
            )
        ));


        
		$response = array(
			'success' => $success,
			'data' => $dataSet['Project'],
			'msg' => ''
		);
		
		
		//Rispondo al server
        $this->set(
			array(
				'result' => $response,
				'_serialize' => array('result')
			)
		);
		
		return $success;
    }

    /**
     * add method
     *
     * @return void
     */
    public function add() {
        if ($this->request->is('post')) {
            // get input
            $data = array('Project' => $this->request->data);
            $success = false;
			$result = array('success' => $success, 'data' => null, 'msg' => 'Problema durante la modifica o inserimento del progetto.');
			
			//Ho l'id del progetto?
			if(!empty($data['Project']['id'])){
				$this->Project->id = (integer)$data['Project']['id'];
			}else{
				//Rimuovo l'id nullo che arriva dalla richiesta
				unset($data['Project']['id']);
				//E creo un nuovo record con id
				$this->Project->create();
			}
			if ($this->Project->save($data)) {
				//Setto il nuovo id ottenuto
				$data['Project']['id'] = $this->Project->id;
				$success = true;
				$result['success'] = $success;
				$result['msg'] = 'Progetto inserito correttamente.';
				$result['data'] = $data['Project'];
			}

			$dirAtt = new Folder($this->Session->read('settings.general.uploadPath').DS.$data['Project']['id'],true);			
			mkdir($dirAtt,0777);
			//mando la notifica
			/*$emailData = array();
			$emailData['name'] = $data['Project']['name'];
			$emailData['type'] = 'newProject'; //newUser
			$emailData['title'] = 'S.I.Geo: nuovo progetto';
			$emailData['functions'] = '.json';
			//$emailData['username'] = $data['Project']['username'];
			//$userMail = array($data['User']['email'] => $data['User']['surname'].' '.$data['User']['name']);*/
			
			//invio la mail
			//$this->sendNotificationMail($userMail,$emailData);

			// send response
			$this->set(array(
				'result' => $result,
				'_serialize' => array('result')
			));
        }
    }

	public function getProjectSettings(){
		Configure::write('debug',0);
        // action without view
        $this->autoRender = false;
        // get input
        $input = $this->request->data;
        // fb($input);
        // init output
        $settings = array();
        // loop over fields to get data
		
		
		//Controllo se ho il project_id (dovrebbe esserci sempre)
		$project_id = array_values(array_filter($input['fields'],function($value){return strpos($value,"project_id")!==false;}))[0];
		$project_id = (integer)array_pop(explode('.',$project_id));
		
		//Unset project_id
		$input['fields'] = array_flip($input['fields']);
		unset($input['fields']['project_id.'.$project_id]);
		$input['fields'] = array_flip($input['fields']);
		
		//Controllo se c'è o non c'è una configurazione nella mia tabella dei progetti per il mio progetto
		$project_configuration = $this->Project->find('first',array(
			'conditions' => array('Project.id' => $project_id),
			'fields' => 'ini_settings'
		))['Project']['ini_settings'];
		
		//se non c'è creo una configurazione
		if(is_null($project_configuration)){
			
			$ini_settings = array();
			foreach($input['fields'] as $id => $key){
				$ini_settings[$key] = null;
			}
			//la passo anche se è vuota
			$project_configuration = $ini_settings;
			
			//Ma ne salvo il json encode a db
			$ini_settings = json_encode($ini_settings);
			$this->Project->id = $project_id;
			$this->request->data['Project'] = array('ini_settings' => $ini_settings);
			$this->Project->save($this->request->data);
		}else{
			//altrimento prendo la mia configurazione a db
			$project_configuration = json_decode($project_configuration,true);			
		}
		//se c'è ciclo nel json per trovarmi tutte le informazioni
        foreach ($input['fields'] AS $fieldName) {

            if ($project_configuration[$fieldName]) {
                $settings[$fieldName] = "".$project_configuration[$fieldName]."";
            }else{
                $settings[$fieldName] = "";
            }
        }

        /*if ($this->Session->check('settings.mail.notification.from')) {
            $tokens = explode('#', $this->Session->read('settings.mail.notification.from'));
            $settings['mail.notification.from.address'] = $tokens[0];
            $settings['mail.notification.from.name'] = $tokens[1];
        }else{
            $settings['mail.notification.from.address'] = '';
            $settings['mail.notification.from.name'] = '';
        }*/

        // return output
        echo json_encode(array(
            'status' => count($settings) > 0,
            'settings' => $settings
        ));
    }
	
	public function updateProjectSettings(){
		//die('updateProjectSettings');
		Configure::write('debug',0);
		// get input
		$input = $this->request->data['values'];
        // action without view
        $this->autoRender = false;
		// init output
		$result = array('Project' => array(
			'status'=>false,
			'msg'=>'Impossibile salvare, riprovare più tardi.',
			'data' => null
		));
		$project_id = $input['project_id'];
		//Unset project_id
		$project_id_key = 'project_id.'.$project_id;
		unset($input[$project_id_key]);
		
		//Aggiorno la configurazione
		$ini_settings = $input;
		$ini_settings['general.uploadPath'] = APP.'attachments';
		//preparo la configurazione da restituire alla vista
		$result['Project']['data'] = $input;
		//Ma ne salvo il json encode a db
		$ini_settings = json_encode($ini_settings);
		$this->Project->id = $project_id;
		$this->request->data['Project'] = array('ini_settings' => $ini_settings);
		if($this->Project->save($this->request->data)){
			$result['Project']['status'] = true;
			$result['Project']['msg'] = 'Progetto salvato correttamente';
		}
        // return output
        echo json_encode(array(
            'status' => $result['Project']['status'],
            'result' => $settings
        ));
			
	}
	
	
    /**
     * delete method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function delete($id = null) {
		//projectDelete;
		if ($this->Project->delete($id)) {
			$result = true;
			$dirAtt = $this->Session->read('settings.general.uploadPath').DS.$id;
			rmdir($dirAtt);
			
			$this->loadModel('UserProject');
			$userprojects = $this->UserProject->find('all',array(
				'conditions' => array(
					'UserProject.project_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->UserProject->deleteAll(array('UserProject.project_id' => $id),false);
			}
			
			$this->loadModel('TownProject');
			$townprojects = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.project_id' => $id)));
			if($townprojects && count($townprojects)>0){
				$this->TownProject->deleteAll(array('TownProject.project_id' => $id),false);
			}
			
			$this->loadModel('Overlaylayer');
			$this->Overlaylayer->setSource('project_configuration');
			$layers = $this->Overlaylayer->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($layers && count($layers)>0){
				$this->Overlaylayer->deleteAll(array('project_id' => $id),false);
			}	
			
			$this->loadModel('Submission');
			$submissions = $this->Submission->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($submissions && count($submissions)>0){
				$this->Submission->deleteAll(array('project_id' => $id),false);
			}
			
			$this->loadModel('Submissiontype');
			$submissiontypes = $this->Submissiontype->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($submissiontypes && count($submissiontypes)>0){
				$this->Submissiontype->deleteAll(array('project_id' => $id),false);
			}
			
			$this->loadModel('Attachment');
			$attachments = $this->Attachment->find('all',array(
				'conditions' => array(
					'project_id' => $id)));
			if($attachments && count($attachments)>0){
				$this->Attachment->deleteAll(array('project_id' => $id),false);
			}
		} else {
		$result = false;
		}
		// send response
		$this->set(array(
			'result' => $result,
			'_serialize' => array('result')
		));
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
        $emailFromToken = explode("#",$MAILCONF['notification']['from']);

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
        $this->sendEmail($emailParams);

    }
}