Ext.define('SIO.model.Submissiontype', {
    extend: 'Ext.data.Model',
    //id: 'Submissiontype',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'submissiontypes'
    },

    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
			useNull: true
        },
        {
            name: 'description',
            type: 'string'
        },
        {
            name: 'geom_type',
            type: 'string'
        },
		{
			name: 'project_id',
			type: 'int'
		},
        {
            name: 'code',
            type: 'string'
        },
        {
            name: 'created',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s'
        },
		{
			name: 'active',
			type: 'boolean'
		}
    ]
});