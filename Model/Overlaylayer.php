<?php
App::uses('AppModel', 'Model');
App::uses('AuthComponent', 'Controller/Component');
/**
 * Overlaylayer Model
 *
 */
class Overlaylayer extends AppModel {

    /**
     * Display field
     *
     * @var string
     */
    public $displayField = 'name';
	
	/**
	*	Tabella utilizzata dal modello
	*/
	public $useTable = false;
	
	public $name = "Overlaylayer";

    /**
     * Validation rules
     *
     * @var array
     */
    public $validate = array(
        /*'name' => array(
            'notempty' => array(
                'rule' => array('notempty'),
                //'message' => 'Your custom message here',
                //'allowEmpty' => false,
                //'required' => false,
                //'last' => false, // Stop validation after this rule
                //'on' => 'create', // Limit validation to 'create' or 'update' operations
            ),
        ),
        'description' => array(
            'notempty' => array(
                'rule' => array('notempty'),
                //'message' => 'Your custom message here',
                //'allowEmpty' => false,
                //'required' => false,
                //'last' => false, // Stop validation after this rule
                //'on' => 'create', // Limit validation to 'create' or 'update' operations
            ),
        ),*/
    );

    /**
     * enable password encryption
     */
    /*public function beforeSave($options = array()) {
        if (isset($this->data[$this->alias]['password'])) {
            $this->data[$this->alias]['password'] = AuthComponent::password($this->data[$this->alias]['password']);
        }
        return true;
    }

    public function createPassword($password) {
        return AuthComponent::password($password);
    }*/
}