Ext.define('SIO.view.submissions.detail.Grid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.submissiontypes.detail.grid',

    title: 'Tipologie di osservazione',

    initComponent: function() {
        var me = this;
        //clono lo store
        var s = Ext.create('SIO.store.Submissiontypes');
        Ext.apply(me, {
            store: s,
            columns: [
                { draggable: false, menuDisabled: true, text: "Descrizione", dataIndex: 'description', flex: 1}
            ]
        });



        me.callParent(arguments);
    }
});