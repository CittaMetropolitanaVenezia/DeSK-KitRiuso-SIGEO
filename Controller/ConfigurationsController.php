<?php
App::uses('AppController', 'Controller');
/**
 * Configurations Controller
 *
 * @property Configuration $Coniguration
 */
class ConfigurationsController extends AppController {

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
        $this->Auth->allow('get');
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

    /**
     * Load login configuration
     * @return array
     */
    public function get($Auth=false, $Session) {
        $configuration = array('loggedin' => false);
        if ($Auth AND $Auth->loggedIn()) {
            // load and save settings
            //$this->_loadSettings($Session); //scrive in sessione i settings
            // get draw buffer (from ini)
            $buffer = $Session->read('settings.map.draw.buffer');
            // load town data
            $townData = $this->_loadTownData($Auth->user('town_id'), $buffer);
            // build output
            $configuration = array(
                'loggedin' => true,
                'settings' => array(
                    'user' => $Auth->user(),
                    'submissions_enable' => $this->_checkSubmissionsPeriodLimit($Session),
                    'startDate' => $Session->read('settings.general.startDate'),
                    'endDate' => $Session->read('settings.general.endDate'),
                    'map' => array_merge(
                        $Session->read('settings.map'),
                        array(
                            'controls' => array(),
                            'town_buffer_geojson' => $townData['buffer'],
                            'town_max_bounds' => $townData['bounds'],
                            'town_neighbors' => $townData['neighbors']
                        )
                    )
                ),
                'labels' => $Session->read('settings.labels')
            );
        }
        return $configuration;

        /*
        fb($this->Session->read('acl'));
        $configuration = array(
            'general' => Configure::read('general'),
            'login' => Configure::read('login'),
            'user' => $this->Auth->user(),
            'impersonator' => $this->getImpersonator(),
            'icons' => Configure::read('icons'),
            'labels' => Configure::read('labels'),
            'portlets' => $this->getUserPortlets(),
            'maps' => Configure::read('maps'),
            // TODO: fix
            'acl' => $this->Session->read('acl')
        );
        $userData = $this->Auth->user();
        // add defaults
        $configuration['acl'][] = 'admin.portlets.manager';
        $configuration['acl'][] = 'system.utilities.history';
        $configuration['acl'][] = 'system.utilities.bookmarks';
        */
        /*
        if ($userData['username'] == 'superadmin') {
            $configuration['acl'][] = 'admin.system.manager';
            $configuration['acl'][] = 'admin.portlets.manager';
            $configuration['acl'][] = 'admin.sysnotes.manager';
            $configuration['acl'][] = 'admin.groups.manager';
            $configuration['acl'][] = 'admin.functionalities.manager';
            $configuration['acl'][] = 'admin.domines.manager';
        }
        */
    }

    /**
     * Check submissions enabled period
     *
     * @param $Session
     * @return bool
     */
    private function _checkSubmissionsPeriodLimit($Session) {
        $startDate = $Session->read('settings.general.startDate');
        $startTokens = explode('/', $startDate);
        $startTime = mktime(0, 0, 0, $startTokens[1], $startTokens[0], $startTokens[2]);
        $endDate = $Session->read('settings.general.endDate');
        $endTokens = explode('/', $endDate);
        $endTime = mktime(0, 0, 0, $endTokens[1], $endTokens[0], $endTokens[2]);
        $now = time();
        if ($now >= $startTime AND $now <= $endTime) {
            return true;
        }
        return false;
    }
	public function _projectCheckSubmissionsPeriodLimit($settings) {
        $startDate = $settings['startDate'];
        $startTokens = explode('/', $startDate);
        $startTime = mktime(0, 0, 0, $startTokens[1], $startTokens[0], $startTokens[2]);
        $endDate = $settings['endDate'];
        $endTokens = explode('/', $endDate);
        $endTime = mktime(0, 0, 0, $endTokens[1], $endTokens[0], $endTokens[2]);
        $now = time();
        if ($now >= $startTime AND $now <= $endTime) {
            return true;
        }
        return false;
    }

    private function _loadSettings($Session) {
        Configure::load('settings', 'ini');
        $Session->write('settings', array(
            'general' => Configure::read('general'),
            'mail' => Configure::read('mail'),
            'map' => Configure::read('map'),
            'labels' => Configure::read('labels')
        ));
    }

    public function _loadTownData($town_id, $buffer, $project_id){
        // init output
        $output = array('buffer' => null, 'bounds' => null, 'neighbors' => null);
        $TownModel = ClassRegistry::init('Town');
        // require lib
        require_once APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
        // only for towns
		
        if ($town_id > 0) {
            // get buffer geoJson
            $wkt = $TownModel->getTownBufferWKt($town_id, $buffer, $project_id);
		
            if ($wkt) {
                $wkt = geoPHP::load($wkt);
                // convert
                $geojson = json_decode($wkt->out('json'));
                $output['buffer'] = array($geojson);
            }
            // get neighbors
			$this->loadModel('TownProject');
			$entities = $this->TownProject->find('all',array(
				'conditions' => array(
					'TownProject.project_id' => $project_id,
					'TownProject.town_id !=' => $town_id,
					'Town.entity' => 'Ente')));
					
			foreach($entities as $row){
				if($row['Town']['gid'] == $town_id){
					unset($row['Town']);
				}	
			}			
			if($entities && count($entities)>0){
				foreach($entities as $entity){
					$neighbEntities[] = $entity['Town'];
				}
				foreach($neighbEntities as $entity){
					$item = array(
						'type' => 'Feature',
						'properties' => array(
							'gid' => $entity['gid'],
							'name' => $entity['name']),
						'geometry' => null
							);
					$output['neighbors'][] = $item;
				}
			}
            $neighbors = $TownModel->getTownNeighbors($town_id, $buffer, $project_id);
            foreach ($neighbors AS $town) {
                $wkt = geoPHP::load($town['wkt']);
                // convert
                $geojson = json_decode($wkt->out('json'));
                // add id and name
                $geojson = array(
                    'type' => 'Feature',
                    'properties' => array(
                        'gid' => $town['gid'],
                        'name' => $town['name']
                    ),
                    'geometry' => $geojson
                );
                // add to output
                $output['neighbors'][] = $geojson;
            }
            $townExtent = $TownModel->getTownExtent($town_id, $project_id);
        }
        else {//prendo i limiti provinciali
		
            $ProvinceModel = ClassRegistry::init('Province');
            // get buffer geoJson
            $wkt = $ProvinceModel->getProvinceBufferWKt($buffer);
            if ($wkt) {
                $wkt = geoPHP::load($wkt);
                // convert
                $geojson = json_decode($wkt->out('json'));
                $output['buffer'] = array($geojson);
            }
            $output['neighbors'] = array();
            $townExtent = $ProvinceModel->getProvinceExtent();
        }
        // get town bounds

        $output['bounds'] = $townExtent;
        return $output;
    }

