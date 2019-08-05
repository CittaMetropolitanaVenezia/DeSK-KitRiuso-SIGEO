Ext.define('SIO.view.submissions.Map', {
    extend: 'Ext.Component',
    alias: 'widget.submissions.map',

	style: 'background-color: #fff;',
	
    statics: {
        EDIT: {
            selectedPathOptions: {
                color: '#0000ff',
                opacity: 0.8,
                dashArray: '10, 10',

                fill: true,
                fillColor: '#0000ff',
                fillOpacity: 0.1,

                // Whether to user the existing layers color
                maintainColor: true
            }
        },
        DRAW: {
            allowIntersection: true,
            showLength: true,
            shapeOptions: {
                stroke: true,
                color: '#0000ff',
                weight: 4,
                opacity: 0.7,
                fill: false,
                clickable: true
            }
        },
        BUFFER: {
            style: {
                fillOpacity: 0,
                color: 'red',
                dashArray: '6',
                weight: 4,
                pointer: 'default'
            }
        }
    },

    config:{
        initialLocation: null,
        initialZoomLevel: null,
        map: null,
        baseLayers: {},
        overlayLayers: {
            towns: null,
            buffer: null,
            submissions: null
        },
        editHandler: null,
        drawHandler: null,
        drawLayer: null,
        drawMode: '',
        maxBounds: null,
        neighborsLayer: null,
        featureInfoControl: null
    },

    onRender: function() {
        var me = this,
            user = SIO.Settings.getUser();
        // update panel title
        me.up().setTitle([
            'Benvenuto <span style="color: black;">' + user.username + '</span> ',
            (user.town_id > 0) ? ' (Ente/Comune di ' : ' (',
            user.town_name + ') - ' + SIO.Settings.getTitle()
        ].join(''));

        me.callParent(arguments);

    },

    afterRender: function(t, eOpts){
        var me = this,
            layers = this.getOverlayLayers();

        this.callParent(arguments);


        var leafletRef = window.L;
        if (leafletRef == null){
            this.update("No leaflet library loaded");
        } else {
            // debugger;
            // calculate max bounds
			
            var rawMaxBounds = SIO.Settings.getTownMaxBounds(),
                maxBounds = null,
                mapOptions = {};
            if (rawMaxBounds) {
                var maxBounds = L.latLngBounds(
                    L.latLng(rawMaxBounds[1], rawMaxBounds[0]),
                    L.latLng(rawMaxBounds[3], rawMaxBounds[2])
                );
                mapOptions = {
                    // center: bounds.getCenter(),
                    maxBounds: maxBounds,
                    minZoom: 7,
                    maxZoom: 19,
                    zoomControl: false,
					crs: SIO.Settings.getDataProj()
                };
            } else {
				xmax = SIO.Settings.getXMax();
				ymax = SIO.Settings.getYMax();
				xmin = SIO.Settings.getXMin();
				ymin = SIO.Settings.getYMin();
				// xmin - ymin &&&&& xmax - ymax
                var maxBounds = L.latLngBounds(
                    L.latLng(xmin, ymin),
                    L.latLng(xmax, ymax)
                );
                mapOptions = {
                    maxBounds: maxBounds,
                    minZoom: 7,
                    maxZoom: 19,
                    zoomControl: false,
					crs: SIO.Settings.getDataProj()
                };
            }
            // save for future use
            me.setMaxBounds(maxBounds);
            // create map object
            var map = L.map(this.getId(), mapOptions);
            if (maxBounds) map.fitBounds(maxBounds);

            // save reference
            me.setMap(map);

            /*
            var initialLocation = this.getInitialLocation();
            var initialZoomLevel = this.getInitialZoomLevel();
            if (initialLocation && initialZoomLevel){
                map.setView(initialLocation, initialZoomLevel);
            } else {
                map.fitWorld();
            }
            */
            /*
            // TODO: sistemare...
            // center and zoom the map
            var buffer = SIO.Settings.getTownBufferGeoJson();
            if (buffer && buffer.length) {
                layers.buffer = L.geoJson(buffer, {
                    clickable: false,
                    style: {
                        fillOpacity: 0,
                        color: 'red',
                        dashArray: '6',
                        weight: 4,
                        pointer: 'default'
                    }
                });
                var bounds = layers.buffer.getBounds(),
                    initialZoomLevel = map.getBoundsZoom(bounds, true),
                    initialLocation = bounds.getCenter();
                layers.buffer.addTo(map);
                map.setView(initialLocation, 12);
            } else {
                var initialLocation = this.getInitialLocation();
                var initialZoomLevel = this.getInitialZoomLevel();
                if (initialLocation && initialZoomLevel){
                    map.setView(initialLocation, initialZoomLevel);
                } else {
                    map.fitWorld();
                }
            }
            */

            // save to map obj
            map._initialZoom = map.getZoom();

            // extend leaflet map methods
            this.extendLeafletMap(map);

            // layers
            /* Basemap Layers */
            /*
             var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
             maxZoom: 19,
             subdomains: ["otile1", "otile2", "otile3", "otile4"],
             attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
             }).addTo(map);
             var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
             maxZoom: 18,
             subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
             attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
             }).addTo(map);
             */
			
            var overlayLayers = me.buildOverlayLayers();
			
            var baseLayers = me.buildBaseLayers();
			
            /*
            layers.submissions.on('mouseover', function(e) {
                e.layer.openPopup();
            });
            */

            /*
            var groupedOverlays = {
                'Tematismi': {
                    'Limiti Comunali': comuni,
                    'Osservazioni': layers.submissions
                    // 'Limiti di disegno': layers.buffer
                }
                //
                 "Points of Interest": {
                    "<img src='assets/img/theater.png' width='24' height='28'>&nbsp;Theaters": theaterLayer,
                    "<img src='assets/img/museum.png' width='24' height='28'>&nbsp;Museums": museumLayer
                 },
                 "Reference": {
                 "Boroughs": boroughs,
                 "Subway Lines": subwayLines
                 }
            };
            */

			

            // CONTROLS -------------------------------------------
            // zoom control
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            // nav bar
            L.control.navbar({
                position: 'topright'
            }).addTo(map);
            // add minimap
            //me.buildMiniMap();
            
            /*
            // scale control
            L.control.scale({
                position: 'bottomleft',
                imperial: false
            }).addTo(map);
            */
            L.control.graphicScale({
                doubleLine: false,
                fill: 'fill',
				position: 'bottomright',
                maxUnitsWidth: 180
            }).addTo(map);

            // add feature info control BOTTONE INFO
			
			if(SIO.Settings.getInfo()){
            me.featureInfoControl = L.control.featureInfo({
                endpoint: SIO.Settings.data.map.geodbt.base.featureinfo.endpoint,
                geoJSONEndPoint: SIO.Settings.data.map.geodbt.base.featureinfo.geoJSONEndPoint,
                layers: SIO.Settings.data.map.geodbt.base.featureinfo.layers,
                layerNamesDictionary: {"A040301":"Ghiacciaio-nevaio perenne","L040401":"Elemento idrico","L040402":"Condotta","P040403":"Nodo idrico","L050101":"Curve di livello","P050102":"Punti quotati","L050103":"Breakline","A050391":"Forma naturale","L050302":"Scarpata","A050303":"Area di scavo o discarica","A050304":"Area in trasformazione o non strutturata","A050305":"Alveo naturale","A050306":"Alveo artificiale","A060101":"Bosco","A060102":"Formazione particolare","A060104":"Area temporaneamente priva di vegetazione","A060105":"Pascolo incolto","A060106":"Coltura agricola","L010202":"Elemento ferroviario","P010203":"Giunzione ferroviaria","L010204":"Elemento tranviario","P010205":"Giunzione tranviaria","A060401":"Area verde","L060402":"Filare alberi","P060403":"Albero isolato","L070301":"Tratto di linea della rete elettrica","P070302":"Nodo della rete elettrica","L070501":"Tratto di linea della rete di distribuzione del gas","P070502":"Nodo di distribuzione del gas","L070601":"Tratto di linea di teleriscaldamento","L070701":"ratto di linea di oleodotto","L070801":"Tratto di linea della rete di telecomunicazione e cablaggi","P070802":"Nodo della rete di telecomunicazione e cablaggi","P080101":"Toponimi e località significative","A090101":"Comune","L090102":"Limite comunale","A100101":"Area a servizio stradale","A100102":"Area a servizio del trasporto su ferro","A100103":"Area a servizio portuale","A100104":"Area a servizio aeroportuale","A100105":"Altre aree a servizio per il trasporto","A100201":"Unità insediative","A100302":"Area estrattiva","P000101":"Vertice di rete","P000102":"Caposaldo","P000103":"Punto di appoggio fotogrammetrico","P000104":"Punto di legame in triangolazione aerea","P000106":"Spigolo principale di cassone edilizio","T030101":"Toponimo stradale","P000107":"Punto di collegamento con la base dati del catasto","A000201":"Porzione di territorio restituito","L000301":"Assi di volo","P000302":"Centri di presa","A000303":"Abbracciamento al suolo del fotogramma","L010210":"Binario industriale","A020501":" Diga","P050392":"Grotta\Caverna","A050393":"Copertura non vegetata","A050394":"Alveo specchio d'acqua","A010102":"Area di circolazione pedonale","A040101":"Area bagnata di corso d'acqua","A040102":"Specchio d'acqua","A010103":"Area di circolazione ciclabile","A010104":"Area stradale","A010105":"Viabilità mista secondaria","L010105":"Viabilità mista secondaria","L010107":"Elemento stradale","P010108":"Giunzione stradale","A010101":"Area di circolazione veicolare","L010112":"Elemento ciclabile","P010113":"Giunzione ciclabile","L010116":"Elemento viabilità mista secondaria","P010117":"Giunzione di viabilità mista secondaria","A010201":"Sede di trasporto su ferro","L010206":"Elemento di metropolitana","P010207":"Giunzione di metropolitana","L010208":"Elemento funicolare","P010209":"Giunzione funicolare","L010301":"Elemento di trasporto a fune","L010302":"Elemento di trasporto su acqua","L010303":"Trasporto particolare","A020101":"Unità volumetrica","A020102":"Edificio","L020104":"Elemento di copertura","A020105":"Particolare architettonico","A020106":"Edificio minore","A020201":"Manufatto industriale","A020202":"Manufatto monumentale e di arredo urbano","A020203":"Gradinata","A020204":"Attrezzatura sportiva","A020205":"Manufatto d'infrastruttura di trasporto","A020206":"Area attrezzata del suolo","A020207":"Sostegno a traliccio","P020208":"Palo","L020209":"Elemento divisorio","A020210":"Muro o divisione in spessore","A020211":"Conduttura","P020212":"Localizzazione di manufatto edilizio o di arredo/igiene","P020213":"Localizzazione di manufatto di rete tecnologica","P020214":"Localizzazione di manufatto industriale/di trasporto","A020301":"Ponte/viadotto/cavalcavia","A020303":"Galleria","A020401":"Muro di sostegno e ritenuta del terreno","A020502":"Argini","A020503":"Opere idrauliche di regolazione","A020504":"Attrezzature per la navigazione","A020505":"Opere portuali di difesa delle coste","P030104":"Accesso esterno/passo carrabile","P030105":"Accesso interno","A040103":"Invaso artificiale","P040104":"Emergenza naturale dell'acqua","A040105":"Cascata" },
                excludedAttributes: ['strato', 'tema', 'classe']
            }).addTo(map);
			}
			
			if(SIO.Settings.getPrint()){
            // add print map control  BOTTONE STAMPA DBT
            me.printControl = L.control.qgisprint({
                urlTpl: SIO.Settings.data.map.print.url,
				printAreaSize: [parseInt(SIO.Settings.data.map.print.mapWidth), parseInt(SIO.Settings.data.map.print.mapHeight)]
            }).addTo(map);
			}
            // add the geocoder control
            var geocoder = L.Control.Geocoder.Google(),
                control = L.Control.geocoder({
                    geocoder: geocoder,
                    tooltip: 'Ricerca strade',
                    placeholder: 'Ricerca...',
                    errorMessage: 'Nessuna corrispondenza trovata.',
                    removeMarkerTimeout: 4000,
                    markerIcon: L.icon({
                        iconUrl: 'resources/markers/blue.png',
                        iconSize: [29, 38],
                        iconAnchor: [15, 38],
                        popupAnchor: [0, -38]
                    })
                }).addTo(map);
            
			// layers control
			
            var layerControl = L.control.groupedLayers(baseLayers, overlayLayers, {
                position: 'topright',
                collapsed: true
            }).addTo(map);
			
            // add the legend
            me.buildLegend(map);

            // fire global event
            map.whenReady(function() {
                // fit bounds
                if (maxBounds) setTimeout(function() {
                    map.fitBounds(maxBounds);
                    map.options.minZoom = map.getBoundsZoom(maxBounds);

                }, 10);
                // emit global event
                Ext.globalEvents.fireEvent('mapready', me, map);
            });
            /*
            var drawControl = new L.Control.Draw({
                position: 'topright',
                draw: {
                    polyline: {
                        metric: true
                    },
                    polygon: false,
                    circle: false
                },
                edit: {
                    featureGroup: me.getOverlayLayers().submissions,
                    remove: false
                }
            });
            map.addControl(drawControl);

            map.on('draw:created', function (e) {
                var type = e.layerType,
                    layer = e.layer;

                // if (type === 'marker') {
                    layer.bindPopup('A popup!');
                //}

                me.getOverlayLayers().submissions.addLayer(layer);
            });
            */


            map.on('click', function(e) {
                // console.info(e.latlng.inside(me.getOverlayLayers().buffer.getLayers()[0]));
            });

            map.on('draw:forbidden', function() {
                SIO.Utilities.alert('Attenzione', 'Impossibile disegnare al di fuori dei limiti di disegno');
            });

            map.on('draw:created', me.onDrawCreated, me);
            map.on('draw:modified', me.onDrawModified, me);


            // set leaflet draw locale
            me.overrideLeafletDrawLocale();

            // TODO: aggiungere controllo se presente OL
            // load neighbors layer
            var neighborsLayer = new OpenLayers.Layer.Vector("Vector Layer"),
                features = SIO.Settings.getTownNeighborsGeoJSON();
            if (features) {
                for (var i=0; i<features.length; i++) {
                    var feature = new OpenLayers.Format.GeoJSON().read(
                        Ext.encode(features[i])
                    );
                    neighborsLayer.addFeatures(
                        feature
                    );
                }
                me.setNeighborsLayer(neighborsLayer);
            }

            // invalidate size
            map.invalidateSize();
        }
    },

    onResize: function(w, h, oW, oH){
        this.callParent(arguments);
        var map = this.getMap();
        if (map){
            map.invalidateSize();
        }
    },

    extendLeafletMap: function(map) {
        map.zoomToLayer = function(layer, openPopup) {
            var feature = layer.feature,
                geometry = feature.geometry,
                type = geometry.type;
            // open popup?
            if (openPopup === true) layer.openPopup();
            if (type == 'Point') {
                var pointBounds = L.latLngBounds(layer.getLatLng(), layer.getLatLng()),
                    zoom = this.getBoundsZoom(pointBounds),
                    center = layer.getLatLng();
            } else {
                var bounds = layer.getBounds(),
                    zoom = this.getBoundsZoom(bounds),
                    center = bounds.getCenter();
            }
		zoom = 11;
            map.setView(center, zoom, { animate: false });
        };

        map.resetBounds = function(closePopup) {
            if (closePopup) map.closePopup();
            if (this.options.maxBounds) map.fitBounds(this.options.maxBounds);
            else map.setView(this._initialCenter, this._initialZoom);
        }
    },

    resetBounds: function() {
        var me = this,
            map = me.getMap();
        map.resetBounds();
    },

    zoomToBoundsArray: function(boundsArray) {
        var me = this,
            map = me.getMap(),
            bounds = L.latLngBounds(
                L.latLng(boundsArray.split(',')[1], boundsArray.split(',')[0]),
                L.latLng(boundsArray.split(',')[3], boundsArray.split(',')[2])
            );
        map.fitBounds(bounds);
    },
	
	startDraw: function(type) {
        var me = this,
            map = me.getMap(),
            featuresGroup = me.getOverlayLayers().submissions,
            layer = me.getDrawLayer(),
			
			//Ciclo i miei layer
            noDrawZone = me.getOverlayLayers().buffer.getLayers()[0],
            editHandler = me.getEditHandler(),
            drawHandler = me.getDrawHandler();
		
		// save draw mode
        me.setDrawMode(type);

        // layer already in map?
        if (layer) {

            if (layer instanceof L.Marker) {

                // marker layer
                if (type == 'point') { // edit already existent layer
                    // debugger;
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
                    var editHandler = new L.Edit.Marker(layer, {
                        noDrawZone: noDrawZone,
                        map: map
                    });
                    // save the handler
                    me.setEditHandler(editHandler);
                    // enable the handler
                    editHandler.enable();
                } else if (type == 'line'){
					// draw line
                    // send feedback, and eventually activate polyline draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create the draw handler
						drawHandler = new L.Draw.Polyline(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW, { noDrawZone: noDrawZone }));
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    //});
                }else if(type == 'polygon'){
					if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;	
						drawHandler = new L.Draw.Polygon(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));
					drawHandler.enable();
					me.setDrawHandler(drawHandler);
					me.fireEvent('drawmodechanage');
				}
            } else {
                // polyline layer
                if (type == 'line') {
					// edit
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					if(layer instanceof L.Polygon){
						featuresGroup.removeLayer(layer);
						delete layer;
						drawHandler = new L.Draw.Polyline(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));

						drawHandler.enable();
						me.setDrawHandler(drawHandler);
						me.fireEvent('drawmodechanage');
					}else{
						layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
							var editHandler = new L.Edit.Poly(layer, {
								noDrawZone: noDrawZone,
								map: map
							});
						// save the handler
						me.setEditHandler(editHandler);
						// enable the handler
						editHandler.enable();
					}
                } else if(type == 'point'){
					// draw marker
                    // send feedback, and eventually activate marker draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create drawing marker
                    var icon = L.icon({
                        iconUrl: 'resources/markers/blue.png',
                        iconSize: [29, 38],
                        iconAnchor: [15, 38],
                        popupAnchor: [0, -38]
                    });
                    // create the draw handler
						drawHandler = new L.Draw.Marker(me.getMap(), {
                        icon: icon,
                        noDrawZone: noDrawZone
                    });
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // map.on('draw:created', me.onDrawCreated, me);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    // });
                }else if(type == 'polygon'){
					if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
					
					if(layer instanceof L.Polyline){
						featuresGroup.removeLayer(layer);
						delete layer;
							drawHandler = new L.Draw.Polygon(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW,{ noDrawZone: noDrawZone}));
						drawHandler.enable();
						me.setDrawHandler(drawHandler);
						me.fireEvent('drawmodechanage');
					}else{
						layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
							var editHandler = new L.Edit.Poly(layer, {
							noDrawZone: noDrawZone,
							map: map
							});
						// save the handler
						me.setEditHandler(editHandler);
						// enable the handler
						editHandler.enable();
					}
										
				}
            }
        } // end if layer already on map
        else {

            if (type == 'point') {

                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
                // create drawing marker
                var icon = L.icon({
                    iconUrl: 'resources/markers/blue.png',
                    iconSize: [29, 38],
                    iconAnchor: [15, 38],
                    popupAnchor: [0, -38]
                });
                // create the draw handler
					var handler = new L.Draw.Marker(me.getMap(), {
                    icon: icon,
                    noDrawZone: noDrawZone
                });
            } else if(type == 'line') {
                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
					var handler = new L.Draw.Polyline(me.getMap(),
                    Ext.apply(
                        SIO.view.submissions.Map.DRAW, {
                            noDrawZone: noDrawZone
                        }
                    )
                );
            }else if(type == 'polygon'){
				if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }

				var handler = new L.Draw.Polygon(me.getMap(),
					Ext.apply(
							SIO.view.submissions.Map.DRAW, {
								noDrawZone: noDrawZone
							}));
			}
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            // map.on('draw:created', me.onDrawCreated, me);
        } // end if layer not already on map


        /*
        // draw or edit?
        if (layer) { // edit
            // destroy previous handler
            var handler = me.getEditHandler();
            if (handler) delete handler;
            layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
            // TODO: backup the layer?
            if (type == 'point') {
                var handler = new L.Edit.Marker(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            } else {
                var handler = new L.Edit.Poly(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            }
            // enable the handler
            handler.enable();
            // save the handler
            me.setEditHandler(handler);
        } else { // draw
            // destroy previous handler
            var handler = me.getDrawHandler();
            if (handler) delete handler;
            if (type == 'point')
                var handler = new L.Draw.Marker(me.getMap(), SIO.view.submissions.Map.DRAW);
            else
                var handler = new L.Draw.Polyline(me.getMap(), SIO.view.submissions.Map.DRAW);
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            map.on('draw:created', me.onDrawCreated, me);
        }
        */
    },
    /*startDraw: function(type) {
        var me = this,
            map = me.getMap(),
            featuresGroup = me.getOverlayLayers().submissions,
            layer = me.getDrawLayer(),
            noDrawZone = me.getOverlayLayers().buffer.getLayers()[0],
            editHandler = me.getEditHandler(),
            drawHandler = me.getDrawHandler();


        // save draw mode
        me.setDrawMode(type);
        // layer already in map?
        if (layer) {
            if (layer instanceof L.Marker) {
                // marker layer
                if (type == 'point') { // edit already existent layer
                    // debugger;
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
                    var editHandler = new L.Edit.Marker(layer, {
                        noDrawZone: noDrawZone,
                        map: map
                    });
                    // save the handler
                    me.setEditHandler(editHandler);
                    // enable the handler
                    editHandler.enable();
                } else { // draw polygon
                    // send feedback, and eventually activate polyline draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create the draw handler

                    drawHandler = new L.Draw.Polygon(me.getMap(), Ext.apply(SIO.view.submissions.Map.DRAW, { noDrawZone: noDrawZone }));
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    //});
                }
            } else {
                // polyline layer
                if (type == 'polygon') { // edit
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
                    var editHandler = new L.Edit.Poly(layer, {
                        noDrawZone: noDrawZone,
                        map: map
                    });
                    // save the handler
                    me.setEditHandler(editHandler);
                    // enable the handler
                    editHandler.enable();
                } else { // draw marker
                    // send feedback, and eventually activate marker draw
                    // SIO.Utilities.alert('Attenzione', 'Il disegno precedentemente creato verrà cancellato', function(btn) {
                    // disable and destroy previous handlers
                    if (editHandler) {
                        editHandler.disable();
                        delete editHandler;
                    }
                    if (drawHandler) {
                        drawHandler.disable();
                        delete drawHandler;
                    }
                    // remove layer from map
                    featuresGroup.removeLayer(layer);
                    delete layer;
                    // create drawing marker
                    var icon = L.icon({
                        iconUrl: 'resources/markers/blue.png',
                        iconSize: [29, 38],
                        iconAnchor: [15, 38],
                        popupAnchor: [0, -38]
                    });
                    // create the draw handler
                    drawHandler = new L.Draw.Marker(me.getMap(), {
                        icon: icon,
                        noDrawZone: noDrawZone
                    });
                    // enable the handler
                    drawHandler.enable();
                    // save the handler
                    me.setDrawHandler(drawHandler);
                    // map.on('draw:created', me.onDrawCreated, me);
                    // fire event
                    me.fireEvent('drawmodechanage');
                    // });
                }
            }
        } // end if layer already on map
        else {
            if (type == 'point') {
                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
                // create drawing marker
                var icon = L.icon({
                    iconUrl: 'resources/markers/blue.png',
                    iconSize: [29, 38],
                    iconAnchor: [15, 38],
                    popupAnchor: [0, -38]
                });
                // create the draw handler
                var handler = new L.Draw.Marker(me.getMap(), {
                    icon: icon,
                    noDrawZone: noDrawZone
                });
            } else {
                // disable and destroy previous handlers
                if (editHandler) {
                    editHandler.disable();
                    delete editHandler;
                }
                if (drawHandler) {
                    drawHandler.disable();
                    delete drawHandler;
                }
                var handler = new L.Draw.Polygon(me.getMap(),
                    Ext.apply(
                        SIO.view.submissions.Map.DRAW, {
                            noDrawZone: noDrawZone
                        }
                    )
                );
            }
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            // map.on('draw:created', me.onDrawCreated, me);
        } // end if layer not already on map


        /*
        // draw or edit?
        if (layer) { // edit
            // destroy previous handler
            var handler = me.getEditHandler();
            if (handler) delete handler;
            layer.options.editing = SIO.view.submissions.Map.EDIT.selectedPathOptions;
            // TODO: backup the layer?
            if (type == 'point') {
                var handler = new L.Edit.Marker(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            } else {
                var handler = new L.Edit.Poly(layer, {
                    noDrawZone: noDrawZone,
                    map: map
                });
            }
            // enable the handler
            handler.enable();
            // save the handler
            me.setEditHandler(handler);
        } else { // draw
            // destroy previous handler
            var handler = me.getDrawHandler();
            if (handler) delete handler;
            if (type == 'point')
                var handler = new L.Draw.Marker(me.getMap(), SIO.view.submissions.Map.DRAW);
            else
                var handler = new L.Draw.Polyline(me.getMap(), SIO.view.submissions.Map.DRAW);
            // enable the handler
            handler.enable();
            // save the handler
            me.setDrawHandler(handler);
            map.on('draw:created', me.onDrawCreated, me);
        }
        
    },*/

    clearDraw: function() {
        var me = this,
            map = me.getMap(),
            featuresGroup = me.getOverlayLayers().submissions,
            editHandler = me.getEditHandler(),
            drawHandler = me.getDrawHandler(),
            layer = me.getDrawLayer();
        if (editHandler) {
            editHandler.disable();
            delete editHandler;
        }
        if (drawHandler) {
            drawHandler.disable();
            delete drawHandler;
        }
        me.setEditHandler(null);
        me.setDrawHandler(null);
        if (layer) {
            featuresGroup.removeLayer(layer);
            delete layer;
        }
        me.setDrawLayer(null);
    },

    onDrawCreated: function(e) {

        var me = this,
            drawMode = me.getDrawMode(),
            layer = e.layer;
        // save to global
        me.setDrawLayer(layer);
        // add to submissions features group
        me.getOverlayLayers().submissions.addLayer(layer);
        // fire global event
        //me.fireEvent('drawcreated', layer);
        // start edit mode
        //me.startDraw(drawMode);
    },

    onDrawModified: function(e) {
        var me = this,
            layer = e.layer;
        me.fireEvent('drawmodified', layer);
    },

    buildBaseLayers: function() {
        var me = this,
            map = me.getMap(),
            baseLayers = SIO.Settings.getMapLayers().base,
            output = {},
            first = true;
		
		
        // loop over ini settings...
        Ext.Object.each(baseLayers, function(key, value) {
            if (value.type == 'tms' || value.type == 'osm') {
                var layer = L.tileLayer(value.url, value.options);
            } else {
                var layer = L.tileLayer.wms(value.url, value.options);
            }
            output[value.title] = layer;
            if (first) {
                layer.addTo(map);
                first = false;
            }
        });
		
		/*output['DBT'] = L.tileLayer('http://geodbt.cittametropolitana.mi.it/mapproxy/tiles/geodbt_map/webmercator/{z}/{x}/{y}.png', {
            maxZoom: 20,
            attribution: '&copy; 2016 - Citt&agrave; Metropolitana di Milano'
        }).addTo(map);
        output['DBT + Ortofoto 2015'] = L.layerGroup([
            L.tileLayer('http://geodbt.cittametropolitana.mi.it/mapproxy/tiles/geodbt_map/webmercator/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '&copy; 2016 - Citt&agrave; Metropolitana di Milano'
            }), 
            L.tileLayer('http://geodbt.cittametropolitana.mi.it/mapproxy/tiles/geodbt_ortofoto2015/webmercator/{z}/{x}/{y}.jpeg', {
                maxZoom: 20,
                attribution: '<a href="http://www.sit-puglia.it"><b>Servizi di Informazione Territoriale S.r.l.</b></a>',
                opacity: 0.3
            })
        ]);
        output['Ortofoto 2015'] = L.tileLayer('http://geodbt.cittametropolitana.mi.it/mapproxy/tiles/geodbt_ortofoto2015/webmercator/{z}/{x}/{y}.jpeg', {
			maxZoom: 20,
			attribution: '<a href="http://www.sit-puglia.it"><b>Servizi di Informazione Territoriale S.r.l.</b></a>'
		});*/
		var options;
		output['Nessun layer'] = L.tileLayer('void',options);
        return output;
    },

    buildMiniMap: function() {
        var me = this,
            map = me.getMap(),
            miniMapDefinition = SIO.Settings.getMapLayers().minimap,
            layer = L.tileLayer(miniMapDefinition.url, miniMapDefinition.options);
        var a = L.control.minimap(layer, {
            toggleDisplay: true,
			position: 'bottomleft'
        }).addTo(map);
    },

    buildLegend: function(map) {
        /*var legend = L.control({position: 'topleft'});
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend'),
                grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                labels = [],
                from, to;
            labels.push('<b>Legenda</b>');

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);*/

    },

    buildOverlayLayers: function() {
        var me = this,
            map = me.getMap(),
            overlayLayersDefinition = SIO.Settings.getMapLayers().overlay,
            layers = {},
            layersGroup = {
                'Tematismi': {}
            };
			
		/*
		// ortofoto 2015
		layers['ortofoto2015'] = L.tileLayer(SIO.Settings.data.map.layers.overlay.ortofoto2015.url, {
            attribution: SIO.Settings.data.map.layers.overlay.ortofoto2015.options.attribution,
			maxZoom: SIO.Settings.data.map.layers.overlay.ortofoto2015.options.maxZoom
        });
        layersGroup['Tematismi']['<img src="resources/markers/ortofoto.png" width="20" height="20" style="margin-bottom: -8px;">&nbsp;Ortofoto 2015'] = layers['ortofoto2015'];			
		
		// geodbt
        layers['geodbt'] = L.tileLayer(SIO.Settings.data.map.geodbt.base.url, {
            layers: SIO.Settings.data.map.geodbt.base.layers,
            attribution: SIO.Settings.data.map.geodbt.base.attribution
        });
        layersGroup['Tematismi']['<img src="resources/markers/geodbt.png" width="20" height="20" style="margin-bottom: -8px;">&nbsp;GeoDBT'] = layers['geodbt'];
		*/
		if(overlayLayersDefinition){
				for(i=0; i<overlayLayersDefinition.length; i++) {
					if(overlayLayersDefinition[i].active){
						layers[overlayLayersDefinition[i].code] = L.tileLayer.wms(overlayLayersDefinition[i].url, overlayLayersDefinition[i].options).addTo(map);
					}else{
						layers[overlayLayersDefinition[i].code] = L.tileLayer.wms(overlayLayersDefinition[i].url, overlayLayersDefinition[i].options)
					}
				layersGroup['Tematismi']['<img src="'+ overlayLayersDefinition[i].photo+'" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition[i].title] = layers[overlayLayersDefinition[i].code];
				}
			}
        // build town limits layer
       /* layers['comuni'] = L.tileLayer.wms(overlayLayersDefinition.limits.url, overlayLayersDefinition.limits.options).addTo(map);
		layers['aree_sigeo'] = L.tileLayer.wms(overlayLayersDefinition.aree_sigeo.url, overlayLayersDefinition.aree_sigeo.options).addTo(map);
		layers['quadro_unione_cm'] = L.tileLayer.wms(overlayLayersDefinition.quadro_unione_cm.url, overlayLayersDefinition.quadro_unione_cm.options).addTo(map);
        layersGroup['Tematismi']['<img src="resources/markers/limits.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition.limits.title] = layers['comuni'];
		layersGroup['Tematismi']['<img src="resources/markers/aree_sigeo.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition.aree_sigeo.title] = layers['aree_sigeo'];
		layersGroup['Tematismi']['<img src="resources/markers/quadro_unione_cm.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition.quadro_unione_cm.title] = layers['quadro_unione_cm'];
        */
		// zone ril
		layers['zoneril'] = L.topoJSON('data/zone_ril_4326.json', null, {
			classifyProperty: 'data_agg',
			colorScheme: 'YlGnBu',
			fullTpl: [
				'<div class="row underlined">DATA AGGIORNAMENTO: <span class="value">{data_agg}</span></div>',
				'<div class="row">ID Ripresa Aerea: <span class="value">{zona_r_rai}</span></div>',
				'<div class="row">Ente Realizzatore: <span class="value">{zona_r_ent}</span></div>',
				'<div class="row">Ditta Esecutrice: <span class="value">{zona_r_dt}</span></div>',
				'<div class="row">Collaudatore: <span class="value">{zona_r_col}</span></div>',
				'<div class="row">ID Zona Rilievo: <span class="value">{zona_r_id}</span></div>'
			].join(''),
			emptyTpl: 'Data Aggiornamento: Non Presente'
		});
        //layersGroup['Tematismi']['<img src="resources/markers/limits.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp; Zone Rilievo'] = layers['zoneril'];
		
		// build criticita layer
		/*
        layers['criticita'] = L.tileLayer.wms(overlayLayersDefinition.criticita.url, overlayLayersDefinition.criticita.options).addTo(map);
        layersGroup['Tematismi']['<img src="resources/markers/criticita.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;' + overlayLayersDefinition.criticita.title] = layers['criticita'];
		*/
        
		// build buffer layer
        if (SIO.Settings.getTownBufferGeoJson() && SIO.Settings.getTownBufferGeoJson().length) {
            layers['buffer'] = L.geoJson(SIO.Settings.getTownBufferGeoJson(), {
                clickable: false,
                style: SIO.view.submissions.Map.BUFFER.style
            }).addTo(map);
            layersGroup['Tematismi']['<img src="resources/markers/buffer.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;Limiti di disegno'] = layers['buffer'];
        }		
		
        

        // add submissions layer
        var greenIcon = L.icon({
            iconUrl: 'resources/markers/green.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        var redIcon = L.icon({
            iconUrl: 'resources/markers/red.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        var yellowIcon = L.icon({
            iconUrl: 'resources/markers/yellow.png',
            iconSize: [29, 38],
            iconAnchor: [15, 38],
            popupAnchor: [0, -38]
        });
        layers['submissions'] = L.geoJson(null, {
            style: function(feature) {
                var color;
                switch (feature.geometry.properties.opinions_status) {
                    case 3:
                        color = '#00ff00';
                        break;
                    case 2:
                        color = '#ff0000';
                        break;
                    default:
                        color = '#00ff00';
                }
                if (feature.geometry.type != 'Point') {
                    return {
                        color: color,
                        opacity: 0.9
                    };
                }
            },
            pointToLayer: function (feature, latlng) {
                switch (feature.properties.opinions_status) {
                    case 3:
                        return L.marker(latlng, {
                            icon: greenIcon
                        });
                        break;
                    case 2:
                        return L.marker(latlng, {
                            icon: redIcon
                        });
                        break;
                    default:
                        return L.marker(latlng, {
                            icon: greenIcon
                        });
                }
            },
            onEachFeature: function(feature, layer) {
                // does this feature have a property named popupContent?
                if (feature.properties && feature.properties.from_town_name) {
                    var status,linkText;

                    /*if (feature.properties.opinions_status == 1) {
                        status = 'In discussione';
                    } else if (feature.properties.opinions_status == 2) {
                        status = 'Mancato accordo';
                    } else {
                        status = 'Accordo';
                    }*/
                    linkText = "";
                    //if (feature.properties.is_owner) {
                        linkText = 'Vedi dettaglio';
                    //}

                    /*else {
                        linkText = 'Partecipa alla discussione';
                    }*/
                    var template = [
                        '<b>Data: </b> ' + Ext.Date.format(new Date(feature.properties.created.replace(" ","T")), 'd-m-Y'),
                        '<b>Ente/Comune proponente: </b> {from_town_name}',
                        /*'<b>Attuale stato: </b> ' + status,*/
                        '',
                        '<a href="#" onclick="SIO.viewSubmission(' + feature.properties.id + ');">' + linkText + '</a>'
                    ];
                    layer.bindPopup( L.Util.template(template.join('<br />'), feature.properties), {
                        //offset: [0, 7]
                        closeOnClick: true,
                        autoPan: true,
                        keepInView: true,
                        closeButton: false
                    });
                }
            }
        }).addTo(map);
		
        // layersGroup['Tematismi']['<img src="resources/markers/limits.png" width="24" height="24" style="margin-bottom: -8px;">&nbsp;Osservazioni'] = layers['submissions'];
        layersGroup['Tematismi']['Osservazioni'] = layers['submissions'];
        // save layer
        me.setOverlayLayers(layers);
        return layersGroup;
    },

    overrideLeafletDrawLocale: function() {
        L.drawLocal.draw.handlers.marker.tooltip.start = 'Fai click in mappa per posizionare il marker.';
        L.drawLocal.draw.handlers.polyline.tooltip.start = 'Fai click per iniziare a disegnare.';
        L.drawLocal.draw.handlers.polyline.tooltip.cont = 'Fai click per continuare a disegnare.';
        L.drawLocal.draw.handlers.polyline.tooltip.end = 'Fai click sull\'ultimo vertice per completare il disegno.';
        L.drawLocal.edit.handlers.edit.tooltip.text = 'Trascina i vertici o il marker per modificare il disegno.';
    }
});
