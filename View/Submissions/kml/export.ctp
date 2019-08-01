<?php
// import kml library
require_once ROOT .DS. APP_DIR .DS. 'Vendor' .DS. 'kmlcreator' .DS. 'KmlCreator.php';

$kml = new KML('SIGEO - Osservazioni');
$document = new KMLDocument('sigeo', 'SIGEO - Osservazioni');

// calculate images url
$baseUrl = str_replace('submissions/export.kml', '', $this->Html->url(null, true)) . 'resources/markers/';

// create styles
$style = new KMLStyle('yellow');
$style->setIconStyle($baseUrl .'yellow.png', 'ffffffff', 'normal', 1);
$style->setLineStyle('ff00ffff', 'normal', 4);
$document->addStyle($style);
$style = new KMLStyle('green');
$style->setIconStyle($baseUrl .'green.png', 'ffffffff', 'normal', 1);
$style->setLineStyle('ff00ff00', 'normal', 4);
$document->addStyle($style);
$style = new KMLStyle('red');
$style->setIconStyle($baseUrl .'red.png', 'ffffffff', 'normal', 1);
$style->setLineStyle('ff0000ff', 'normal', 4);
$document->addStyle($style);

foreach ($data AS $row) {
    $description = array();

    foreach ($header AS $fieldname => $fieldlabel) {
        if (!in_array($fieldname, array('geom_type', 'point_wkt', 'line_wkt', 'poly_wkt'))) {
            if ($fieldname == 'created') {
                $description[] = '<b>'.$fieldlabel.': </b>'.date('d-m-Y', strtotime($row['Submission'][$fieldname]));
            }
            if ($fieldname == 'submissions_types') {
                $toInsert = "";
                $st = explode("§",$row['Submission']['submissions_types']);
                //print_r($st);
                foreach ($st as $item) {
                    if (trim($item) != "") {
                        $token = explode("|",$item);
                        $toInsert .= $token[0].' -> '.$token[1].', ';
                    }
                }
                $toInsert = substr($toInsert,0,-2);
                $description[] = '<b>'.$fieldlabel.': </b>'.$toInsert;
            }
            else {
                $description[] = '<b>'.$fieldlabel.': </b>'.$row['Submission'][$fieldname];
            }
        }
    }


    $description = implode('<br >', $description);
    $placemark = new KMLPlaceMark('', '', $description, true);
    switch ($row['Submission']['geom_type']) {
        case 'Point':
            $coords = str_replace('POINT(', '', $row['Submission']['point_wkt']);
			$coords = str_replace('POINT (', '', $coords);
            $coords = str_replace(')', '', $coords);
			$coords = explode(' ', $coords);
			
            $placemark->setGeometry(new KMLPoint($coords[0], $coords[1], 0)); 
            break;
        case 'LineString':
            $raw = str_replace('LINESTRING (', '', $row['Submission']['line_wkt']);
            $raw = str_replace(')', '', $raw);
            $couples = explode(',', $raw);
            $coords = array();
            foreach ($couples AS $couple) {
                $coords[] = array_merge(explode(' ', $couple), array(0));
            }
            $placemark->setGeometry(new KMLLineString($coords, true, '', true));

            break;
        case 'Polygon':
            $coords = str_replace('POLYGON ((', '', $row['Submission']['poly_wkt']);
            $coords = str_replace('))', '', $coords);
			
            $couples = explode(',', $coords);
            $coords = array();
			
            foreach ($couples AS $couple) {
                $coords[] = explode(' ', $couple);
            }

            $placemark->setGeometry(new KMLPolygon($coords, true, '', true));
            break;
    }

    // add style
    /*switch ($row['Submission']['opinions_status']) {
        case "In discussione":
            $placemark->setStyleUrl('#yellow');
            break;
        case "Mancato accordo":
            $placemark->setStyleUrl('#red');
            break;
        case "Accordo":
            $placemark->setStyleUrl('#green');
            break;
        default:
            $placemark->setStyleUrl('#yellow');
            break;
    }*/

    $placemark->setStyleUrl('#green');

    $document->addFeature($placemark);
}
$kml->setFeature($document);
$kml->output('A', date('Ymd_His').'_SIGEO_Osservazioni.kml');
