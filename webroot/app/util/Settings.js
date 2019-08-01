Ext.define('SIO.util.Settings', {
        singleton: true,
        alternateClassName : ['SIO.Settings'],

        baseUrl: 'http://vps109638.ovh.net/sos-dashboard/app/',
        usernameMinLength: 5,
        passwordMinLength: 5,

        data: null,
        /*
        config: {
            user: {},
            startDate: null,
            endDate: null,
            loaded: false,
            logged: true
        }
        */
        init: function(data) {
            this.data = data;
        },
		getTitle: function() {
			return this.data.title;
		},
		getInfo: function() {
			return this.data.enableInfo;
		},
		getPrint: function() {
			return this.data.enablePrint;
		},
		getSubmissionStatus: function() {
			return this.data.submissions_enable;
		},
		getGeometries: function () {
			return this.data.geometries;
		},
		getAllowPoint: function () {
			return this.data.geometries.allow_point;
		},
		getAllowLine: function () {
			return this.data.geometries.allow_line;
		},
		getAllowPoligon: function () {
			return this.data.geometries.allow_polygon;
		},
		getDataProj: function(){
			var ss = 'EPSG'+this.data.map.dataProj;
			var crs = L.CRS[ss];
			return crs;
			//return this.data.map.dataProj;
		},
		getDisplayProj: function(){
			return this.data.map.displayProj
		},
        getStartDate: function() {
            return this.data.startDate;
        },

        getEndDate: function() {
            return this.data.endDate;
        },
		getXMax: function() {
			return this.data.xmax;
		},
		getYMax: function() {
			return this.data.ymax;
		},
		getXMin: function() {
			return this.data.xmin;
		},
		getYMin: function() {
			return this.data.ymin;
		},

        isTown: function() {
            return this.data.user.town_id > 0;
        },

        isProvince: function() {
            return this.data.user.town_id == 0;
        },

        isAdmin: function() {
            return this.data.user.is_admin;
        },

        getUser: function() {
            return this.data.user;
        },

        getTownBufferGeoJson: function() {
            return this.data.map.town_buffer_geojson;
        },

        getMapLayers: function() {
            return this.data.map.layers;
        },

        getTownMaxBounds: function() {
            if (this.data.map.town_max_bounds) {
                return this.data.map.town_max_bounds.split(',');
            } else {
                return false;
            }
        },

        getTownNeighborsId: function() {
            var data = this.data.map.town_neighbors,
                output = [];
            for (var i=0; i<data.length; i++) {
                output.push(data[i].properties.gid);
            }
            return output;
        },

        getTownNeighborsGeoJSON: function() {
            return this.data.map.town_neighbors;
        }
//<debug>
    },
    function () {
        this.baseUrl = '../desktop/app/';
//</debug>
});