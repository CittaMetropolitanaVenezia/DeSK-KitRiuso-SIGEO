Ext.define('SIO.controller.Login', {
    extend: 'Ext.app.Controller',

    refs: [
        {
            ref: 'loginForm',
            selector: '[xtype=login.form]'
        }
    ],

    init: function() {
        this.listen({
            global: {
                passwordexpired: this.onPasswordExpired,
				loggedinuser: this.openProjectSelection
            }
        });
    },
	openProjectSelection: function(userData){
				var me = this;
	     Ext.create('Ext.window.Window', {
			title: 'Seleziona progetto',
			width: 400,
			height: 150,
			autoScroll: true,
			modal: true,
			items: [{ 
						xtype: 'login.loginprojectcombo',
						user_id: userData
					}],
			buttons: 
			[{
				text: 'Carica',
				handler: this.loadProject,
				flex: 1
			},
			{
				text: 'Esci',
				handler: this.backToLogin,
				flex: 1
			}],
		}).show();
		
		
		
	},
	loadProject : function(view) {		
		user_id = view.up('panel').down('combobox').ownerCt.user_id;
		project_id = view.up('panel').down('combobox').lastValue;
		if(!project_id){
			Ext.Msg.alert('Attenzione','Selezionare un progetto.');
		}else{
			
		var params = {'user_id': user_id, 'project_id': project_id};
		 Ext.Ajax.request({
                url: 'users/checksession',
                params: params,
				method: 'POST',
                success: function(response){
                    // parse server response
                    response = Ext.JSON.decode(response.responseText);
                    if (response.success === true) {					
                       // show main loading mask
                        SIO.showLoadingMask();
                        // destroy this window
                        //me.close();
						SIO.hideLoadingMask();					
                        // fire global event					
						if(response.message != '') {
							Ext.Msg.alert('Attenzione', 'il progetto non è attivo.');
						}
                        Ext.globalEvents.fireEvent('loggedin', response.data);
						view.up('window').close();
						
                    }else if (response.success === false) {
                            // send user feedback
                            SIO.showNotification(response.message);
                    }
                },
                failure: function() {
                    // unmask
                    me.getEl().unmask();
                    // send feedback
                    Ext.Msg.alert('Attenzione', 'Impossibile caricare il progetto in questo momento.<br />Riprovare pi&ugrave; tardi.')
                }
            });
		}
		},
	backToLogin : function () {
		Ext.globalEvents.fireEvent('logout');
		},
		

    onPasswordExpired: function (message) {
        var me = this,
            loginForm = me.getLoginForm(),
        // copy username value
            username = loginForm.down('#username'),
        // copy password value
            oldPassword = loginForm.down('#password');
        // request feedback
        /*Ext.Msg.confirm('Attenzione', 'Per continuare devi cambiare la password provvisoria.', function(btn) {
         if (btn == 'yes') {
         // close loginForm window
         loginForm.close();
         // define password renew window
         var renewwin = Ext.create('SIO.view.login.ChangePwd');
         // set username to renew form
         renewwin.down('#username').setValue(username.getValue());
         renewwin.down('#password').setValue(oldPassword.getValue());
         // show renew window
         renewwin.show();
         }
         });*/

        var acceptWindow = Ext.create('Ext.window.Window', {
            title: 'Attenzione',
            height: 550,
            width: 800,
            modal: true,
            layout: 'fit',
            items: {
                xtype: 'form',
                tbarCfg:{
                    buttonAlign:'center'  //for center align
                },
                padding: 10,
                items:[{
                    xtype : 'box',
                    width : 483,
                    height : 135,
                    html : '<img src="resources/login/header_long.png" />'
                },{
                    xtype: 'container',
                    html: '<center><h3>Per continuare devi cambiare la password provvisoria, continuare?</h3></center>',
                    height: 40
                },/*{
                    xtype: 'container',
                    style: 'border: 1px solid grey;padding:10px',
                    margin: 10,
					html: message,
                    height: 200,
                    autoScroll: true
                }*/],
                dockedItems: [{
                    xtype: 'toolbar',
                    layout:{
                        pack: 'center'
                    },
                    buttonAlign:'center',
                    dock: 'bottom',
                    items: [{
                        text: 'SI',
                        width: 100,
                        scale: 'medium',
                        handler: function() {
                            var me = this,
                                acceptWindow = me.up('window');
                            //acceptCheckBox = acceptWindow.down('#accept');

                            /*if (!acceptCheckBox.getValue()) {
                             acceptCheckBox.markInvalid('E\' obbligatorio accettare le condizioni');
                             Ext.Msg.alert('Attenzione','E\' obbligatorio accettare le condizioni');
                             return false;
                             }*/
                            // close loginForm window
                            loginForm.close();

                            acceptWindow.close();
                            // define password renew window
                            var renewwin = Ext.create('SIO.view.login.ChangePwd');
                            // set username to renew form
                            renewwin.down('#username').setValue(username.getValue());
                            renewwin.down('#password').setValue(oldPassword.getValue());
                            // show renew window
                            renewwin.show();
                        }
                    },{
                        text: 'NO',
                        width: 100,
                        scale: 'medium',
                        handler: function() {
                            this.up('window').close();
                        }
                    }]
                }]
            }
        }).show();

    }
});