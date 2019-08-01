<?php
App::uses('AppController', 'Controller');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
/**
 * Baselayers Controller
 *
 * @property Baselayer $Baselayer
 */
class BaselayersController extends AppController {

    public function beforeFilter() {
        parent::beforeFilter();
        $this->Auth->allow(
            'checksession'
        );
    }

    private function fixConditions() {
		Configure::write('debug',0);
		

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

	//Recupero i baselayers
    public function index() {
		$this->Baselayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];
		if (@$this->request->params['ext'] == 'json') {
			$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id
					)
				));	
			if(count($project_configuration)>0){
				$record = $project_configuration[0]['Baselayer'];
				$Layers = json_decode($record['layers_configurations'],true);
				$BaseLayers = $Layers['Baselayers'];
				$this->set(array(
					'result' => array(
						'success' => true,
						'data' => $BaseLayers,
						'count' => count($BaseLayers),
						'error' => false,
						'ts' => time()
					),
					'_serialize' => 'result'
				));
			}else{
				$this->set(array(
					'result' => array(
						'success' => true,
						'data' => null,
						'count' => 0,
						'error' => false,
						'ts' => time()
					),
					'_serialize' => 'result'
				));
			}
		} else {
            die('index');
        }		
	}
	public function add(){	
		$this->Baselayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];

		$data = array('Baselayer' => $this->request->data);		
		unset($data['Baselayer']['id']);
		unset($data['Baselayer']['created']);
		unset($data['Baselayer']['modified']);	
		//Verifico se è già presente un record per il mio progetto
		$project_configuration = $this->Baselayer->find('first',array(
			'conditions' => array(
				'project_id' => $project_id
			),
		));
		$id = $project_configuration['Baselayer']['id'];
				
		if($id!==null){
			//modifico il record esistente
			$this->Baselayer->id = $id;
			//prendo layers_configurations
			$layers_configurations = json_decode($project_configuration['Baselayer']['layers_configurations'],true);
			array_push($layers_configurations['Baselayers'], $data['Baselayer']);		
		}else{
			//ne creo uno nuovo (non ho la configurazione dei layers
			$this->Baselayer->create();
			//Creo la configurazione
			$layers_configurations = array(
				'Overlaylayers' => array(),
				'Baselayers' => array(),
			);
			array_push($layers_configurations['Baselayers'], $data['Baselayer']);
			
		}
		for($i=0; $i<(count($layers_configurations['Baselayers'])); $i++) {
			$layers_configurations['Baselayers'][$i]['id'] = $i;
		}
		$BaseLayerModel = ClassRegistry::init('Baselayer');
		$dataToSave['Baselayer']['project_id'] = $project_id;
		$dataToSave['Baselayer']['layers_configurations'] = json_encode($layers_configurations);
		//Save data
		if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Baselayer']['id'] = $this->Baselayer->id;
			$success = true;
		}				
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));				
	}
	public function edit($id=null) {
		$this->Baselayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id
					)
				));			
		$tableId = $project_configuration[0]['Baselayer']['id'];
		
		$layers_configurations = json_decode($project_configuration[0]['Baselayer']['layers_configurations'],true);
		$baseLayers = $layers_configurations['Baselayers'];
		
		$editedData = $this->request->data;
		foreach($baseLayers as $key => $val){
			if($val['id'] == $id){
				$layerToModify = $val;
			}
		}
		foreach($layerToModify as $key => $val) {
			if(array_key_exists($key, $editedData)){
				$modifiedLayer[$key] = $editedData[$key];
			}else{
				$modifiedLayer[$key] = $val;
			}
		}

		foreach($baseLayers as $key => $val){
			if($val['id'] == $id){
				$baseLayers[$key] = $modifiedLayer;
			}
		}

		
		$layers_configurations['Baselayers'] = $baseLayers;
		$this->Baselayer->id = $tableId;
		$layers_configuration['Baselayers'] = $baseLayers;
		$dataToSave['Baselayer']['project_id'] = $project_id;
		$dataToSave['Baselayer']['layers_configurations'] = json_encode($layers_configurations); 
			if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Baselayer']['id'] = $this->Baselayer->id;
			$success = true;	
		}
		
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));	
	}
	public function delete($id=null) {
			$this->Baselayer->setSource('project_configuration');
			$project_id = $this->request->query['project_id'];
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Baselayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id	
					)
				));			
		$tableId = $project_configuration[0]['Baselayer']['id'];
		$this->Baselayer->id = $tableId;
		$layers_configuration = json_decode($project_configuration[0]['Baselayer']['layers_configurations'],true);
		$baseLayers = $layers_configuration['Baselayers'];
		foreach($baseLayers as $key => $val) {
			if($val['id'] == $id){
				unset($baseLayers[$key]);
			}
		}
		$baseLayers = array_values($baseLayers);
		$BaseLayerModel = ClassRegistry::init('Baselayer');
		$layers_configuration['Baselayers'] = $baseLayers;
		$dataToSave['project_id'] = $project_id;
		$dataToSave['layers_configurations'] = json_encode($layers_configuration); 
			if ($this->Baselayer->save($dataToSave)) {
			// set new ID
			$dataToSave['id'] = $this->Baselayer->id;
		}					
	}

}