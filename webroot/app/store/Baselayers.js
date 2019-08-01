//Store dei baselayers
Ext.define('SIO.store.Baselayers', {
    extend: 'Ext.data.Store',
    alias: 'store.baselayers',
    requires: [
        'SIO.model.Baselayer'
    ],
    remoteFilter: true,
    storeId: 'Baselayers',
    autoLoad: false,
    model: 'SIO.model.Baselayer',
    sorters: [{
        property: 'type',
        direction: 'ASC'
    }]
});