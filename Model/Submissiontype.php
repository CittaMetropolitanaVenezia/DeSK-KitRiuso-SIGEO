<?php
App::uses('AppModel', 'Model');
/**
 * Town Model
 *
 */
class Submissiontype extends AppModel {

    /**
     * Use table
     *
     * @var mixed False or table name
     */
    public $useTable = 'submissiontypes';
	
	  public $hasMany = array(
        'SubmissionTypes' => array(
            'className' => 'SubmissionTypes',
            'foreignKey' => 'submissiontype_id'
        )
    );

    /**
     * This table primary key
     *
     * @var string
     */
    //public $primaryKey = 'gid';

    /**
     * Query aliases
     *
     * @var array
     */
    /*public $virtualFields = array(
        'bounds' => "st_xmin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_xmax( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymax( st_transform( st_expand(the_geom, 1000), 4326 ) )"
    );*/


}
