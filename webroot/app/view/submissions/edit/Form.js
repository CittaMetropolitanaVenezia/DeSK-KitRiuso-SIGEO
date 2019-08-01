Ext.define('SIO.view.submissions.edit.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.edit.form',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            layout: 'fit',
            items: [
                {
                    xtype: 'textarea',
                    fieldLabel: 'Descrizione',
                    readOnly: true,
                    enableKeyEvents: true,
                    labelAlign: 'top',
                    margin: '5px 10px 10px 10px',
                    itemId: 'description'
                }
            ]
        });

        me.callParent(arguments);
    }
});