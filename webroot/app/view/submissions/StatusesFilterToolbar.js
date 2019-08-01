Ext.define('SIO.view.submissions.StatusesFilterToolbar', {
    extend: 'Ext.toolbar.Toolbar',
    alias: 'widget.submissions.statusesfiltertoolbar',


    style: {
        marginBottom: '5px'
    },

    config: {
        buttonValue: 0,
        filter: null
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            defaults: {
                allowDepress: false,
                handler: me.buttonHandler,
                scope: me
            },
            items: [
                '->',
                {
                    text: 'Esporta',
                    toggleGroup: null,
                    menu: [
                        {
                            text: 'Formato CSV',
                            iconCls: 'icon-csv',
                            handler: function() {
                                window.open('submissions/export.csv');
                            }
                        },
                        {
                            text: 'Formato KML (Google Earth)',
                            iconCls: 'icon-kml',
                            handler: function() {
                                window.open('submissions/export.kml');
                            }
                        },
						{
							text: 'Formato SHAPE',
							iconCls: 'icon-shape',
							toggleGroup: null,
							menu: [
								{
									text: 'Linee',
									iconCls: 'icon-line',
									handler: function() {
										var params = {};
										params.type = 'line';
										SIO.Services.exportShape(params, function(response) {											
												if (response.result.success) {												
													window.open(response.result.data);
												} else {
													if(response.result.msg){
														Ext.Msg.alert('Attenzione',response.result.msg);
													}else{
														Ext.Msg.alert('Errore','Errore del server. Riprovare più tardi.');
													}
												}
											});
									}
								},
								{
									text: 'Punti',
									iconCls: 'icon-point',
									handler: function() {
										var params = {};
										params.type = 'point';
										SIO.Services.exportShape(params, function(response) {
												if (response.result.success) {
													window.open(response.result.data);
													//success

												} else {
													if(response.result.msg){
														Ext.Msg.alert('Attenzione',response.result.msg);
													}else{
														Ext.Msg.alert('Errore','Errore del server. Riprovare più tardi.');
													}
												}
											});
									}
								},
								{
									text: 'Poligoni',
									iconCls: 'icon-polygon',
									handler: function() {
										var params = {};
										params.type = 'polygon';
										SIO.Services.exportShape(params, function(response) {
												if (response.result.success) {													
													window.open(response.result.data);
												} else {
													if(response.result.msg){
														Ext.Msg.alert('Attenzione',response.result.msg);
													}else{
														Ext.Msg.alert('Errore','Errore del server. Riprovare più tardi.');
													}
												}
											});
									}
								},
							]
						}
                    ],
                    listeners: {
                        render: function(btn) {
                            Ext.getStore('Submissions').on('load', function(store, records) {							
                                btn.setDisabled(records.length == 0);
								
                            });
                        }
                    }
                },
                {
                    text: 'Nuova Osservazione',
                    style: 'color: red !important;',
                    cls: 'btn-red',
                    glyph: 61504,
                    itemId: 'newSubmissionBtn',
                    toggleGroup: null,
                    hidden: false,
                    listeners: {
                        /*render: function() {
                            if(SIO.Settings.isTown()) this.show();
                        },*/
                        click: function() {
                            if (SIO.Settings.data.submissions_enable) {
                                Ext.globalEvents.fireEvent('newsubmission');
                            } else {
                                SIO.Utilities.alert('Attenzione', 'Il periodo di concertazione &egrave; terminato<br />(dal ' + SIO.Settings.data.startDate + ' al ' + SIO.Settings.data.endDate + ')');
                            }
                        }
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    reset: function() {
        var me = this,
            allButton = me.down('#all');
        allButton.toggle(true);
    },

    buttonHandler: function(button) {
        var me = this,
            filter = null;
        if (button.value != me.getButtonValue()) {
            var submissionsStore = Ext.getStore('Submissions');
            // remove previous filters (if present)
            if (me.getFilter()) {
                // submissionsStore.removeFilter(me.getFilter(), button.value == 0);
                // submissionsStore.removeFilter(me.getFilter());
                submissionsStore.filters.removeAtKey(me.getFilter());
                if (button.value == 0) {
                    submissionsStore.load();
                }
            }
            if (button.value > 0) {
                // set filter id
                filter = Ext.id();
                // filter the store
                submissionsStore.filter([
                    Ext.create('Ext.util.Filter', {
                        id: filter,
                        property: 'opinions_status',
                        value: button.value,
                        root: 'data'
                    })
                ]);
            }
            me.setFilter(filter);
            me.setButtonValue(button.value);
        }
    }

});