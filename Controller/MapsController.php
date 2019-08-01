<?php
App::uses('AppController', 'Controller');
/**
 * Maps Controller
 *
 * @property Configuration $Coniguration
 */
class MapsController extends AppController {

    /**
     * everyone can load login configuration
     */
    public function beforeFilter() {
        parent::beforeFilter();
    }

	public function dbtPrint() {
		// without view
		$this->autoRender = false;
		// get input
		$INPUT = $this->request->query;

		// check input
		$error = false;
		$feedback = array();
		if (!$error AND empty($INPUT['crs'])) {
			$error = true;
			$feedback[] = "SRS missing";
		}
		if (!$error AND empty($INPUT['extent'])) {
			$error = true;
			$feedback[] = "EXTENT missing";
		}
		if (!$error AND empty($INPUT['scale'])) {
			$error = true;
			$feedback[] = "SCALE missing";
		}
		
		if (!$error) {
			// build URL
			$baseURL = $this->Session->read('settings.map.print.qgisUrl');
			$baseURL .= "&" . $this->Session->read('settings.map.print.layers');
			//echo $baseURL;die(); 
			//$baseURL .= "a090101_mask_wms";
			//$baseURL .= "&map0:FILTER=a090101_mask_wms:\"gid\"=112"; //"<> 'I577'";
			// add params
			$baseURL .= '&CRS=' .$INPUT['crs'];
			$baseURL .= '&map0:extent=' .$INPUT['extent'];
			$baseURL .= '&map0:scale=' .$INPUT['scale'];
			
			
			//echo $baseURL;die();
			//$baseURL .= '&test=DEBUG';
			// create filename$
			$filename = date("YmdHis")."_cmm_geodbt.pdf";
			// send to user
			header("Content-type:application/pdf");
			// It will be called downloaded.pdf
			header("Content-Disposition:inline;filename='$filename'");			
			// The PDF source is in original.pdf
			readfile($baseURL);
			die();
		} else {
			echo implode('<br />', $feedback);die();
		}
	}
}