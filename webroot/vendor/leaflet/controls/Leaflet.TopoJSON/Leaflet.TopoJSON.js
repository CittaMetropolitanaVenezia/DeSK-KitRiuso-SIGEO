L.TopoJSON = L.GeoJSON.extend({
	options: {
		infoPanelPosition: 'bottomleft',
		zoomToFeatureOnClick: false,
		classifyProperty: 'data_agg',
		colorScheme: 'Paired',
		defaultStyle: {
			fillOpacity: 0.7,
			color: '#fff',
			weight: 1,
			opacity: .5
		},
		fullTpl: '',
		emptyValueText: 'NON PRESENTE'
	},
	
	initialize: function (url, geojson, options) {
		var me = this;
		L.setOptions(this, options);
		// init data domain
		this._classifyPropertyDomain = [];
		this._layers = {};
		this._chroma = null;
		this._curReq = null;
		this._data = null;
		// bind function
		this.options.onEachFeature = L.Util.bind(this._classifyFeature, this);
		// make call?
		if (url) {
			// fire event
			this.fire('dataloading', {req: url });
			this._curReq = this._getAjax(url, function(json) {
				// reset connection
				me._curReq = null;
				// fire event
				me.fire('dataloaded', {data: json});
				// load data
				if (json && typeof json === 'object') {
					me.addData(json);
				}
			});
		} 
		// or (directly) load data?
		else if (geojson) {
			this.addData(geojson);
		}
	},
	
	onAdd: function(map) {
		// call parent method
		L.GeoJSON.prototype.onAdd.call(this, map);
		// init info panel
		this._infoPanel = this._initInfoPanel();
		this._infoPanel.addTo(map);
	},
	
	onRemove: function(map) {
		// remove info panel
		this._map.removeControl(this._infoPanel);
		// call parent method
		L.GeoJSON.prototype.onRemove.call(this, map);
	},
	
	addData: function(jsonData) {    
		if (jsonData.type === "Topology") {
			for (key in jsonData.objects) {
				geojson = topojson.feature(jsonData, jsonData.objects[key]);
				// classify?
				if (this.options.classifyProperty) {
					for (var i=0; i<geojson.features.length; i++) {
						if (geojson.features[i].properties.hasOwnProperty(this.options.classifyProperty)) {
							// not null?
							if (geojson.features[i].properties[this.options.classifyProperty]) {
								this._classifyPropertyDomain.push(geojson.features[i].properties[this.options.classifyProperty]);
							}
						}
					}
					// make unique
					this._classifyPropertyDomain = this._makeUnique(this._classifyPropertyDomain);
					// sort
					this._classifyPropertyDomain = this._classifyPropertyDomain.sort();
					// init chroma
					this._chroma = chroma
						.scale(this.options.colorScheme)
						.domain([0, this._classifyPropertyDomain.length-1]);
				}				
				// call parent method
				L.GeoJSON.prototype.addData.call(this, geojson);
			}
		} else {
			L.GeoJSON.prototype.addData.call(this, jsonData);
		}
	},
	
	_initInfoPanel: function() {
		var me = this,
			info = L.control({
			position: this.options.infoPanelPosition
		});
		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'topojson-info');
			return this._div;
		};
		info.update = function (props) {
			var html = '';
			if (typeof props === 'object') {
				for (var prop in props) {
					if (!props[prop]) {
						props[prop] = me.options.emptyValueText;
					}
				}
				html = L.Util.template(me.options.fullTpl, props);
			}
			this._div.innerHTML = html;
			this._div.style.display = 'block';
		};
		info.hide = function() {
			this._div.style.display = 'none';
		};
		return info;
	},
	
	_classifyFeature: function(feature, layer) {
		var me = this;
		if (this.options.classifyProperty) {
			// find index
			var dataDomain = this._classifyPropertyDomain,
				properties = feature.properties,
				idx = 0,
				fillColor = 'transparent';
			if (dataDomain.indexOf(properties.data_agg) > -1) {
				for (var i=0; i<dataDomain.length; i++) {
					if (properties[this.options.classifyProperty] && properties[this.options.classifyProperty] == dataDomain[i]) {
						idx = i;
						break;
					}
				}
				fillColor = this._chroma(idx).hex();
			}		
			// create style
			L.Util.extend(this.options.defaultStyle, { fillColor: fillColor });
			// set feature style
			layer.setStyle(this.options.defaultStyle);
			// set feature handlers
			layer.on({
				mouseover : L.Util.bind(this._featureMouseOver, this),
				mouseout: L.Util.bind(this._featureMouseOut, this)			  
			}, this);
			// add click handler only if needed
			if (this.options.zoomToFeatureOnClick) {
				layer.on({
					click: L.Util.bind(this._featureClick, this)
				});
			} else {
				layer.on('click', function(e) {
					me._map.fire('click', e);
				});
			}
		}			
	},
	
	_featureClick: function(e) {
		this._map.fitBounds(e.target.getBounds());
	},
	
	_featureMouseOver: function(e) {
		var me = this,
			feature = e.target.feature;
		// update info panel
		me._infoPanel.update(feature.properties);
		// update feature style
		e.target.bringToFront();
		e.target.setStyle({
			weight: 3,
			opacity: 1
		});
	},
	
	_featureMouseOut: function(e) {
		var me = this,
			feature = e.target.feature;
		// hide info panel
		me._infoPanel.hide();
		// reset feature style
		me.bringToBack();
		e.target.setStyle({
			weight: 1,
			opacity: 0.5
		});
	},
	
	_makeUnique: function(data){
		var u = {}, a = [];
		for(var i = 0, l = data.length; i < l; ++i){
			if(u.hasOwnProperty(data[i])) {
				continue;
			}
			a.push(data[i]);
			u[data[i]] = 1;
		}
		return a;
	},
	
	//default ajax request
	_getAjax: function(url, cb) {
		if (window.XMLHttpRequest === undefined) {
			window.XMLHttpRequest = function() {
				try {
					return new ActiveXObject("Microsoft.XMLHTTP.6.0");
				}
				catch  (e1) {
					try {
						return new ActiveXObject("Microsoft.XMLHTTP.3.0");
					}
					catch (e2) {
						throw new Error("XMLHttpRequest is not supported");
					}
				}
			};
		}
		var request = new XMLHttpRequest();
		request.open('GET', url);
		request.onreadystatechange = function() {
			var response = {};
		    if (request.readyState === 4 && request.status === 200) {
		    	try {
					if(window.JSON) {
				        response = JSON.parse(request.responseText);
					} else {
						response = eval("("+ request.responseText + ")");
					}
		    	} catch(err) {
		    		console.info(err);
		    		response = {};
		    	}
		        cb(response);
		    }
		};
		request.send();
		return request;
	}
});

L.topoJSON = function (url, geojson, options) {
    return new L.TopoJSON(url, geojson, options);
};