    // TODO: recuperare da session dopo login...
    private function _getTownExtent($town_id,$project_id) {

        $town = $TownModel->find('first', array(
            'conditions' => array('id' => $town_id)
        ));
        pr($town);
        if ($town AND count($town) > 0) {
            pr($town);die();
        }
    }

    // TODO: recuperare da session dopo login...
    private function _getTownBufferGeoJson($town_id) {
        $TownModel = ClassRegistry::init('Town');
        $wkt = $TownModel->getTownBufferWKt($town_id, 100);
        if ($wkt) {
            // require lib
            require APP . 'Vendor' .DS. 'geophp' .DS. 'geoPHP.inc';
            $wkt = geoPHP::load($wkt);
            // convert
            $geojson = json_decode($wkt->out('json'));
            return array($geojson);
        }
        return array();
    }

	/**
     * get acl
     *
     * @return array
     */
	private function getAcl() {
		$groupUser = ClassRegistry::init('GroupUser');
		$functionalitygroup = ClassRegistry::init('FunctionalityGroup');
		
		//recupero tutti i gruppi a cui è associato quell'utente
		$allGroups = $groupUser->find('all',array(
			'conditions'=>array(
				'GroupUser.user_id' => $this->Auth->user('id')
			))
		);
		
		$groupids = array();			
		$groupNames = array();
		//recupero gli id di tutti i gruppi
		foreach ($allGroups as $ag) {
			
			$groupids[] = $ag['GroupUser']['group_id'];
			$groupNames[] = $ag['Group']['name'];
			
		}
		
		// get ACL settings
		$resAcl = $functionalitygroup->find('all',array(
			'conditions'=> array(
				'FunctionalityGroup.group_id' => $groupids
			),
			'fields'=>array('DISTINCT FunctionalityGroup.action_path')
		));
		$acls = Set::extract($resAcl, '{n}.FunctionalityGroup.action_path');
		print_r($acls);
		die();
		return $acls;
	}
	
	
	public function testAcl() {
	
		$this->getAcl();
	
	}

    /**
     * Generate a random token
     *
     * @param string $length
     * @return string
     */
    private function createRandomToken($length = ""){
        $code = md5(uniqid(rand(), true));
        if ($length != "")
            return substr($code, 0, $length);
        else
            return $code;
    }

    /**
     * Get impersonator (user) record
     *
     * @return bool
     */
    private function getImpersonator() {
        // return $this->Auth->user();
        // is current user impersonating somebody else?
        if ( $this->Session->check( 'Auth.Impersonator' ) ) {
            return $this->Session->read( 'Auth.Impersonator' );
        }
        return false;
    }

    /**
     * Recupera impstazioni di sistema dai vari file ini
     */
       public function getSystemSettings() {
        // action without view
        $this->autoRender = false;
        // get input
        $input = $this->request->data;
        // fb($input);
        // init output
        $settings = array();
        // loop over fields to get data
		$myFile = APP .'Config/settings.ini';
		$general_settings = parse_ini_file($myFile,true);
        foreach ($input['fields'] AS $fieldName) {
			$exploded = explode('.',$fieldName);
		$settings[$fieldName] = $general_settings[$exploded[0]][$exploded[1]];
        }
        // return output
        echo json_encode(array(
            'status' => count($settings) > 0,
            'settings' => $settings
        ));
    }	

    /**
     * Salva le modifiche alle impostazioni di sistema, diramandole ai vari file ini
     * e facendone una copia di sicurezza
     */
     public function setSystemSettings() {
        // action without view
        $this->autoRender = false;
        // init output
        $status = false;
        // get input
        $input = $this->request->data;
        // loop over values and unpdate configured settings
        foreach ($input['values'] AS $fieldName => $fieldValue) {
                if (is_numeric($fieldValue)) {
                    Configure::write($fieldName, $fieldValue);
                }
                else Configure::write($fieldName, '\''.$fieldValue.'\'');
           
        }
        /*//reinserisco tutti i valori del sezione map
        $mapData = $this->Session->read('settings.map');

        foreach ($mapData as $fieldName => $fieldValue) {
            Configure::write('map.'.$fieldName, $fieldValue);
        }*/

        // write to ini file
        $status = @Configure::dump('settings.ini', 'ini', array('general'));
        // return output
        echo json_encode(array(
            'status' => $status
        ));
    }
}