<?php
/**
 * Created by PhpStorm.
 * User: Mattia
 * Date: 20/06/2016
 * Time: 11:09
 */

class SubmissionTypes extends AppModel {

    public $useTable = 'submissions_types';

    public $belongsTo = array(
        'Submission'
    );
}