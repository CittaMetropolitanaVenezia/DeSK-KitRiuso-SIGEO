<?php
App::uses('AppController', 'Controller');
/**
 * Towns Controller
 *
 * @property Configuration $Coniguration
 */
class TownsController extends AppController {

    /**
     * Components
     *
     * @var array
     */
    public $components = array('RequestHandler');

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
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
                case 'code':
                    $condition->property = 'UPPER(Town.code) LIKE';
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

    /**
     * User is authorized for this controller/action?
     * @param $user
     * @return bool
     */
    public function isAuthorized($user) {
        // Admin can do anything
        if ($this->Auth->user('id') == 1) {
            return true;
        }
        return parent::isAuthorized($user);
    }
	
	
	
	public function townscomboindex() {
		$project_id = $this->Session->read('project_id');
		$this->loadModel('TownProject');
		$data = $this->TownProject->find('all',array(
			'conditions' => array(
				'TownProject.project_id' => $project_id)));
		$this->sendRestResponse($data);
	}
    /**
     * index method
     *
     * @return void
     */
    public function index() {
        // limit joins
        $this->Town->recursive = 0;

        $this->fixConditions();

        // paginate data
        $data = $this->paginate();
        // remove the_geom
        foreach ($data AS &$row) {
            unset($row['Town']['the_geom']);
        }
        // send output
        $this->sendRestResponse($data);
    }
	public function add() {
		//Sono un amministratore?
        if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }

        if ($this->request->is('post')) {
            // get input
            $data = array('Town' => $this->request->data);
            $success = false;
            // remove null id
            unset($data['Town']['id']);     
                // create new town
                $this->Town->create();
                //carico il project model
                $TownModel = ClassRegistry::init('Town');
                // try to save the record
                if ($this->Town->save($data)) {
                    // set new ID
                    $data['Town']['id'] = $this->Town->id;
                    $success = true;
                }
                // send response
                $this->set(array(
                    'result' => array('success' => $success, 'data' => $data['Town'], 'msg' => ''),
                    '_serialize' => array('result')
                ));
        }
	}
	public function delete($id=null){
		 if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }		
        if ($this->Town->delete($id)) {
            $success = true;
			$this->loadModel('TownProject');
			$userprojects = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.town_id' => $id)));
			if($userprojects && count($userprojects)>0){
				$this->TownProject->deleteAll(array('TownProject.town_id' => $id),false);
			}
        } else {
            $success = false;
        }

        $this->sendRestResponse(array());

	}

    /**
     * edit method
     *
     * @throws NotFoundException
     * @param string $id
     * @return void
     */
    public function edit($id = null) {
        

            //controllo che non ci sia una mail gia inserita di un altro utente
            if (isset($this->request->data['email']) AND $this->request->data['email'] AND $this->request->data['email']!= "") {
                $checkE = $this->Town->find('all',
                    array('conditions'=>
                        array(
                            'Town.gid <>' => $id,
                            'Town.email' => $this->request->data['email']
                        )
                    )
                );

                //email esistente mando errore e esco
                if (isset($checkE) AND $checkE AND count($checkE)>0 ) {
                    $this->sendRestResponse(array(), false, 'Email già presente nel Database');
                    return;
                }
            }
			
			
		$this->Town->id = $id;	
		if ($this->Town->save($this->request->data)) {
            $message = 'Saved';
			$success = true;
        } else {
            $this->sendRestResponse(array(), false, 'Città già esistente');
            return;
        }

        //recupero il dataset
        $dataSet = $this->Town->find('first',array(
            'conditions'=>array(
                'gid' => $id
            )
        ));


        
		$response = array(
			'success' => $success,
			'data' => $dataSet['Town'],
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

}