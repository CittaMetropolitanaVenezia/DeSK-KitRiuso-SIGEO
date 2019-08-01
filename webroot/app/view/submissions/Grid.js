Ext.define('SIO.view.submissions.Grid', {
    extend: 'Ext.grid.Panel',
    // extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.grid',
    requires: [
        'SIO.view.submissions.TownsCombo',
        'SIO.view.submissions.TownsFilterToolbar',
        'SIO.view.submissions.StatusesFilterToolbar'
    ],

    title: 'Elenco Osservazioni',

    layout: 'fit',
    emptyText: 'Nessun risultato trovato',

    viewConfig: {
        markDirty: false
    },

    config: {

    },

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            store: 'Submissions',
            listeners: {
                select: function(grid, selected) {
                    var layer = selected.raw,
                        map = layer._map;
                    map.zoomToLayer(layer, true);
                }
            },
            columns: [

                {
                    text: "Id",
                    draggable: false,
                    width: 50,
                    /*xtype: 'actioncolumn',*/
                    dataIndex: 'id'
                },
                { draggable: false, text: "Ente/Comune proponente", flex: 1, dataIndex: 'from_town_name' },
                { width: 90, draggable: false, text: "Data", renderer: Ext.util.Format.dateRenderer('d/m/Y'), dataIndex: 'created' },
                {
                    width: 30,
                    sortable: false,
                    draggable: false,
                    menuDisabled: true,
                    xtype: 'actioncolumn',
                    dataIndex: 'id',
                    renderer: function(v, metadata, r) {
                        metadata.tdAttr = 'data-qtip="Visualizza dettaglio osservazione"';
                    },
                    items: [
                        {
                            handler: function(grid, rowIndex, colIndex) {
                                var record = grid.getStore().getAt(rowIndex);
                                Ext.globalEvents.fireEvent('viewsubmission', record);
                            },
                            getClass: function(v, metadata, record) {
                                if (v || SIO.Settings.isProvince()) {
                                    return 'icon-document';
                                } else {
                                    return 'icon-document-edit';
                                }
                            }
                        }
                    ]
                }
            ],
            dockedItems: [
                {
                    xtype: 'toolbar',
                    docked: 'top',
                    hidden: SIO.Settings.isTown(),
                    items: [
                        {
                            xtype: 'submissions.townscombo',
                            flex: 1
                        }
                    ]
                },
                {
                    //docked: 'top',
                    xtype: 'submissions.townsfiltertoolbar',
                    hidden: SIO.Settings.isProvince()
                },
                {
                    xtype: 'submissions.statusesfiltertoolbar'
                }
            ]
        });

        me.callParent(arguments);
    }
});