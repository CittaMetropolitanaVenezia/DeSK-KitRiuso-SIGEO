//Store degli overlaylayers
Ext.define('SIO.store.Overlaylayers', {
    extend: 'Ext.data.Store',
    alias: 'store.overlaylayers',
    requires: [
        'SIO.model.Overlaylayer'
    ],
    remoteFilter: true,
    storeId: 'Overlaylayers',
    autoLoad: false,
    model: 'SIO.model.Overlaylayer',
    sorters: [{
        property: 'type',
        direction: 'ASC'
    }]
});