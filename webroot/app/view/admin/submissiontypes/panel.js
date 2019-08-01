//Pannello dei progetti
Ext.define('SIO.view.admin.submissiontypes.panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.submissiontypes.panel',
    requires:[
        'SIO.ux.grid.plugin.HeaderFilters',
        'SIO.ux.form.field.ClearableTextfield',
        'Ext.form.field.Checkbox'
    ],

    title: 'Tipi di osservazione',

    emptyText: 'Nessun tipo trovato',
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
                        if (cls[i].dataIndex == 'description') {
                            if (context.record.get('description') != "") {
                                cls[i].getEditor().setValue(parseInt(context.record.get('id')));
                                cls[i].getEditor().setRawValue(context.record.get('description'));
								cls[i].getEditor().setRawValue(context.record.get('geom_type'));
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
                    //salvo al server
                    e.grid.el.mask('Salvataggio in corso...');
                    e.record.save({

                        success: function(record,operation) {
                            //committo
                            e.grid.el.unmask();

                            var res = Ext.JSON.decode(operation.response.responseText);
					
                            //assegno il nome
                            e.record.set('description',res.result.data.description);
							//assegno la descrizione
							e.record.set('geom_type',res.result.data.geom_type);	
							e.record.set('active',res.result.data.active);
                            //se uno nuovo
                            if (e.record.get('id')) {
                                Ext.Msg.alert('Attenzione', 'Progetto modificato correttamente');
                            }else{ //nuovo record
                                //assegno l'id del proveniente dalla risposta
                                e.record.set('id',res.result.data.id);
                                Ext.Msg.alert('Attenzione', 'Progetto salvato correttamente.');
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
                    if (context.record.get('id')) {

                    }
                    else { //se nuovo
                        context.record.store.remove(context.record);
                    }
                }
            }
        });

        //creo uno store che mi caricherà i progetti
        var _projectsStore = Ext.getStore('Projects'); //chiamo il js dello store
		//Creo fisicamente lo store
        var projectsStore = Ext.create('Ext.data.Store', {
            model: _projectsStore.model
        });
		var drawmodes = Ext.create('Ext.data.Store', {
			fields: ['geom_type'],
			data: [{'geom_type' : 'point'},{'geom_type': 'line'}, {'geom_type' : 'polygon'}]
		});

        //clono i dati
        _projectsStore.each(function(rec) {
            // If you want to do any filtering, do it here.
            // eg: if(rec.get('type')!='blah') return;
            projectsStore.add(rec.copy())[0].commit(true);
        });
        Ext.apply(me, {
            tools: [
				{
					tooltip: 'Nuovo tipo',
					type: 'plus',
					itemId: 'newSubType'
				},
			],
            items:[{
                store: 'Submissiontypes',
                sortableColumns: true,
                xtype: 'grid',
				height: 240,
                stripeRows: true,
                viewConfig:{
                    forceFit: true
                },
                listeners: {
                    render: me.loadData,
                },
                plugins: [
                    Ext.create('SIO.ux.grid.plugin.HeaderFilters'),
                    me.rowEditing //qui si attiva la griglia in modifica e i suoi metodi startEdit (implicito), cancelEdit (esplicito)
                ],
                columns: [

                    {
                        draggable: false,
                        menuDisabled: true,
                        text: "Descrizione",
                        flex: 1,
                        dataIndex: 'description',
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
						allowBlank: false,
                        text: "Tipo di geometria",
                        width: 170,
                        dataIndex: 'geom_type',
						align: 'center',
                        editor: new Ext.form.field.ComboBox({
							typeAhead: true,
                            triggerAction: 'all',
                            forceSelection: true,
                            msgTarget: 'under',
                            queryMode: 'local',
							store: drawmodes,
							displayField: 'geom_type',
							valueField: 'geom_type',
							name: 'geom_type'
                        }),
						renderer: function(value){
							switch(value){
								case 'point':
								return '<img src="https://cdn2.iconfinder.com/data/icons/finance-solid-icons-vol-3/48/106-512.png" style="width:18px;height:18px">';
								break;
								case 'polygon':
								return '<img src="https://static.thenounproject.com/png/189082-200.png" style="width:18px;height:18px">';
								break;
								case 'line':
								return '<img src="https://image.flaticon.com/icons/png/512/597/597666.png" style="width:18px;height:18px">';
								break;
							}
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
							uncheckedValue: false,
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
								//Eliminazione progetto
								icon: 'resources/images/black-cross.png',
								tooltip: 'Cancella tipo',
								iconCls: 'deleteSubType'								
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
		me.getStore().getProxy().extraParams = {
			project_id: this.ownerCt.ownerCt.project_id,
		};
        me.getStore().load();

    }
	


});
