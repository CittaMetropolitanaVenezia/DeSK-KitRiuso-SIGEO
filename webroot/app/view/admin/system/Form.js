Ext.define('SIO.view.admin.system.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.admin.system.form',

    requires:[
        'Ext.form.FieldSet',
        'SIO.ux.form.field.HelpText',
        'Ext.form.FieldContainer'
    ],

    title: 'Impostazioni',
    glyph: 61459,
    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },
    autoScroll: true,

    config: {
        defaultValues: null
    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            tools: [
                {
                    tooltip: 'Salva modifiche',
                    type: 'save',
                    itemId: 'saveIni'
                }
            ],
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
                            anchor: '70%',
                            allowBlank: false,
                            name: 'general.uploadPath'
                        }


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
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.port',
                            fieldLabel: 'Porta SMTP',
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.user',
                            fieldLabel: 'Username SMTP',
                            anchor: '70%'
                        },
                        {
                            xtype: 'textfield',
                            name: 'mail.smtp.pswd',
                            fieldLabel: 'Password SMTP',
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
                        },
                        {xtype:'hiddenfield', name: 'general.maxUserXtown'},
                        {xtype:'hiddenfield', name: 'map.dataProj'},
                        {xtype:'hiddenfield', name: 'map.displayProj'},
                        {xtype:'hiddenfield', name: 'map.draw.buffer'},

                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.type'},
                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.title'},
                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.url'},
                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.options.attribution'},
                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.options.maxZoom'},
                        {xtype:'hiddenfield', name: 'map.layers.base.ortofoto.options.tms'},

                        {xtype:'hiddenfield', name: 'map.layers.base.terrain.type'},
                        {xtype:'hiddenfield', name: 'map.layers.base.terrain.title'},
                        {xtype:'hiddenfield', name: 'map.layers.base.terrain.url'},
                        {xtype:'hiddenfield', name: 'map.layers.base.terrain.options.attribution'},
                        {xtype:'hiddenfield', name: 'map.layers.base.terrain.options.maxZoom'},

                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.type'},
                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.title'},
                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.url'},
                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.options.attribution'},
                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.options.maxZoom'},
                        {xtype:'hiddenfield', name: 'map.layers.base.hybrid.options.tileLayerStyle'},

                        {xtype:'hiddenfield', name: 'map.layers.minimap.url'},
                        {xtype:'hiddenfield', name: 'map.layers.minimap.options.attribution'},
                        {xtype:'hiddenfield', name: 'map.layers.minimap.options.maxZoom'},

                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.title'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.url'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.options.layers'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.options.format'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.options.transparent'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.limits.options.attribution'},

                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.title'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.url'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.options.layers'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.options.format'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.options.transparent'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.options.attribution'},
                        {xtype:'hiddenfield', name: 'map.layers.overlay.criticita.options.minZoom'}

                    ]
                }
            ]
        });

        // single fire activate event
        me.on({
            render: {fn: me.onActivate, scope: me, single: true, delay: 150}
        });

        me.callParent(arguments);
    },

    /**
     * load data from ini files
     */
    onActivate: function() {
        var me = this,
            form = me.getForm(),
            values = form.getValues(),
            fields = [];
        Ext.Object.each(values, function(key, value) {
            fields.push(key);
        });
        // mask the form
        me.el.mask('Carico impostazioni...');
        // make server call
        SIO.Services.getSystemSettings({fields:fields}, function(response) {
            // unamsk the form
            me.el.unmask();
            if (response.status) {
                // load values into the form
                form.setValues(response.settings);

                // save to config var (used by the reset button)
                me.setDefaultValues(response.settings);
            } else {
                Ext.Msg.alert('Errore', 'Impossibile caricare le impostazioni');
            }
        });
    }

});
