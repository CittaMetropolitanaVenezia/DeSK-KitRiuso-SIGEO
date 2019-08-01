//Pannello dei progetti
Ext.define('SIO.view.admin.baselayers.panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.baselayers.panel',
	//height: 280,
    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],
    title: 'Base Layers',

    emptyText: 'Nessun baselayer trovato',
    //layout: 'fit',
    config: {
        rowEditing:  null
    },

    initComponent: function() {
        var me = this;
        me.rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
            clicksToMoveEditor: 1,
            autoCancel: false,
            errorSummary: true,
            saveBtnText  : 'Salva',
            cancelBtnText: 'Annulla',
            listeners: {

                beforeedit: function(editor, context, eOpts) {

                    //controllo che se siamo in edit di un record esistente
                    var edit = false;

                    if (context.record.get('id')) {
                        edit = true;
                    }
                    //assegno alla combo il rispettivo valore
                    var cls = context.grid.columns;
                    for (var i=0; i< cls.length; i++) {
						//Se c'è il nome lo carico
                          if (cls[i].dataIndex == 'type') {
                            if (context.record.get('type') != "") {
                                cls[i].getEditor().setRawValue(context.record.get('type'));
                                cls[i].getEditor().setRawValue(context.record.get('title'));
								cls[i].getEditor().setRawValue(context.record.get('url'));
								cls[i].getEditor().setRawValue(context.record.get('options_attribution'));
								cls[i].getEditor().setRawValue(context.record.get('options_maxZoom'));
                            }
                        }
                    }

                },
                validateedit: function(editor, e, eOpts){
                    var newModel = e.record.copy(); //copy the old model
                    newModel.set(e.newValues); //set the values from the editing plugin form

                    var errors = newModel.validate(); //validate the new data
                    if(!errors.isValid()){
                        editor.editor.form.markInvalid(errors); //the double "editor" is correct
                        return false; //prevent the editing plugin from closing
                    }
                },

                edit: function(editor, e) {
					
					//passo il project_id
					
					e.record.project_id = this.grid.project_id;
                    //salvo o aggiorno
                    e.grid.el.mask('Salvataggio in corso...');
                    e.record.save({

                        success: function(record,operation) {
                            //committo
                             e.grid.el.unmask();
	                        var res = Ext.JSON.decode(operation.response.responseText);
							var decodedData = Ext.JSON.decode(res.result.data.Baselayer.layers_configurations);
							//Assegno al record dello store i nuovi valori salvati
														
                            //se uno nuovo
                            if (e.record.get('id')!=null) {
								e.record.set('type',decodedData.Baselayers[e.record.get('id')].type);
								e.record.set('title',decodedData.Baselayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Baselayers[e.record.get('id')].url);								
								e.record.set('options_attribution',decodedData.Baselayers[e.record.get('id')].options_attribution);
								e.record.set('options_maxZoom',decodedData.Baselayers[e.record.get('id')].options_maxZoom);
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
                            }
                            else { //nuovo record
                                //assegno l'id del db
                                e.record.set('id',decodedData.Baselayers[decodedData.Baselayers.length-1].id);
								e.record.set('type',decodedData.Baselayers[e.record.get('id')].type);
								e.record.set('title',decodedData.Baselayers[e.record.get('id')].title);		
								e.record.set('url',decodedData.Baselayers[e.record.get('id')].url);
								e.record.set('options_attribution',decodedData.Baselayers[e.record.get('id')].options_attribution);
								e.record.set('options_maxZoom',decodedData.Baselayers[e.record.get('id')].options_maxZoom);
								Ext.Msg.alert('Successo','Layer inserito correttamente!');
                            }
                            //committo sulla griglia
                            e.record.commit();
                        },
                        failure: function(record,operation) {
                            e.grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }else{
                                var msg = 'Errore del server';
                            }

                            Ext.Msg.alert('Attenzione', msg);
                            //rimuovo se nuovo
                            if (!e.record.get('id')) {
                                e.record.store.remove(e.record);
                            }else{ //do un committ
                                e.record.commit();
                            }


                        }
                    });
                },

                canceledit: function(editor, context) {
                    if (context.record.get('id')!= null) {

                    }
                    else { //se nuovo
                        context.record.store.remove(context.record);
                    }
                }
            }
        });
		
		var layertypes = Ext.create('Ext.data.Store', {
			fields: ['type'],
			data: [{'type' : 'wms'},{'type': 'tms'}, {'type' : 'osm'}]
		});
        var _baselayersStore = Ext.getStore('Baselayers'); //chiamo il js dello store
		//Creo fisicamente lo store
        var baselayersStore = Ext.create('Ext.data.Store', {
            model: _baselayersStore.model
        });

        //clono i dati
        _baselayersStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            baselayersStore.add(rec.copy())[0].commit(true);
        });

        Ext.apply(me, {
            tools: [
				{
					tooltip: 'Aggiungi layer',
					type: 'plus',
					itemId: 'newLayer'
				},
			],
            items:[{
                store: 'Baselayers',
                sortableColumns: true,
                xtype: 'grid',
				height: 240,
                stripeRows: true,
                viewConfig:{
                    forceFit: true
                },
                listeners: {
                    render: me.loadData
                },
                plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters'),
                    me.rowEditing //qui si attiva la griglia in modifica e i suoi metodi startEdit (implicito), cancelEdit (esplicito)
                ],
                columns: [
                    {
                        draggable: false,
                        menuDisabled: true,
						allowBlank: false,
                        text: "Tipo",
                        flex: 1,
                        dataIndex: 'type',
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: layertypes,
							displayField: 'type',
							valueField: 'type',
							name: 'type'
                        }),
                    },                   
					{
                        draggable: false,
                        menuDisabled: true,
                        text: "Titolo",
						flex: 1,
                        dataIndex: 'title',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Endpoint",
						flex: 1,
                        dataIndex: 'url',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Attribution",
                        dataIndex: 'options_attribution',
                        filter: {
                            xtype: "clearabletextfield",
                            padding: '0 5 0 5'
                        },
                        editor: {
                            msgTarget: 'under'
                        }
                    },
               			{
                        draggable: false,
                        menuDisabled: true,
                        text: "Zoom(1-18)",
                        flex: 1,
                        dataIndex: 'options_maxZoom',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 40,
                        items: [
							{
								//Eliminazione del layer
								icon: 'resources/images/black-cross.png',
								tooltip: 'Cancella progetto',
								iconCls: 'deleteLayer'								
							},
						]
                    }
                ],
            }]
        });

        me.callParent(arguments);
    },

    loadData: function() {
        var me = this;
		me.project_id = this.ownerCt.project_id;
		me.getStore().getProxy().extraParams = {
			project_id: this.ownerCt.project_id,
		};
        me.getStore().load();

    }
	


});
