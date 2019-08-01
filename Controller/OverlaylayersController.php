<?php
App::uses('AppController', 'Controller');
App::uses('Folder', 'Utility');
App::uses('File', 'Utility');
/**
 * Overlaylayers Controller
 *
 * @property Baselayer $Baselayer
 */
class OverlaylayersController extends AppController {

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

	//Recupero gli overlaylayers
    public function index() {
		$this->Overlaylayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];
		if (@$this->request->params['ext'] == 'json') {
			$project_configuration = $this->Overlaylayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id
					)
				));			
			if(count($project_configuration)>0){
				$record = $project_configuration[0]['Overlaylayer'];
				$Layers = json_decode($record['layers_configurations'],true);
				$OverlayLayers = $Layers['Overlaylayers'];
				$this->set(array(
					'result' => array(
						'success' => true,
						'data' => $OverlayLayers,
						'count' => count($OverlayLayers),
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
		$this->Overlaylayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];

		$data = array('Overlaylayer' => $this->request->data);		
		unset($data['Overlaylayer']['id']);
		unset($data['Overlaylayer']['created']);
		unset($data['Overlaylayer']['modified']);	
		//Verifico se è già presente un record per il mio progetto
		$project_configuration = $this->Overlaylayer->find('first',array(
			'conditions' => array(
				'project_id' => $project_id
			),
		));
		$id = $project_configuration['Overlaylayer']['id'];
				
		if($id!==null){
			//modifico il record esistente
			$this->Overlaylayer->id = $id;
			//prendo layers_configurations
			$layers_configurations = json_decode($project_configuration['Overlaylayer']['layers_configurations'],true);
			array_push($layers_configurations['Overlaylayers'], $data['Overlaylayer']);		
		}else{
			//ne creo uno nuovo (non ho la configurazione dei layers
			$this->Overlaylayer->create();
			//Creo la configurazione
			$layers_configurations = array(
				'Overlaylayers' => array(),
				'Baselayers' => array(),
			);
			array_push($layers_configurations['Overlaylayers'], $data['Overlaylayer']);
			
		}
		for($i=0; $i<(count($layers_configurations['Overlaylayers'])); $i++) {
			$layers_configurations['Overlaylayers'][$i]['id'] = $i;
		}
		$OverlayLayerModel = ClassRegistry::init('Overlaylayer');
		$dataToSave['Overlaylayer']['project_id'] = $project_id;
		$dataToSave['Overlaylayer']['layers_configurations'] = json_encode($layers_configurations);
		//Save data
		if ($this->Overlaylayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Overlaylayer']['id'] = $this->Overlaylayer->id;
			$success = true;
		}				
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));				
	}
	public function edit($id=null) {
		$this->Overlaylayer->setSource('project_configuration');
		$project_id = $this->request->query['project_id'];
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Overlaylayer->find('all',array(
			'conditions' => array(
				'project_id' => $project_id
				)
			)
		);			
		$project_configuration_id = $project_configuration[0]['Overlaylayer']['id'];
		
		$layers_configurations = json_decode($project_configuration[0]['Overlaylayer']['layers_configurations'],true);
		$overlayLayers = $layers_configurations['Overlaylayers'];
		
		$editedData = $this->request->data;
		foreach($overlayLayers as $key => $val){
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

		foreach($overlayLayers as $key => $val){
			if($val['id'] == $id){
				$overlayLayers[$key] = $modifiedLayer;
			}
		}

		
		$layers_configurations['Overlaylayers'] = $overlayLayers;
		$this->Overlaylayer->id = $project_configuration_id;
		$layers_configuration['Overlaylayers'] = $overlayLayers;
		$dataToSave['Overlaylayer']['project_id'] = $project_id;
		$dataToSave['Overlaylayer']['layers_configurations'] = json_encode($layers_configurations); 
			if ($this->Overlaylayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Overlaylayer']['id'] = $this->Overlaylayer->id;
			$success = true;	
		}
		
		$this->set(array(
            'result' => array('success' => $success, 'data' => $dataToSave, 'msg' => ''),
            '_serialize' => array('result')
        ));	
	}
	public function delete($id=null) {
			$this->Overlaylayer->setSource('project_configuration');
			$project_id = $this->request->query['project_id'];
		if (!$this->Auth->User('is_admin')) {
            $this->sendRestResponse(array(), false, 'Operazione non consentita');
            return;
        }
		$project_configuration = $this->Overlaylayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id	
					)
				));			
		$project_configuration_id = $project_configuration[0]['Overlaylayer']['id'];
		$this->Overlaylayer->id = $project_configuration_id;
		$layers_configuration = json_decode($project_configuration[0]['Overlaylayer']['layers_configurations'],true);
		$overlayLayers = $layers_configuration['Overlaylayers'];
		foreach($overlayLayers as $key => $val) {
			if($val['id'] == $id){
				unset($overlayLayers[$key]);
			}
		}
		$overlayLayers = array_values($overlayLayers);
		$overlayLayerModel = ClassRegistry::init('Overlaylayer');
		$layers_configuration['Overlaylayers'] = $overlayLayers;
		$dataToSave['project_id'] = $project_id;
		$dataToSave['layers_configurations'] = json_encode($layers_configuration); 
			if ($this->Overlaylayer->save($dataToSave)) {
			// set new ID
			$dataToSave['id'] = $this->Overlaylayer->id;
		}					
	}
	public function loadOverlaylayerIcon(){
		// action without view
        $this->autoRender = false;
		$overlay_id = $this->params->data['overlay_id'];		
		$project_id = (integer)$this->params->data['project_id'];
		$definedVar = get_defined_constants();
		
		//Controllo se esiste la cartella del mio progetto negli attachments
		$attachments_root_path = APP."webroot/img/projects/";//cartella del progetto

		if(file_exists($attachments_root_path)===false){
			mkdir($attachments_root_path, 0777);
		}
		//Controllo se esiste la cartella delle immagini sottostante
		$img_root_path = $attachments_root_path.$project_id;
		if(file_exists($img_root_path)===false){
			mkdir($img_root_path, 0777);
		}
		//mi creo il nome dell'immagine senza caratteri strani, spazi e punteggiatura
		
		$extension = array_pop(explode('.',$_FILES['image']['name'])); //l'estensione
		$file_name = array_shift(explode('.',$_FILES['image']['name'])); //prendo il nome
		$file_name = preg_replace('/[\W]+/m', "_", $file_name); //sostituisco i caratteri spazio e la punteggiatura con _
		$file_name = strtolower($file_name); //metto tutto in minuscolo
		$file_name = $file_name.".".$extension; //ricostruisco il nome
		//Creo il percorso per la mia immagine
		$img_path = $img_root_path.DS.$file_name;
		
		//copio l'immagine all'interno della mia cartella
		$img_tmp_path = realpath($_FILES['image']['tmp_name']);
		$tmp_image = file_get_contents($img_tmp_path);
		$res = file_put_contents($img_path,$tmp_image);
		
		//Assegnamo i permessi all'immagine per poterla vedere sull'applicativo
		chmod($img_path, 0777);
		
		//l'url dell'immagine reale nel sistema
		$img_url = $definedVar['FULL_BASE_URL'].DS.$definedVar['APP_DIR'].DS."img/projects".DS.$project_id.DS.$file_name;
		//setto l'url della nuova immagine al layer corrispondente
		$this->Overlaylayer->setSource('project_configuration');
	    $project_configuration = $this->Overlaylayer->find('all',array(
				'conditions' => array(
					'project_id' => $project_id
					)
				));
		$tableId = $project_configuration[0]['Overlaylayer']['id'];
		
		$layers_configurations = json_decode($project_configuration[0]['Overlaylayer']['layers_configurations'],true);
		$overlayLayers = $layers_configurations['Overlaylayers'];
		foreach($overlayLayers as $key => $val){
			if($val['id'] == $overlay_id){
				$layerToModify = $val;
			}
		}
		$layerToModify['photo'] = $img_url;
		foreach($overlayLayers as $key => $val){
			if($val['id'] == $overlay_id){
				$overlayLayers[$key] = $layerToModify;
			}
		}
		
		$this->Overlaylayer->id = $tableId;
		$layers_configurations['Overlaylayers'] = $overlayLayers;
		$dataToSave['Overlaylayer']['project_id'] = $project_id;
		$dataToSave['Overlaylayer']['layers_configurations'] = json_encode($layers_configurations);
			if ($this->Overlaylayer->save($dataToSave)) {
			// set new ID
			$dataToSave['Overlaylayer']['id'] = $this->Overlaylayer->id;
			$success = true;
		}				
		//restituisco l'url dell'immagine per caricarla dentro alla cella del progetto
        echo json_encode(array(
            'success' => true,
            'data' => $img_url,
            'msgError' => ""
        ));
	}

}