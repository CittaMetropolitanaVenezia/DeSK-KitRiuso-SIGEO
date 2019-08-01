L.Control.QGisPrint = L.Control.extend({

	options: {
		title: 'Stampa DBT',
		position: 'topright',
		scales: [10000, 5000, 2000],
		emptyText: 'Scala',
		printAreaSize: [280, 180],
		resolution: 150,
		urlTpl: 'http://www.example.com'
	},

	initialize: function (options) {
		L.Util.extend(this.options, options);
		this._rectangle = null;
	},
	
	resetLink: function(extraClass) {
        var link = this._container.querySelector('a');
        link.className = 'leaflet-bar-part leaflet-bar-part-single' + ' ' + extraClass;
    },

    onAdd: function (map) {
		var me = this;
        this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-qgisprint');

        // create the link - this will contain one of the icons
        var link = L.DomUtil.create('a', '', this._container);
        link.href = '#';
        link.title = this.options.title;

        // set the link's icon to magnifying glass
        this.resetLink('print');

        // create the form that will contain the input
        var form = L.DomUtil.create('form', 'displayNone', this._container);
		
		// change style based on position
		if (this.options.position.indexOf('left') > -1) {
			form.style.left = '22px';
		} else {
			form.style.right = '22px';
			form.style.width = '155px';
		}
		
		// print button
		var button = L.DomUtil.create('input', 'go-print', form);
		button.type = 'button';
		button.value = 'Stampa';
		this._button = button;

        // create the input, and set its placeholder text
        var scalebox = L.DomUtil.create('select', null, form);
		//scalebox.dir = 'rtl';
		var option = L.DomUtil.create('option', null, scalebox);
		option.text = this.options.emptyText;
		option.value = '';
		
		// add scale options
		for (var i=0; i<this.options.scales.length; i++) {
			var option = L.DomUtil.create('option', null, scalebox);
			option.text = '1:' + this.options.scales[i];
			option.value = this.options.scales[i];
		}
        // save reference
        this._scalebox = scalebox;
		this._form = form;
		
		// attach events
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
			.on(link, 'click', this._toggle, this)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        L.DomEvent
            .addListener(this._scalebox, 'change', this._onScaleChange, this);
		
		L.DomEvent
			.addListener(this._button, 'click', this._onPrint, this);
		
        L.DomEvent.disableClickPropagation(this._container);

        return this._container;
    },
	
	onRemove: function () {
		// remove rectangle layer
		if (this._rectangle) {
			this._map.removeLayer(this._rectangle);
			this._rectangle = null;
		}
		L.Control.prototype.onRemove.call(this);
	},

	_toggle: function() {
		if (L.DomUtil.hasClass(this._form, 'displayNone')) {
			L.DomUtil.removeClass(this._form, 'displayNone'); // unhide form
			// reset scalebox
			this._scalebox.selectedIndex = 0;
			this._scalebox.focus();
		} else {
			L.DomUtil.addClass(this._form, 'displayNone'); // hide form
			if (this._rectangle) {
				this._map.removeLayer(this._rectangle);
				this._rectangle = null;
			}
		}
	},

	_onPrint: function() {
		if (this._rectangle) {
			// project
			// define proj
			Proj4js.defs["EPSG:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
			Proj4js.defs["EPSG:3857"] = "+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
			var crs = 'EPSG:32632',
				scale = this._scalebox.value,
				dpi = this.options.resolution,
				rotation = this._rectangle.rotation,
				// rectangle bounds
				bounds = this._rectangle.getBounds(),
				southWest = bounds.getSouthWest(),
				northEast = bounds.getNorthEast(),
				// define projs
				source = new Proj4js.Proj('EPSG:4326'),
				dest = new Proj4js.Proj(crs),
				sw = new Proj4js.Point(southWest.lng, southWest.lat),
				ne = new Proj4js.Point(northEast.lng, northEast.lat);
			// project bounds
			Proj4js.transform(source, dest, sw);  
			Proj4js.transform(source, dest, ne);  
			var xmin = sw.x,
				ymin = sw.y,
				xmax = ne.x,
				ymax = ne.y;
			// render url
			var url = L.Util.template(this.options.urlTpl, {
				xmin: xmin, 
				ymin: ymin, 
				xmax: xmax, 
				ymax: ymax, 
				scale: scale, 
				crs: crs
			});				
			window.open(url, 'SIGEO_PRINT');
			// close the control
			this._toggle();
		}
	},
	
	_onScaleChange: function(e) {
		if (parseInt(this._scalebox.value)) {
			this._updatePrintSettings();
		}
	},
	
	_updatePrintSettings: function() {
		var me = this,
			INPUT_FORMAT = 'default',
			INPUT_ORIENTATION = (this.options.printAreaSize[0] > this.options.printAreaSize[1]) ? 'L' : 'P',
			INPUT_SCALE = parseInt(this._scalebox.value);
			
		var pageFormats = {
			'default': {width: this.options.printAreaSize[0], height: this.options.printAreaSize[1]}
		};	
		
		// start new
		var pageWidth = (INPUT_ORIENTATION == 'L') ? pageFormats[INPUT_FORMAT].width : pageFormats[INPUT_FORMAT].height,
			pageHeight = (INPUT_ORIENTATION == 'L') ? pageFormats[INPUT_FORMAT].height : pageFormats[INPUT_FORMAT].width,
			pagePxWidth = parseInt((pageWidth/0.03937) / 72),
			pagePxHeight = parseInt((pageHeight/0.03937) / 72);
		
		Proj4js.defs["EPSG:32632"] = "+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
		
		var source = new Proj4js.Proj('EPSG:4326');
		var dest = new Proj4js.Proj("EPSG:32632");
		
		//2100 : 72 = x : 96
		
		// 1cm = 10000
		var areaToPrintWidthMeters = (pageWidth/10 * INPUT_SCALE) / 100,
			areaToPrintHeightMeters = (pageHeight/10 * INPUT_SCALE) / 100;
		//console.log('areaToPrintWidthMeters', areaToPrintWidthMeters);
		//console.log('areaToPrintHeightMeters', areaToPrintHeightMeters);
		// convert center to meters
		var centerDD = this._map.getCenter(),
			centerM = new Proj4js.Point(centerDD.lng, centerDD.lat);
		Proj4js.transform(source, dest, centerM);  
		// get print area extent
		var xmin = centerM.x - areaToPrintWidthMeters/2,
			ymin = centerM.y - areaToPrintHeightMeters/2,
			xmax = centerM.x + areaToPrintWidthMeters/2,
			ymax = centerM.y + areaToPrintHeightMeters/2;
		var southWestPoint = new Proj4js.Point(xmin, ymin),
			northEastPoint = new Proj4js.Point(xmax, ymax);
		//console.log('southWestPoint', southWestPoint);
		//console.log('northEastPoint', northEastPoint);
		Proj4js.transform(dest, source, southWestPoint);  
		Proj4js.transform(dest, source, northEastPoint);  
		var southWestPrintArea = L.latLng(southWestPoint.y, southWestPoint.x),
			northEastPrintArea = L.latLng(northEastPoint.y, northEastPoint.x);
			
		var southWestPx = this._map.latLngToContainerPoint(southWestPrintArea),
			northEastPx = this._map.latLngToContainerPoint(northEastPrintArea);
			
		
		//console.log('southWestPx', southWestPx);
		//console.log('northEastPx', northEastPx);
		
		var polygonLatLngs = [ 
			[southWestPrintArea.lat, southWestPrintArea.lng], [southWestPrintArea.lat, northEastPrintArea.lng],
			[northEastPrintArea.lat, northEastPrintArea.lng], [northEastPrintArea.lat, southWestPrintArea.lng],
			[southWestPrintArea.lat, southWestPrintArea.lng]
		];
		
		// create an orange rectangle
		if (this._rectangle) {
			this._map.removeLayer(this._rectangle);
		}		

		this._rectangle = new L.Polygon(polygonLatLngs, {
			color: "#00ff00", 
			weight: 1,
			draggable: true
		}).addTo(this._map);
		
		this._rectangle.rotation = 0;
		/*
		rectangle.on('transformed', function(e) {
			debugger;
			var degrees = e.rotation * (180 / Math.PI);
			rectangle.rotation += degrees;
			console.info(degrees);
			map.panInsideBounds(rectangle.getBounds());
		});
		*/
		this._rectangle.on('dragend', function(e) {
			me._map.panInsideBounds(me._rectangle.getBounds());
		});
		
		me._map.fitBounds(L.latLngBounds(southWestPrintArea, northEastPrintArea), {
			animate: false
		});
	}
});

L.control.qgisprint = function (options) {
	return new L.Control.QGisPrint(options);
};