Ext.define('SIO.controller.Admin', {
    extend: 'Ext.app.Controller',

	//Servono per fare i get e i set dei vari elementi
    refs: [
        {
            ref: 'Viewport',
            selector: '[xtype=viewport]'
        },
        {
            ref: 'userGridPanel',
            selector: '[xtype=admin.users.grid]'
        },
        {
            ref: 'systemForm',
            selector: '[xtype=admin.system.form]'
        },
        {
            ref: 'userGrid',
            selector: '[xtype=admin.users.grid] grid'
        },
        {
            ref: 'systemPanel',
            selector: '[xtype=admin.panel]'
        },
		{
			ref: 'townGridPanel',
			selector: '[xtype=admin.towns.grid]'
		},
		{
			ref: 'townGrid',
			selector: '[xtype=admin.towns.grid] grid'
		},
		
		//Progetti
		{
			ref: 'projectGridPanel',
			selector: '[xtype=admin.projects.panel]'
		},
		{
			ref: 'projectGrid',
			selector: '[xtype=admin.projects.panel] grid'
		},
		{
			ref: 'projectGridPanelActionColumn',
			selector: '[xtype=admin.projects.panel] grid actioncolumn'
		},
        {
            ref: 'projectSettingsPanel',
            selector: '[xtype=admin.projects.settings]'
        },
		{
			ref: 'projectBaselayersPanel',
			selector: '[xtype=admin.baselayers.panel]'
		},
		{
			ref: 'projectBaselayersGrid',
			selector: '[xtype=admin.baselayers.panel] grid'
		},
		{
			ref: 'projectOverlaylayersPanel',
			selector: '[xtype=admin.overlaylayers.panel]'
		},
		{
			ref: 'projectOverlaylayersGrid',
			selector: '[xtype=admin.overlaylayers.panel] grid'
		},
		{
			ref: 'projectSubTypesPanel',
			selector: '[xtype=admin.submissiontypes.panel]'
		},
		{
			ref: 'projectSubTypesGrid',
			selector: '[xtype=admin.submissiontypes.panel] grid'
		}
    ],

    init: function() {
        this.listen({
            component: {
                '[xtype=admin.users.grid] #newUser': {
                    click: this.addNewUser
                },
				'[xtype=admin.towns.grid] #newEntity': {
					click: this.addNewEntity
				},
				'[xtype=admin.submissiontypes.panel] #newSubType ': {
					click: this.addNewSubType
				},
                '[xtype=admin.users.grid] #exportUser': {
                    click: this.exportUsers
                },
                '[xtype=admin.users.grid] grid actioncolumn': {
                    click: this.switchUser
                },
				'[xtype=admin.towns.grid] grid actioncolumn': {
					click: this.switchTowns
				},
				'[xtype=admin.baselayers.panel] grid actioncolumn ':{
					click: this.switchBaselayer
				},
				'[xtype=admin.towns.townprojectgrid] grid actioncolumn':{
					click: this.switchTownProject
				},
				'[xtype=admin.towns.townprojectgrid]':{
					render: this.loadDataTownProjects
				},
				'[xtype=admin.system.generalsettings] #saveGeneralIni': {
					click: this.saveGeneralIni
				},
				'[xtype=admin.overlaylayers.uploadwindow] restfileupload[itemId=uploadAttachmentField]': {
                    filechecked: this.doUpload
                },
				'[xtype=admin.users.associationgrid]': {
					render: this.loadDataUserProjects
				},
				'[xtype=admin.projects.projectscombo] #comboProject': {
					select: this.onSelectProjectsCombo
				},
				'[xtype=admin.towns.townprojectcombo] #comboProject': {
					select: this.onSelectTownProjectCombo
				},
				'[xtype=admin.users.associationgrid] actioncolumn': {
					click: this.switchAssociation
				},
				'[xtype=admin.overlaylayers.panel] grid actioncolumn ': {
					click: this.switchOverlaylayer
				},
				'[xtype=admin.submissiontypes.panel] grid actioncolumn': {
					click: this.switchSubTypes
				},
                '[xtype=admin.system.form] #saveIni': {
                    click: this.saveIni
                },
                '[xtype=admin.panel] #systemUser': {
                    click: this.activeUserGrid
                },
                '[xtype=admin.panel] #systemTown': {
                    click: this.activeTownGrid
                },
                '[xtype=admin.panel] #systemIni': {
                    click: this.activeSystemIni
                },
				//Chiamo il pannello di amministrazione Admin.Panel per chiamare il suo pulsante con itemID: systemProject
				
				//------Progetti
				'[xtype=admin.panel] #systemProjects': {
                    click: this.activeProjectPanel
                },
                '[xtype=admin.projects.panel] #newProject': {
                    click: this.addNewProject
                },
                '[xtype=admin.projects.panel] grid actioncolumn': {
                    click: this.projectOperations
                },
				'[xtype=admin.projects.settings] #updateProjectSettings': {
					click: this.updateProjectSettings
				},
				'[xtype=admin.baselayers.panel] #newLayer': {
					click: this.addNewLayer
				},
				'[xtype=admin.overlaylayers.panel] #newOverlayLayer': {
					click: this.addNewOverlayLayer
				}
            },
            global: {
                adminopen: this.openAdminWindow
            }
        });
    },
	saveGeneralIni: function(window) {
		systemForm = window.up('form');
        //recupero i valori dal form
        var params = {};
        params.values = systemForm.getForm().getValues();
		if(systemForm.isValid()) {
		formValues = systemForm.getValues();
				systemForm.el.mask('Salvo impostazioni...');
				// make server call
				SIO.Services.setSystemSettings(params, function(response) {
					// unamsk the form
					systemForm.el.unmask();
					if (response.status) {
						// load values into the form
						Ext.Msg.alert('Attenzione', 'Impostazione salvate correttamente');

					} else {
						Ext.Msg.alert('Errore', 'Impossibile salvare le impostazioni');
					}
				});
						
		
		}else{
			Ext.Msg.alert('Attenzione', 'Inserire tutti i campi obbligatori');
		}
	},
    activeUserGrid: function() {
        var me = this,
            adminPanel = me.getSystemPanel();
        adminPanel.getLayout().setActiveItem(0);
    },

    activeTownGrid: function() {
        var me = this,
            adminPanel = me.getSystemPanel();

        adminPanel.getLayout().setActiveItem(1);
    },

    activeSystemIni: function() {
        var me = this,
            adminPanel = me.getSystemPanel();

        adminPanel.getLayout().setActiveItem(2);
    },
	
	activeProjectPanel: function() {
        var me = this, adminPanel = me.getSystemPanel();
        adminPanel.getLayout().setActiveItem(3);
	},

    /**
     * scelgo che azione da fare sulla colonna degli utenti
     * @param view
     * @param cell
     * @param rowIndex
     * @param colIndex
     * @param e
     */
    switchUser: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteUser(view,rowIndex);
                break;
            case 'key':
                me.generatePassword(view,rowIndex);
                break;
			case 'bind':
				me.openUserProjectBinding(view,rowIndex);
        }
    },
	switchTownProject: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.unbindTownProject(view,rowIndex);
                break;
        }
    },
	unbindTownProject: function(view,rowIndex) {

		var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		comboStore = view.up('grid').up('panel').up('panel').down('combo').getStore();		
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo associazione?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();							
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
								store.load();
								comboStore.load();
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }				
	},
	openUserProjectBinding: function(view, rowIndex){
				 var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);			
		 Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Associa Progetti',
            width: 900,
            height: 600,
            modal: true,
            layout: 'fit',
            items: [{ 
					xtype: 'admin.users.associationPanel',
					user_id : record.data.id
				}]
        }).show();
	},
	switchTowns: function(view, cell, rowIndex, colIndex, e) {
		var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'bind':
                me.openTownBind(view,rowIndex);
                break;
			case 'black':
				me.deleteEntity(view,rowIndex);
				break;
        }
	},
	openTownBind: function(view, rowIndex) {
		 var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);	
		 Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Associa Progetti',
            width: 900,
            height: 600,
            modal: true,
            layout: 'fit',
            items: [{ 
					xtype: 'admin.towns.townassociationPanel',
					town_id : record.data.id
				}]
        }).show();
	},
	addNewEntity: function() {
        var me = this,
            gridPanel = me.getTownGridPanel(),			
            grid = me.getTownGrid(),
            rowEditing = gridPanel.getRowEditing();
			rowEditing.cancelEdit();
        // Create a model instance
        var r = Ext.create('SIO.model.Town', {
			entity: '',
            name: '',
			code: '',
            email: ''
        });
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	addNewSubType: function() {
		var me = this,
			gridPanel = me.getProjectSubTypesPanel(),
			grid = me.getProjectSubTypesGrid(),
			rowEditing = gridPanel.getRowEditing();
			rowEditing.cancelEdit();
		var r = Ext.create('SIO.model.Submissiontype',{
			description: '',
			geom_type: ''
		});
		grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	deleteEntity: function(view, rowIndex){
		    var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		
		if(record.get('entity') == 'Comune'){
			Ext.Msg.alert('Attenzione','Operazione disabilitata per i comuni');
			return;
		};

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo ente?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
	},
	switchSubTypes: function(view, cell, rowIndex, collIndex, e) {
		var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteSubType(view,rowIndex);
                break;
        }
	},
	switchOverlaylayer: function(view, cell, rowIndex, collIndex, e)  {
	    var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteOverlaylayer(view,rowIndex);
                break;
			case 'picture':
				me.addlayerimage(view,rowIndex);
				break;
        }
	},
	addlayerimage: function(view, rowIndex){
			var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);			
			Ext.widget('admin.overlaylayers.uploadwindow', {
            record: record,
			});
	},
	switchBaselayer: function(view, cell, rowIndex, colIndex, e) {
		        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.deleteBaselayer(view,rowIndex);
                break;
        }
	},
	loadDataUserProjects: function(panel) {
        var me = this;		
		var user_id = panel.up('panel').user_id;
		var grid = panel.down('grid');
		var store = grid.getStore();
		var combo = panel.up('panel').down('combo');
		var store2 = combo.getStore();
		store2.getProxy().extraParams = {
			user_id: user_id
		};
		store.getProxy().extraParams = {
			user_id: user_id
		};
        store.load();
		store2.load();
    },
	loadDataTownProjects: function(panel) {
        var me = this;		
		var town_id = panel.up('panel').town_id;
		var grid = panel.down('grid');
		var store = grid.getStore();
		var combo = panel.up('panel').down('combo');
		var store2 = combo.getStore();
		store2.getProxy().extraParams = {
			town_id: town_id
		};
		store.getProxy().extraParams = {
			town_id: town_id
		};
        store.load();
		store2.load();
    },
	onSelectProjectsCombo: function(combo, records) {
			//user-project bind save
			projectCombo = combo;
			unbindedprojectStore = projectCombo.getStore();
			selectedProject = records[0]['raw'];
			gridStore = combo.up('panel').up('panel').down('grid').getStore();
			unbindedprojectStore.remove(selectedProject);
			var project_id = selectedProject.id;
			var user_id = combo.up('panel').up('panel').user_id;
			var params = {};
			params.project_id = project_id;
			params.user_id = user_id;
			SIO.util.ServicesFactory.saveUserProjects(
                params,
                // callback
                function(response) {
                    if (response.result.success) {					
                        Ext.MessageBox.alert('Attenzione','Salvata correttamente!');    
                    }
                    else {
                        //ha dato errore
                        Ext.MessageBox.alert('Attenzione',response.result.error);
                    }
                },
                // fallback
                function() {
                  
                    Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                }
            );
			
			projectCombo.clearValue();
			unbindedprojectStore.load();
			gridStore.load();
			

		},
	onSelectTownProjectCombo: function(combo, records) {
			//town-project bind save
			projectCombo = combo;
			unbindedprojectStore = projectCombo.getStore();
			selectedProject = records[0]['raw'];
			gridStore = combo.up('panel').up('panel').down('grid').getStore();
			unbindedprojectStore.remove(selectedProject);
			var project_id = selectedProject.id;
			var town_id = combo.up('panel').up('panel').town_id;
			var params = {};
			params.project_id = project_id;
			params.town_id = town_id;
			SIO.util.ServicesFactory.saveTownProjects(
                params,
                // callback
                function(response) {
                    if (response.result.success) {					
                        Ext.MessageBox.alert('Attenzione','Associazione salvata correttamente!');    
                    }
                    else {
                        //ha dato errore
                        Ext.MessageBox.alert('Attenzione',response.result.error);
                    }
                },
                // fallback
                function() {
                  
                    Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                }
            );
			
			projectCombo.clearValue();
			unbindedprojectStore.load();
			gridStore.load();
			

			
		},
	switchAssociation: function(view, cell, rowIndex, colIndex, e) {

        var me = this;
        var m = e.getTarget().src.match(/.\/images\/(\w+)\b/);
        // action found?
        if (m === null || m === undefined) {
            return;
        }
        var action = m[1];

        switch (action) {
            case 'black':
                me.unbindProjectAssociation(view,rowIndex);
                break;
        }
    },
	unbindProjectAssociation: function(view,rowIndex) {
		var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }
		comboStore = view.up('grid').up('panel').up('panel').down('combo').getStore();		
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo associazione?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();							
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
								store.load();
								comboStore.load();
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
		
		
	},


    exportUsers: function() {
        var me = this;

        // open window
        window.open('users/export.csv');
        return;
    },

    generatePassword: function(view,rowIndex) {

        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        //se opt true invio la stessa password

        if (record.get('otp')) {
            var confirmMsg = "Inviare la password a questo utente?";
        }
        else {
            var confirmMsg = "Generare una nuova password per questo utente?"
        }

        Ext.Msg.confirm('Attenzione',confirmMsg,function(confirm){
            //se conferma postivia
            if (confirm == 'yes'){

                grid.el.mask('Cancellazione in corso...');

                //mando il parametro id
                var params = {
                    id: record.get('id')
                }

                SIO.util.ServicesFactory.generatePassword(
                    params,
                    // callback
                    function(response) {
                        if (response.result.success) {
                            // process server response here
                            // unmask the container
                            grid.el.unmask();

                            // send feedback to the user
                            Ext.MessageBox.alert('Attenzione','La nuova password è <b>'+response.result.data.computepassword+'</b>. &Egrave; stata inviata un mail.');

                        }
                        else {
                            //ha dato errore
                            Ext.MessageBox.alert('Attenzione',response.result.error);
                        }
                    },
                    // fallback
                    function() {
                        // unmask the container
                        opinionsForm.el.unmask();
                        // send feedback and redirect to home page
                        Ext.MessageBox.alert('Attenzione','Errore nel salvataggio riprovare!');
                    }
                );
            }
        });
    },

    deleteUser: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);

        if (record.get('username') == 'superadmin') {
            Ext.Msg.alert('Attenzione', 'Operazione non consentita');
            return;
        }

        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo utente?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
    },
	deleteBaselayer: function (view, rowIndex) {
		    var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo layer?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
	},
	deleteSubType: function (view, rowIndex) {
		    var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questa tipologia? Verrano cancellate anche le osservazioni indicate con questa tipologia!',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
	},
	deleteOverlaylayer: function (view, rowIndex) {
		    var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
        if (SIO.Settings.isAdmin()) {

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo layer?',function(confirm){
                //se conferma postivia
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();

                            //record.store.remove(record);

                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }
                            else {
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);

                        }
                    });
                }
            });
        }
        else {
            Ext.Msg.alert('Attenzione', 'Operazione consentita solo agli amministratori');
            return;
        }
	},

    openAdminWindow: function() {
        Ext.create('Ext.window.Window', {
            glyph: 61573,
            title: 'Configura',
            width: 800,
            height: 500,
            modal: true,
            layout: 'fit',
            items: [{ xtype: 'admin.panel' }]
        }).show();
    },

	//Qui passo per switchare tra un operazione e l'altra sull'actioncolumn dei progetti
	projectOperations: function(grid, domIcon, rowIndex, colIndex, e) {
		var me = this;
		var operations = ['deleteProject','projectSettings'];
		
		//Verifico qual è l'operazione da eseguire (attribuita come classe all'icona
		var action = e.getTarget().getAttribute('class').split(/[\s]+/gm).filter(function(value){
			return operations.indexOf(value)!==-1;
		})[0];
		
        switch (action) {
            case 'deleteProject':
                me.deleteProject(grid,rowIndex);
                break;
            case 'projectSettings':
				me.projectSettings(grid,rowIndex);
                break;
        }	
	},

    updateProjectSettings: function() {
        var me = this, projectSettingsPanel = me.getProjectSettingsPanel();
        //recupero i valori dal form
        var params = {};
        params.values = projectSettingsPanel.getForm().getValues();
		form = projectSettingsPanel.getForm();
		if(form.isValid()){
		var project_id = form.owner.project_id;
		params.values.project_id = project_id;
	
        projectSettingsPanel.el.mask('Salvo impostazioni...');
		// make server call
        SIO.Services.setProjectSettings(params, function(response) {
            // unamsk the form
            projectSettingsPanel.el.unmask();
            if (response.status) {
                // load values into the form
				form.setValues(response.settings);
                // save to config var (used by the reset button)
                projectSettingsPanel.setDefaultValues(response.settings);
                Ext.Msg.alert('Attenzione', 'Impostazioni del progetto salvate correttamente.');

            } else {
                Ext.Msg.alert('Errore', 'Impossibile salvare le impostazioni del progetto.');
            }
        });
		}else{
			Ext.Msg.alert('Attenzione','Impossibile salvare. Inserire tutti i campi obbligatori');
		}
    },
	
	projectSettings: function(grid, rowIndex){
		
		//ottengo il record con il progetto e restituisco l'id del progetto
		var rec = grid.getStore().getAt(rowIndex);
		var project_id = rec.data.id;
		Ext.create('Ext.window.Window', {
			glyph: 61573,
			title: 'Impostazioni progetto',
			width: 800,
			height: 600,
			modal: true,
			layout: 'fit',
			items: [
				{
					xtype: 'admin.projects.settings',
					project_id: project_id
				}
			]
		}).show();
	},
	
    deleteProject: function(view, rowIndex) {
        var me = this,
            grid = view.up('grid'),
            store = grid.getStore(),
            sm = grid.getSelectionModel(),
            record = store.getAt(rowIndex);
			

            Ext.Msg.confirm('Attenzione','Sei sicuro di cancellare questo progetto?',function(confirm){
                //se si cancello il progetto
                if (confirm == 'yes'){

                    //W.A. per selezionare il record in griglia ed evitare il bug
                    sm.select([record]);
                    store.remove(sm.getSelection());

                    grid.el.mask('Cancellazione in corso...');
                    record.destroy({

                        success: function(record,operation) {
                            //committo
                            grid.el.unmask();
							Ext.Msg.alert('Attenzione', 'Progetto cancellato correttamente.');
                        },
                        failure: function(record,operation) {
                            grid.el.unmask();
                            if (operation.request.scope.reader.jsonData.error && operation.request.scope.reader.jsonData.error != "") {
                                var msg = operation.request.scope.reader.jsonData.error;
                            }else{
                                var msg = 'Errore del server';
                            }
                            //ricarico lo store
                            store.load();
                            Ext.Msg.alert('Attenzione', msg);
                        }
                    });
                }
            });

    },

	
	addNewLayer: function(){
		//console.info('addNewLayer');
		//Pannello dei baselayers
		var me = this, gridPanel = me.getProjectBaselayersPanel();
		var grid = me.getProjectBaselayersGrid();
		rowEditing = gridPanel.getRowEditing();
		rowEditing.cancelEdit();
        // Create a model instance
        var r = Ext.create('SIO.model.Baselayer', {
            type: '',
            title: '',
            url: '',
            options_attribution: '',
            options_maxZoom: '1',
        });		
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	
	addNewOverlayLayer: function(){
		//console.info('addNewLayer');
		//Pannello degli overlaylayers
		var me = this, gridPanel = me.getProjectOverlaylayersPanel();
		var grid = me.getProjectOverlaylayersGrid();
		rowEditing = gridPanel.getRowEditing();
		rowEditing.cancelEdit();
        // Create a model instance
        var r = Ext.create('SIO.model.Overlaylayer', {
			photo: '',
			username: '',
			password: '',
			code: '',
            title: '',
            url: '',
            options_layers: '',
            options_format: '',
            options_trasparent: '',
			options_attribution: '',
			active: ''
        });	
        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
	},
	
    addNewUser: function() {
        var me = this,
            gridPanel = me.getUserGridPanel(),
            grid = me.getUserGrid(),
            rowEditing = gridPanel.getRowEditing();

        rowEditing.cancelEdit();

        // Create a model instance
        var r = Ext.create('SIO.model.User', {
            name: '',
            email: '',
            surname: '',
            town_name: '',
            active: true,
            username: ''
        });

        grid.getStore().insert(0, r);
        rowEditing.startEdit(0, 0);
    },

	
	addNewProject: function(){
		var me = this, 
		gridPanel = me.getProjectGridPanel(), //Per il ref sopra
		grid = me.getProjectGrid(),
		rowEditing = gridPanel.getRowEditing();
		
		//Stoppo l'inserimento
		rowEditing.cancelEdit();
		
        //Creo un nuovo modello di Project
        var r = Ext.create('SIO.model.Project', {
			name: '',
			description: ''
        });
		grid.getStore().insert(0, r); //Inserisco il mio nuovo record
		rowEditing.startEdit(0, 0); //Inizio a modificare
	},
	
    saveIni: function() {
        var me = this,
            systemForm = me.getSystemForm();
        //recupero i valori dal form
        var params = {};
        params.values = systemForm.getForm().getValues();
        systemForm.el.mask('Salvo impostazioni...');
        // make server call
        SIO.Services.setSystemSettings(params, function(response) {
            // unamsk the form
            systemForm.el.unmask();
            if (response.status) {
                // load values into the form
                Ext.Msg.alert('Attenzione', 'Impostazione salvate correttamente');

            } else {
                Ext.Msg.alert('Errore', 'Impossibile salvare le impostazioni');
            }
        });
    },
	doUpload: function(btn) {
        var me = this,
            form = btn.up('form'),
            uploadWindow = form.up('window'),
            overlayGrid = me.getProjectOverlaylayersGrid(),
             params = {
                overlay_id: uploadWindow.getRecord().get('id'),
				project_id: overlayGrid.ownerCt.project_id

            };
	
		if (!form.isValid()) {
            Ext.Msg.alert('Attenzione', 'Selezionare un file!', function() {
                uploadWindow.down('#uploadAttachmentField').focus();
            });
            return;
        } else {
            form.submit({
                url: 'overlaylayers/loadOverlaylayerIcon',
                waitMsg: 'Caricamento allegato in corso...',
                params: params,
                success: function(fp, o) {
                    // send feedback
					overlayGrid.getStore().load();
					//chiamo il salvataggio del layer e aggiungo anche l'url dell'immagine
					
                    Ext.Msg.alert('Attenzione', 'Immagine caricata e impostata correttamente');
                    // ricarico il dataview
                    // chiudo la finestra dell upload
                    uploadWindow.close();
                },
                failure: function(a,res) {
                    // console.info(res);
                    if (res.msgError) {
                        var error = res.msgError;
                    }
                    else {
                        var error = 'Impossibile caricare l\'immagine in questo momento.<br />Riprovare più tardi.';
                    }
                    uploadWindow.close();
                    Ext.Msg.alert('Errore', error);
                }
            });
        }
    }

});
