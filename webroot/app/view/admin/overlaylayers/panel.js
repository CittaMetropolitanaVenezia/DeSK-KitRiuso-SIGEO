//Pannello degli overlaylayers
Ext.define('SIO.view.admin.overlaylayers.panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.overlaylayers.panel',
	//height: 280,
    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],
    title: 'Overlay Layers - WMS',

    emptyText: 'Nessun overlaylayer trovato',
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
                        if (cls[i].dataIndex == 'title') {
                            if (context.record.get('title') != "") {
								cls[i].getEditor().setRawValue(context.record.get('username'));
								cls[i].getEditor().setRawValue(context.record.get('password'));
								cls[i].getEditor().setRawValue(context.record.get('code'));
                                cls[i].getEditor().setRawValue(context.record.get('title'));
                                cls[i].getEditor().setRawValue(context.record.get('url'));
								cls[i].getEditor().setRawValue(context.record.get('options_layers'));
								cls[i].getEditor().setRawValue(context.record.get('options_format'));
								cls[i].getEditor().setRawValue(context.record.get('options_transparent'));
								cls[i].getEditor().setRawValue(context.record.get('options_attribution'));
								cls[i].getEditor().setRawValue(context.record.get('active'));
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
							var decodedData = Ext.JSON.decode(res.result.data.Overlaylayer.layers_configurations);
							
							//Assegno al record dello store i nuovi valori salvati
														
                            //se uno nuovo
                           if (e.record.get('id')!=null) {
                                Ext.Msg.alert('Successo', 'Dati modificati correttamente!');
								e.record.set('photo',decodedData.Overlaylayers[e.record.get('id')].photo);
								e.record.set('username',decodedData.Overlaylayers[e.record.get('id')].username);
								e.record.set('password',decodedData.Overlaylayers[e.record.get('id')].password);
								e.record.set('code',decodedData.Overlaylayers[e.record.get('id')].code);
								e.record.set('title',decodedData.Overlaylayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Overlaylayers[e.record.get('id')].url);
								e.record.set('options_layers',decodedData.Overlaylayers[e.record.get('id')].options_layers);
								e.record.set('options_format',decodedData.Overlaylayers[e.record.get('id')].options_format);
								e.record.set('options_transparent',decodedData.Overlaylayers[e.record.get('id')].options_transparent);
								e.record.set('options_attribution',decodedData.Overlaylayers[e.record.get('id')].options_attribution);
								e.record.set('active',decodedData.Overlaylayers[e.record.get('id')].active);
                            }
                            else { //nuovo record
                                //assegno l'id del db								
                                e.record.set('id',decodedData.Overlaylayers[decodedData.Overlaylayers.length-1].id);
								e.record.set('photo',decodedData.Overlaylayers[e.record.get('id')].photo);
								e.record.set('username',decodedData.Overlaylayers[e.record.get('id')].username);
								e.record.set('password',decodedData.Overlaylayers[e.record.get('id')].password);
								e.record.set('code',decodedData.Overlaylayers[e.record.get('id')].code);
								e.record.set('title',decodedData.Overlaylayers[e.record.get('id')].title);
								e.record.set('url',decodedData.Overlaylayers[e.record.get('id')].url);
								e.record.set('options_layers',decodedData.Overlaylayers[e.record.get('id')].options_layers);
								e.record.set('options_format',decodedData.Overlaylayers[e.record.get('id')].options_format);
								e.record.set('options_transparent',decodedData.Overlaylayers[e.record.get('id')].options_transparent);
								e.record.set('options_attribution',decodedData.Overlaylayers[e.record.get('id')].options_attribution);
								e.record.set('active',decodedData.Overlaylayers[e.record.get('id')].active);
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
		
		var layersformat = Ext.create('Ext.data.Store', {
			fields: ['format'],
						data: [{'format' : 'image/png'}, 
							   {'format': 'image/jpg'}]
		});
        var _overlaylayerStore = Ext.getStore('Overlaylayers'); //chiamo il js dello store
		//Creo fisicamente lo store
        var overlaylayerStore = Ext.create('Ext.data.Store', {
            model: _overlaylayerStore.model
        });

        //clono i dati
        _overlaylayerStore.each(function(rec) {
            overlaylayerStore.add(rec.copy())[0].commit(true);
        });

        Ext.apply(me, {
            tools: [
				{
					tooltip: 'Aggiungi layer',
					type: 'plus',
					itemId: 'newOverlayLayer'
				},
			],
            items:[{
                store: 'Overlaylayers',
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
						menuDisabled: false,
						header: 'Immagine',
						flex: 1,
						dataIndex: 'photo',
						editor: {
							msgTarget: 'under',
						},
						renderer: function(value){
							return '<img src="' + value + '"style="width:20px;height:20px" alt="No image">';
						},
					},
					{
						draggable: false,
						menuDisabled: false,
						header: 'Username',
						hidden: true,
						flex: 1,
						dataIndex: 'username',
						editor: {
							msgTarget: 'under'
						}
					},
					{
						draggable: false,
						menuDisabled: false,
						hidden: true,
						header: 'Password',
						flex: 1,
						readonly: true,
						inputType: 'password',
						dataIndex: 'password',
						editor: {
							msgTarget: 'under',
							inputType: 'password',
						},
						renderer: function(val) {
							var toReturn = "";
							for (var x = 0; x < val.length; x++) {
								toReturn += "&#x25cf;";
							}
							return toReturn;
						}
					},
					{
						draggable: false,
						menuDisabled: false,
						header: "Codice",
						flex: 1,
						dataIndex: 'code',
						editor: {
							msgTarget: 'under'
						}
					},
                    {
                        draggable: false,
                        menuDisabled: true,
                        header: "Titolo",
                        flex: 1,
                        dataIndex: 'title',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
                    {
                        draggable: false,
                        menuDisabled: true,
                        header: "Endpoint",
                        flex: 1,
                        dataIndex: 'url',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
                        draggable: false,
                        menuDisabled: true,
                        header: "Layers",
                        flex: 1,
                        dataIndex: 'options_layers',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
                        draggable: false,
                        menuDisabled: true,
                        header: "Formato",
                        flex: 1,
                        dataIndex: 'options_format',
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: layersformat,
							displayField: 'format',
							valueField: 'format',
							name: 'options_format'
                        }),
                    },
					{
                        draggable: false,
                        menuDisabled: true,
                        header: "Trasparenza(1/0)",
                        flex: 1,
                        dataIndex: 'options_transparent',
                        editor: {
                            msgTarget: 'under',
														
						}
                    },
					{
                        draggable: false,
                        menuDisabled: true,
                        header: "Attribution",
                        flex: 1,
                        dataIndex: 'options_attribution',
                        editor: {
                            msgTarget: 'under'
                        }
                    },
					{
				        header: 'Attivo',                       
                        width: 60,
                        draggable: false,
                        sortable: false,
                        menuDisabled: true,
                        dataIndex: 'active',
                        editor: {
                            xtype: 'checkbox',
                            cls: 'x-grid-checkheader-editor'
                        },
						renderer: function(value){
							if(value){
								return '<img src="https://cdn-images-1.medium.com/max/1200/1*nZ9VwHTLxAfNCuCjYAkajg.png"style="width:20px;height:20px">';
							}else{
								return '<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Location_dot_red.svg/1024px-Location_dot_red.svg.png" style="width:18px;height:18px">';
							}
						}
					},
                    {
                        xtype: "actioncolumn",
                        menuDisabled: true,
                        width: 40,
                        items: [
						{
                            icon: 'resources/images/black-cross.png',
                            tooltip: 'Cancella Layer',
                            itemId: 'admin-projects-deleteLayer'
                        },
						{
							icon: 'resources/images/picture.png',
                            tooltip: 'Carica icona',
                            iconCls: 'addIconOverlayLayer'
						}
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
