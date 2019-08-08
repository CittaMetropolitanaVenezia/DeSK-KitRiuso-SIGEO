Ext.define('SIO.view.admin.projects.settings', {
    extend: 'Ext.form.Panel',
    alias: 'widget.admin.projects.settings',

    requires:[
        'Ext.form.FieldSet',
        'SIO.ux.form.field.HelpText',
		'SIO.view.admin.baselayers.panel',
		'SIO.view.admin.overlaylayers.panel',
		'SIO.view.admin.submissiontypes.panel',
        'Ext.form.FieldContainer'
    ],
    title: 'Impostazioni progetto',
    overflowY: 'auto', //Scroll verticale
    config: {
        defaultValues: null
    },
    initComponent: function() {
        var me = this;
		//Osservazioni
		var remarks = Ext.create('Ext.data.Store', {
			fields: ['value', 'label'],
			data : [
				{"value":"t", "label":"Sì"},
				{"value":"f", "label":"No"},
			]
		});
		var projections = Ext.create('Ext.data.Store', {
			fields: ['proj'],
			data : [
				{"proj":"3395"},
				{"proj":"3857"},
				{"proj":"4326"},
				{"proj":"900913"},
					
			]
		});
		
        Ext.apply(me, {
            items: [
                {
                    xtype: 'fieldset',
                    style: {
                        marginTop: '5px'
                    },
                    title: 'Generale',
                    collapsed: false,
                    listeners: {
                        //add a * when allowBlank false
                        beforeadd: function(fs, field) {
                            if (field.allowBlank === false)
                                field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                        }
                    },
                    defaults: {
                        labelWidth: 220,
                        labelAlign: 'right'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Titolo Applicazione',
                            anchor: '70%',
                            allowBlank: false,
                            name: 'general.title'
                        },
                        {
                            xtype: 'datefield',
                            fieldLabel: 'Data inizio concertazione',
                            allowBlank: false,
                            vtype: 'daterange',
                            itemId: 'startdt',
                            endDateField: 'enddt',
                            name: 'general.startDate'
                        },
                        {
                            xtype: 'datefield',
                            fieldLabel: 'Data fine concertazione',
                            allowBlank: false,
                            vtype: 'daterange',
                            itemId: 'enddt',
                            startDateField: 'startdt',
                            name: 'general.endDate'
                        },
                        {
                            xtype: 'numberfield',
                            fieldLabel: 'Numero massimo allegati',
                            allowBlank: false,
                            name: 'general.uploadLimit',
                            minValue: 0,
                            maxValue: 10
                        },
						{
							xtype: 'textfield',
							fieldLabel: 'Percorso upload',
							name: 'general.uploadPath',
							anchor: '70%',
							readOnly: true,
						},
						{
							xtype: 'textfield',
							fieldLabel: 'Numero massimo utenti',
							allowBlank: false,
							name: 'general.maxUserXtown'
						},
						{
							xtype: new Ext.form.field.ComboBox({
								fieldLabel: 'dataProj',
								typeAhead: true,
								triggerAction: 'all',
								forceSelection: true,
								msgTarget: 'under',
								queryMode: 'local',
								store: projections,
								displayField: 'proj',
								valueField: 'proj',
								padding: '0 120',
								name: 'map.dataProj'
							}),
							name: 'map.dataProj',				
							allowBlank: false,
							
							anchor: '70%',
						},
						{
							xtype: 'textfield',
							name: 'map.displayProj',
							fieldLabel: 'displayProj',
							//allowBlank: false,
							readyOnly: true,
							anchor: '70%',
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Disegna oltre i confini comunali',
							defaultType: 'checkboxfield',
							items: [
								{
									boxLabel: 'Attivo',
									name: 'general.drawOverLimits',
									inputValue: true,
									uncheckedValue: false
								}
							],
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Abilita tasto info',
							defaultType: 'checkboxfield',
							items: [
								{
									boxLabel: 'Attivo',
									name: 'general.enableInfo',
									inputValue: true,
									uncheckedValue: false
								}
							],
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Abilita tasto stampa DBT',
							defaultType: 'checkboxfield',
							items: [
								{
									boxLabel: 'Attivo',
									name: 'general.enablePrint',
									inputValue: true,
									uncheckedValue: false
								}
							],
						},
						{
							xtype: 'textfield',
							name: 'map.draw.buffer',
							fieldLabel: 'drawBuffer(Metri)',
							allowBlank: false,
							anchor: '70%',
						},
						{
							xtype: 'fieldcontainer',
							fieldLabel: 'Tipo di geometrie',
							allowBlank: false,
							defaultType: 'checkboxfield',
							defaults: {
								hideLabel: true,
								allowBlank: false,
							},
							items: 
							[{
								boxLabel: 'Punto',
								name: 'geometries.allow_point',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							{
								boxLabel: 'Linea',
								name: 'geometries.allow_line',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							{
								boxLabel: 'Poligono',
								name: 'geometries.allow_poligon',
								inputValue: 'true',
								uncheckedValue: 'false'
							},
							],
						}


                    ]
                },
				{
					xtype: 'fieldset',
					title: 'Extent Geografico (Riferimento EPSG:4326)',
					collapsed: false,
					listeners: {
                        //add a * when allowBlank false
                        beforeadd: function(fs, field) {
                            if (field.allowBlank === false)
                                field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                        }
                    },
                    defaults: {
                        labelWidth: 220,
                        labelAlign: 'right'
                    },
					items: [
					{
							xtype: 'textfield',
							fieldLabel: 'x min',
							allowBlank: false,
							name: 'general.x_min'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'y min',
							allowBlank: false,
							name: 'general.y_min'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'x max',
							allowBlank: false,
							name: 'general.x_max'
						},
						{
							xtype: 'textfield',
							fieldLabel: 'y max',
							allowBlank: false,
							name: 'general.y_max'
						},
					]
					
				},
                {
                    xtype: 'fieldset',
                    title: 'Notifiche',
                    collapsed: false,
                    listeners: {
                        //add a * when allowBlank false
                        beforeadd: function(fs, field) {
                            if (field.allowBlank === false)
                                field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                        }
                    },
                    defaults: {
                        labelWidth: 220,
                        labelAlign: 'right'
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.host',
                            fieldLabel: 'Host SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.port',
                            fieldLabel: 'Porta SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.user',
                            fieldLabel: 'Username SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.pswd',
                            fieldLabel: 'Password SMTP',
							allowBlank: false,
                            anchor: '70%'
                        },
                        {
                            xtype: 'fieldcontainer',
                            fieldLabel: 'Email mittente',
                            allowBlank: false,
                            anchor: '100%',
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Email indicata nella pagina principale quando il sistema &egrave; in manutenzione'
                            }],
                            layout: {
                                type: 'hbox',
                                align: 'stretch'
                            },
                            items: [{
                                xtype: 'textfield',
                                name: 'mail.notification.from.address',
                                emptyText: 'Indirizzo mail',
                                flex: 1,
                                allowBlank: false
                            },{
                                xtype: 'textfield',
                                name: 'mail.notification.from.name',
                                emptyText: 'Nome visualizzato',
                                flex: 1,
                                margin: '0 0 0 5',
                                allowBlank: false
                            }]
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.subject.newSubmission',
                            fieldLabel: 'Oggetto nuova osservazione',
                            anchor: '100%',
                            allowBlank: false,
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Oggetto delle mail di notifica inviate al salvataggio di una nuova osservazione'
                            }]
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.subject.newOpinion',
                            fieldLabel: 'Oggetto nuovo parere',
                            anchor: '100%',
                            allowBlank: false,
                            plugins: [{
                                ptype: 'fieldhelptext',
                                text: 'Oggetto delle mail di notifica inviate al salvataggio di una nuovo parere di un\'osservazione'
                            }]
                        }
                    ]
                },
				{
					xtype: 'fieldset',
                    title: 'Minimap',
                    collapsed: false,
                    listeners: {
                        //add a * when allowBlank false
                        beforeadd: function(fs, field) {
                            if (field.allowBlank === false)
                                field.labelSeparator += '<span style="color: rgb(255, 0, 0); padding-left: 2px;">*</span>';
                        }
                    },
                    defaults: {
                        labelWidth: 220,
                        labelAlign: 'right'
                    },
					items: [					
					{
						xtype: 'textfield',
						name: 'map.layers.minimap.url',
						flex: 1,
						fieldLabel: 'Endpoint',
						anchor: '70%',
						
					},
					{
						xtype: 'textfield',
						name: 'map.layers.minimap.options.attribution',
						fieldLabel: 'Attribution',
						anchor: '70%',
					},
					{
						xtype: 'numberfield',
						name: 'map.layers.minimap.options.maxZoom',
						fieldLabel: 'Zoom massimo(5-16)',
						anchor: '70%',
					}],
				},
				{
					xtype: 'admin.baselayers.panel',
					project_id: this.project_id,
				},
				{
					xtype: 'admin.overlaylayers.panel',
					project_id: this.project_id
				},
				{
					xtype: 'admin.submissiontypes.panel',
					project_id: this.project_id
				}
            ],
            tools: [
                {
					type: 'save',
					tooltip: 'Salva',
					itemId: 'updateProjectSettings',
					titleCollapse: true,
                }
            ],
        });

        // single fire activate event
        me.on({
            render: {fn: me.onActivate, scope: me, single: true, delay: 150}
        });

        me.callParent(arguments);
    },

    /**
     * load data from ini_settings
     */
    onActivate: function(){
        var me = this, form = me.getForm(), values = form.getValues(), fields = [];
		var project_id = this.project_id;
		Ext.Object.each(values, function(key, value) {
            fields.push(key);
        });
		
		//Aggiungo il project_id.id
		fields.push('project_id.'+project_id);

        //mask the form
        me.el.mask('Caricamento delle impostazioni...');		
        // make server call
        SIO.Services.getProjectSettings({fields:fields}, function(response) {
            // unamsk the form
            me.el.unmask();
            if (response.status) {
                // load values into the form
                form.setValues(response.settings);
                // save to config var (used by the reset button)
                me.setDefaultValues(response.settings);
            } else {
                Ext.Msg.alert('Errore', 'Impossibile caricare le impostazioni del progetto.');
            }
        });
    },


});
