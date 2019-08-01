<?php
App::uses('AppModel', 'Model');
/**
 * Submission Model
 *
 */
class Submission extends AppModel {

    /**
     * Use table
     *
     * @var mixed False or table name
     */
    public $useTable = 'submissions';
	public $name = 'Submission';
    public $hasMany = array(
        'SubmissionTypes' => array(
            'className' => 'SubmissionTypes',
            'foreignKey' => 'submission_id'
        )
    );

    public $belongsTo  = array(
        'Town' => array(
            'className' => 'Town'
        )
    );

}
