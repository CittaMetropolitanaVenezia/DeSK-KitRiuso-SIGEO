<!DOCTYPE HTML>
<html>
<head>
    <meta charset="UTF-8">
    <title>
        <?php echo $title_for_layout?>
    </title>
    <?php
    echo $this->Html->meta('icon');


    // leaflet
    echo $this->Html->css('/vendor/leaflet/leaflet');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.NavBar/Leaflet.NavBar');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.FeatureInfo/Control.FeatureInfo');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.Geocoder/Control.Geocoder');
	echo $this->Html->css('/vendor/leaflet/controls/Leaflet.TopoJSON/Leaflet.TopoJSON');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.QGisPrint/Leaflet.QGisPrint');
    echo $this->Html->css('/vendor/leaflet/controls/Leaflet.GraphicScale/dist/Leaflet.GraphicScale.min');

    echo $this->Html->script('/vendor/leaflet/leaflet');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.NavBar/Leaflet.NavBar');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.MiniMap/Control.MiniMap');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.GroupedLayer/Control.GroupedLayer');
    /*echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw');*/
	echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Draw/leaflet.draw-src');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.FeatureInfo/Control.FeatureInfo');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.Geocoder/Control.Geocoder');
	
	echo $this->Html->script('/vendor/leaflet/controls/Leaflet.TopoJSON/chroma.min');
	echo $this->Html->script('/vendor/leaflet/controls/Leaflet.TopoJSON/topojson.v1.min');
	echo $this->Html->script('/vendor/leaflet/controls/Leaflet.TopoJSON/Leaflet.TopoJSON');

    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.QGisPrint/L.Path.Transform');
    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.QGisPrint/Leaflet.QGisPrint');

    echo $this->Html->script('/vendor/leaflet/controls/Leaflet.GraphicScale/dist/Leaflet.GraphicScale.min');

    echo $this->Html->script('/vendor/openlayers/OL-Geometry');

    if ($environment == 'PROD') {


        echo $this->Html->css('/bootstrap');
        echo $this->Html->script('/ext/ext-dev');
        echo $this->Html->script('/ext/locale/ext-lang-it');
        echo $this->Html->script('/app');
    } else if ($environment == 'DEV') {
        // leaflet
        /*
        echo $this->Html->css('/build/production/SIO/vendor/leaflet/leaflet');
        echo $this->Html->script('/build/production/SIO/vendor/leaflet/leaflet');
        */
        // extjs app
        echo $this->Html->css('/build/production/SIO/resources/SIO-all.css');
        echo $this->Html->script('/build/production/SIO/app');
    }

    // echo $this->fetch('meta');
    // echo $this->fetch('css');
    // echo $this->fetch('script');
    ?>

    <script language="javascript">
            // TODO: spostare...
            if (!Array.prototype.indexOf)
            {
                Array.prototype.indexOf = function(elt /*, from*/)
                {
                    var len = this.length >>> 0;

                    var from = Number(arguments[1]) || 0;
                    from = (from < 0)
                            ? Math.ceil(from)
                            : Math.floor(from);
                    if (from < 0)
                        from += len;

                    for (; from < len; from++)
                    {
                        if (from in this &&
                                this[from] === elt)
                            return from;
                    }
                    return -1;
                };
            }
        </script>

    <style>
            .x-panel.opinions-grid > .x-panel-header, .x-panel.attachments-grid > .x-panel-header {
                padding-top: 6px !important;
                padding-bottom: 6px !important;
            }

            .x-panel.attachments-panel > .x-panel-header {
                padding-top: 6px !important;
                padding-bottom: 6px !important;
            }

            #geocode-selector {
                position: absolute;
                left: 10px;
                bottom: 10px;
            }

            #geocode-selector .selected {
                background-color: #0078A8;
            }
        </style>
</head>
<body>
<div id="geocode-selector"></div>
<!-- Loading Mask -->
<div id="sio-loading-mask" class="x-mask sio-mask"></div>
<div id="sio-x-mask-msg">
    <div id="sio-loading" class="x-mask-msg sio-mask-msg">
        <div></div>
    </div>
</div>
</body>
</html>