<?php
App::uses('AppModel', 'Model');
/**
 * Province Model
 *
 */
class Province extends AppModel {

    /**
     * Use table
     *
     * @var mixed False or table name
     */
    public $useTable = 'comuni_dissolve';

    /**
     * This table primary key
     *
     * @var string
     */
    public $primaryKey = 'gid';

    /**
     * Query aliases
     *
     * @var array
     */
    public $virtualFields = array(
        'bounds' => "st_xmin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymin( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_xmax( st_transform( st_expand(the_geom, 1000), 4326 ) ) || ',' || st_ymax( st_transform( st_expand(the_geom, 1000), 4326 ) )"
    );

    public function getProvinceBufferWKt($buffer) {
        $res = $this->find('first', array(
             'fields' => array(
                 'st_astext( st_transform( st_buffer( st_simplify(st_union(the_geom), 30), '.$buffer.') , 4326) ) AS buffer'
             )
        ));
        //print_r($res);
        if ($res AND count($res) == 1) {
            return $res[0]['buffer'];
        }
        return null;
    }

    public function getProvinceExtent() {
        $res = $this->find('first', array(
            'fields' => array(
                "st_xmin(st_transform(st_expand(st_union(the_geom), 1500), 4326)) || ',' || st_ymin(st_transform(st_expand(st_union(the_geom), 1500), 4326)) || ',' || st_xmax(st_transform(st_expand(st_union(the_geom), 1500), 4326)) || ',' || st_ymax(st_transform(st_expand(st_union(the_geom), 1500), 4326)) AS extent"
            )
        ));
        if ($res AND count($res) > 0) {
            return $res[0]['extent'];
        }
        return null;
    }

    public function getTownNeighbors($town_id) {
        $output = array();
        $res = $this->query('SELECT tt.gid,
                                    tt.name,
                                    st_astext( st_transform( st_simplify(tt.the_geom, 130) , 4326) ) AS wkt
                               FROM towns t
                               JOIN towns tt
                                 ON t.the_geom && tt.the_geom
                                AND st_intersects(t.the_geom, tt.the_geom)
                              WHERE t.gid = '.$town_id.' AND tt.gid <> '.$town_id);
        if ($res AND count($res) > 0) {
            return Set::extract($res, '{n}.0');
        }
        return $output;
    }
}
