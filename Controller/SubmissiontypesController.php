<?php
App::uses('AppController', 'Controller');
/**
 * Towns Controller
 *
 * @property Configuration $Coniguration
 */
class SubmissiontypesController extends AppController {

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
                    $condition->property = 'UPPER(Submissiontype.code) LIKE';
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
		
		$objOrder = new Object();
		$objOrder->property = 'id';
		$objOrder->direction = 'ASC';
		
		$orderConditions = json_encode(array($objOrder));
        // reassign modified conditions
        $this->request->{$reqType}['conditions'] = $encodedConditions;
		$this->request->{$reqType}['order'] = $orderConditions;
    }

    /**
     * User is authorized for this controller/action?
     * @param $user
     * @return bool
     */
    public function isAuthorized($user) {
        // Admin can do anything
        /*if ($this->Auth->user('id') == 1) {
            return true;
        }*/
        return parent::isAuthorized($user);
    }

    /**
     * index method
     *
     * @return void
     */
    public function index() {
        // limit joins
        $this->Submissiontype->recursive = 0;
        $this->fixConditions();
		$data = $this->paginate();
		if($this->request->query['project_id'] != 'false'){
			$project_id = $this->request->query['project_id'];
			foreach($data as $key => $val){
				if($val['Submissiontype']['project_id'] != $project_id){
					unset($data[$key]);
				}
			}
		}else{
			$project_id = $this->Session->read('project_id');
			foreach($data as $key => $val){
				if($val['Submissiontype']['project_id'] != $project_id){
					unset($data[$key]);
				}
				if($val['Submissiontype']['active'] == null){
					unset($data[$key]);
				}
			}
		}		
        // remove the_geom
        foreach ($data AS &$row) {
            unset($row['Submissiontype']['the_geom']);
        }
		$data = array_values($data);
        // send output
        $this->sendRestResponse($data);
    }
	public function add() {
		if ($this->request->is('post')) {
			 $data = array('Submissiontype' => $this->request->data);
			 unset($data['Submissiontype']['id']);
			 $project_id = $this->request->query['project_id'];
			 $data['Submissiontype']['project_id'] = $project_id;
			 $this->Submissiontype->create();
			 if($this->Submissiontype->save($data)){
				 $data['Submissiontype']['id'] = $this->Submissiontype->id;
				 $success = true;
				 $result['success'] = $success;
				 $result['msg'] = 'Progetto inserito correttamente.';
				 $result['data'] = $data['Submissiontype'];
			 }
			 $this->set(array(
				'result' => $result,
				'_serialize' => array('result')
			 ));
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
		$success = false;
        $this->Submissiontype->id = $id;
		if($this->Submissiontype->save($this->request->data)){
			$message = 'Saved!';
			$success = true;
		}else{
			$this->sendRestResponse(array(),false,'Impossibile modificare i dati');
		}		
		      //recupero il dataset
        $dataSet = $this->Submissiontype->find('first',array(
            'conditions'=>array(
                'id' => $id
            )
        ));      
		$result = array(
			'success' => $success,
			'data' => $dataSet['Submissiontype'],
			'msg' => $message
		);				
		//Rispondo al server
        $this->set(
			array(
				'result' => $result,
				'_serialize' => array('result')
			)
		);
    }
	public function delete($id = null){
		
		//prendo gli ID delle submissions che hanno come tipo lo stesso selezionato da eliminare
		$this->loadModel('SubmissionTypes');
		$submissions = $this->SubmissionTypes->find('all',array());
		$ids = array();
		foreach($submissions as $row){
			if($row['SubmissionTypes']['submissiontype_id'] == $id){
				$ids[] = $row['Submission']['id'];
			}
		}
		//elimino le submission
		if($ids && count($ids) > 0){
			$this->loadModel('Submission');
			foreach($ids as $idSub){
			$this->Submission->deleteAll(array('id' => $idSub),false);
			}
		}
		//elimino i record dalla tabella comune
		$this->SubmissionTypes->deleteAll(array('submissiontype_id' => $id),false);
		
		//elimino il tipo di submission
		if ($this->Submissiontype->delete($id)) {
			$result = true;
		} else {
			$result = false;
		}
		// send response
		$this->set(array(
			'result' => $result,
			'_serialize' => array('result')
		));
	}

}