Ext.define('SIO.view.submissions.detail.Form', {
    extend: 'Ext.form.Panel',
    alias: 'widget.submissions.detail.form',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            layout: 'fit',
            items: [
                {
                    xtype: 'textarea',
                    readOnly: true,
                    fieldLabel: 'Descrizione',
                    enableKeyEvents: true,
                    labelAlign: 'top',
                    margin: '5px 10px 10px 10px',
                    itemId: 'description',
					dataIndex: 'description'
                }
            ]
        });

        me.callParent(arguments);
    }
});