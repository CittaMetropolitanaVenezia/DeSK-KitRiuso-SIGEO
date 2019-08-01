Ext.define('SIO.store.Submissiontypes', {
    extend: 'Ext.data.Store',
    alias: 'store.submissiontypes',
    requires: [
        'SIO.model.Submissiontype'
    ],
    pageSize: 9999,
    model: 'SIO.model.Submissiontype',
    sorters: [{
        property: 'id',
        direction: 'DESC'
    }],
    autoLoad: false,
    remoteFilter: false
});