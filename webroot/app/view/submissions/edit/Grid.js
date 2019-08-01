Ext.define('SIO.view.submissions.edit.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.submissiontypes.edit.grid',

    title: 'Tipologie di osservazione',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            selType: 'checkboxmodel',
			selModel : {
				showHeaderCheckbox: false,
				checkOnly: true
			},
            store: 'Submissiontypes',
            columns: [
                { draggable: false, menuDisabled: true, header: "Descrizione", dataIndex: 'description', flex: 1}
            ]
        });



        me.callParent(arguments);
    },

    getSelectedTypesId: function() {
        var me = this,
            selModel = me.getSelectionModel(),
            selection = selModel.getSelection(),
            ids = [];
        if (selection.length) {
            Ext.Array.each(selection, function(town) {
                ids.push(town.get('id'));
            });
        }
        // console.info(ids);
        return ids;
    },
});