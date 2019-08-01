Ext.define('SIO.model.Submission', {
    extend: 'Ext.data.Model',
    id: 'Submission',
    requires: [
        'SIO.proxy.Rest'
    ],
    proxy: {
        type: 'baserest',
        url: 'submissions'
    },

    idProperty: 'id',
    fields: [
        {
            name: 'id',
            type: 'int',
            mapping: 'properties.id'
        },
        {
            name: 'town_id',
            type: 'int',
            mapping: 'properties.town_id'
        },
        {
            name: 'from_town_name',
            type: 'string',
            mapping: 'properties.from_town_name'
        },
        {
            name: 'user_id',
            type: 'int',
            mapping: 'properties.user_id'
        },
        {
            name: 'submission_types',
            type: 'string',
            mapping: 'properties.submission_types'
        },
        {
            name: 'description',
            type: 'string',
            mapping: 'properties.description'
        },
        {
            name: 'geom_type',
            type: 'string',
            mapping: 'properties.geom_type'
        },
        {
            name: 'created',
            type: 'date',
            dateReadFormat: 'Y-m-d H:i:s',
            mapping: 'properties.created'
        }
    ]
});