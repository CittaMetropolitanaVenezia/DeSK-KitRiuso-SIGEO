Ext.define('SIO.view.submissions.detail.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.detail.panel',
    requires: [
        'SIO.view.submissions.detail.Grid',
        'SIO.view.submissions.detail.AttachmentsDataView',
        'SIO.view.submissions.detail.Form'
    ],

    config: {
        record: null
    },

    layout: 'border',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'form',
                    region: 'north',
                    padding: 5,
                    style: 'background-color: white;',
                    defaults: {
                        layout: 'hbox',
                        anchor: '100%'
                    },
                    items: [{
                        xtype: 'container',
                        defaultType: 'displayfield',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 10 0'
                        },
                        items: [,{
                            fieldLabel: 'Proponente',
                            flex: 1,
                            name: 'from_town_name'
                        }]
                    },{
                        xtype: 'container',
                        defaults: {
                            labelAlign: 'left',
                            xtype: 'textfield',
                            readOnly: true,
                            margin: '0 10 5 0'
                        },
                        items: [{
                            fieldLabel: 'Data',
                            flex: 2,
                            xtype: 'datefield',
                            name: 'created'
                        }]
                    },{
                        xtype: 'submissiontypes.detail.grid'
                    }]
                },{
                    xtype: 'submissions.detail.form',
					itemId: 'descriptionText',
                    region: 'center'
                },{
                    xtype: 'submissions.detail.attachmentsdataview',
                    itemId: 'attachmentsPanel',
                    region: 'south',
                    collapsed: true,
                    collapsible: true,
                    height: 150
                }
            ],
            tools: [
                {
                    xtype: 'button',
                    text: 'Chiudi',
                    glyph: 61714,
                    handler: function(btn) {
                        Ext.globalEvents.fireEvent('closesubmission', me, btn);
                    },
                    style: {
                        marginRight: '10px'
                    },
                    scope: me,
                    width: 90
                },
                {
                    xtype: 'button',
                    text: 'Cancella',
                    cls: 'btn-red',
                    glyph: 61714,
                    handler: function(btn) {
                        Ext.globalEvents.fireEvent('deletesubmission', me.getRecord(), btn);
                    },
                    scope: me,
                    width: 90
                }
            ],
            title: 'Osservazione',
            header: {
                padding: '6px 5px 6px 10px'
            },
            listeners: {
                activate: me.onActivate
            }
        });

        me.callParent(arguments);
    },

    onActivate: function() {
        var me = this,
            date = me.getRecord().get('created'),
            attachmentsPanel = me.down('#attachmentsPanel');


        // change title
        me.setTitle('Osservazione ID:' + me.getRecord().get('id') + ' del ' + Ext.Date.format(new Date(date), 'd-m-Y'));
        // collapse attachments panel
        attachmentsPanel.collapse('bottom', false);
        if (me.getRecord().get('is_owner') && SIO.Settings.isTown()) {
            attachmentsPanel.showTools();
        } else {
            attachmentsPanel.hideTools();
        }

        //carico la griglia dei type di osservazioni inserite
        me.loadSubmissiontypesGrid();
    },

    loadSubmissiontypesGrid: function() {
        var me = this,
            record = me.getRecord(),
            store = Ext.getStore('Submissiontypes'),
            subTypesGrid = me.down('[xtype=submissiontypes.detail.grid]');
        //visualizzo solo i record che mi interessano
        store.on('load',function(s,records){
            var me = this,
                st = record.get('submission_types');
            //recuepro le descrizioni e le tipologie inserite
            if (st!="") {
                var subTypes = st.split("§");
            }
            //tolgo dallo store quelle che mi servono
            if (subTypes && subTypes.length > 0) {
                var recordsToShow = new Array();

                for (var i=0; i<subTypes.length;i++) {
                    var arrToken = subTypes[i].split("|");

                    for (var j=0; j<records.length; j++) {
                        if (arrToken[0] == records[j].get('id')) {
                            //recordsToShow.push(records[j].data);
                            recordsToShow.push(records[j]);
                        }
                    }

                }
            }

            //carico solo i record da tenere
            if (recordsToShow && recordsToShow.length>0) {
                subTypesGrid.getStore().removeAll();
                store.suspendEvent('load');
                subTypesGrid.getStore().loadData(recordsToShow);
                store.commitChanges();
                store.resumeEvent('load');
                subTypesGrid.getSelectionModel().select(0);//seleziono la prima
                subTypesGrid.fireEvent('itemclick',subTypesGrid,recordsToShow[0]);
            }

        },me);
		store.getProxy().extraParams = {
			project_id: false
		};
        store.load();



    }
});