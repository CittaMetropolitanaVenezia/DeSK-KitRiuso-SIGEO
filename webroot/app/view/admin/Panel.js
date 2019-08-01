//Pannello di amministrazione
Ext.define('SIO.view.admin.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.admin.panel',
	
	//Inclusione dei file SIO creati
    requires:[
        'SIO.view.admin.users.Grid',
        'SIO.view.admin.towns.Grid',
        'SIO.view.admin.system.Form',
		//Progetti
		'SIO.view.admin.projects.panel',
		'SIO.view.admin.projects.settings', //Attenzione ad aggiungere punti si aggiungono anche sotto cartelle in cui devono essere inseriti i file
		'SIO.view.admin.baselayers.panel',
		'SIO.view.admin.overlaylayers.panel',
		'SIO.view.admin.overlaylayers.UploadWindow',
		'SIO.view.admin.system.Generalsettings'

    ],

    layout: {
        type: 'card'
    },

    dockedItems: [
        {
            xtype: 'toolbar',
            docked: 'top',
            defaults: {
                scale: 'medium',
                iconAlign: 'top',
                width: 120,
                toggleGroup: 'adminBtns',
                allowDepress: false
            },
            items: [
                {
                    text: 'Utenti',
                    glyph: 61632,
                    pressed: true,
                    itemId: 'systemUser'
                },
                {
                    text: 'Enti/Comuni',
                    glyph: 61746,
                    itemId: 'systemTown'
                },
               /* {
                    text: 'Impostazioni',
                    hidden: false,
                    glyph: 61459,
                    itemId: 'systemIni'
                },*/
				//20190515 GI: Inserimento della scheda progetti
                {
                    text: 'Progetti',
                    hidden: false,
                    glyph: 61459,
                    itemId: 'systemProjects'					
                }
            ]
        }
    ],

    defaults: {
        padding: 5
    },

    items: [
        {
            xtype: 'admin.users.grid'
        },
        {
            xtype: 'admin.towns.grid'
        },
        {
            xtype: 'admin.system.generalsettings'
        },
		{
			xtype: 'admin.projects.panel' //admin.projects.panel sul modello del projects
		}
		
    ]

});
