Ext.define('SIO.view.submissions.edit.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.submissions.edit.panel',
    requires: [
        'SIO.view.submissions.edit.Form',
        'SIO.view.submissions.edit.Grid',
        'SIO.view.submissions.edit.DataVIew',
        'SIO.view.submissions.edit.UploadForm'
    ],

    title: 'Nuova Osservazione',

    config: {
        thisPanelTitle: 'Nuova Osservazione',
        record: null,
        typeDescriptions: new Array(),//memorizzo l'associazione tipologia + descrizione
        drawMode: ''
    },

    layout: 'border',

    initComponent: function() {
        var me = this;

        Ext.apply(me, {
            items: [
                {
                    xtype: 'submissiontypes.edit.grid',
                    height: 210,
                    region: 'north'
                },
                {
                    xtype: 'submissions.edit.form',
                    region: 'center'
                },
                {
                    xtype: 'submissions.edit.dataview',
                    height: 150,
                    region: 'south',
                    collapsed: true,
                    collapsible: true
                }
            ],
            tbar: [
                'Strumenti di disegno',
                {
                    glyph: 'xe042@Icomoon',
                    tooltip: 'Inserisci/Modifica punto',
                    text: 'Punto',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawPointBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'point',
					disabled: !SIO.Settings.getAllowPoint()
                },
                {
                    glyph: 'xe15e@Icomoon',
                    tooltip: 'Inserisci/Modifica linea',
                    text: 'Linea',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawLineBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'line',
					disabled: !SIO.Settings.getAllowLine()
                },
				{
					glyph: 'xe15e@Icomoon',
                    tooltip: 'Inserisci/Modifica poligono',
                    text: 'Poligono',
                    toggleGroup: 'drawButtons',
                    itemId: 'drawPolyBtn',
                    flex: 1,
                    allowDepress: false,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'polygon',
					disabled: !SIO.Settings.getAllowPoligon()
				},
                {
                    glyph: 61741,
                    tooltip: 'Cancella le geometrie disegnate',
                    text: 'Cancella',
                    itemId: 'clearDrawBtn',
                    //disabled: true,
                    flex: 1,
                    handler: me.drawButtonsHandler,
                    scope: me,
                    drawMode: 'clear'
                }
            ],
            tools: [
                {
                    text: 'Annulla',
                    xtype: 'button',
                    glyph: 61714,
                    handler: function(btn) {
                        me.fireEvent('beforecancel', me, btn);
                    },
                    scope: me,
                    style: {
                        marginRight: '10px'
                    },
                    width: 90
                },
                {
                    text: 'Salva',
                    xtype: 'button',
                    glyph: 61639,
                    handler: function(btn) {
                        me.fireEvent('beforesave', me, btn);
                    },
                    scope: me,
                    cls: 'btn-green',
                    width: 90
                }
            ],

            header: {
                padding: '6px 5px 6px 10px'
            },
            listeners: {
                activate: me.onActivate,
                render: me.onRender
            }
        });

        me.callParent(arguments);
    },

    onActivate: function() {
        //console.info('activare edit panel');
        var me = this;
        // reset draw toolbar
        me.resetDrawToolbar();

        // load submissiontypes grid and attach select handler
        me.loadSubmissiontypesGrid();

    },

    saveDescription: function(textarea) {
        var me = this,
            typeDescriptions = me.getTypeDescriptions(),
            subTypesGrid = me.down('[xtype=submissiontypes.edit.grid]'),
            records = subTypesGrid.getSelectionModel().getSelection(),
            textValue = textarea.getValue();
        if (records && records.length > 0) {
            var last = records.length - 1;
            //del primo memorizzo dentro il vettore
            var idFirst = records[last].get('id');
            typeDescriptions[idFirst] = textValue;
        }
    },

    //carico le tipologie di osservazioni
    loadSubmissiontypesGrid: function() {
        var me = this,
            drawPointBtn = me.down('#drawPointBtn'),
            drawPolyBtn = me.down('#drawPolyBtn'),
			drawLineBtn = me.down('#drawLineBtn'),
            clearDrawBtn = me.down('#clearDrawBtn'),
            typeDescriptions = me.getTypeDescriptions(),
            subTypesGrid = me.down('[xtype=submissiontypes.edit.grid]'),
            store = subTypesGrid.getStore('Submissiontypes'),
            textArea = me.down('[xtype=submissions.edit.form] textarea');

        //add selectchange event
        //solo il primo giro
        if (!me.secondTime) {

            me.secondTime = true;

            textArea.on('keyup',me.saveDescription,me);

            subTypesGrid.getSelectionModel().on('selectionchange',function(a,records){
                var typeDescriptions = me.getTypeDescriptions();
                textArea.setReadOnly(false);
                //controllo e abilito il pulsante relativo al punto o al poligono
                //console.info(records);
                if (records && records.length > 0){
                    //scorro tutti i valori
                    var checkPoly = false;
                    var checkOldPoly = false;
					var checkLine = false;
					var checkOldLine = false;
                    for (var i=0; i<records.length; i++) {
                        var record = records[i];
                        var geom_type = record.get('geom_type');
                        if (geom_type == 'polygon' && i == (records.length-1)) { //se è l'ultimo premuto
                            checkPoly = record;
                        }
                        else if (geom_type == 'polygon') {//se è stato premuto in precedenta ma non è l'ultimo lo spengo
                            checkOldPoly = record;
                        }
						else if (geom_type == 'line' && i == (records.length-1)) { //se è l'ultimo premuto
                            checkLine = record;
                        }
                        else if (geom_type == 'line') {//se è stato premuto in precedenta ma non è l'ultimo lo spengo
                            checkOldLine = record;
                        }
                    }

                    //se polygon
                    if (checkPoly) {
                        //reset tutto gli altri e abilito il poligono
                        me.resetDrawToolbar();
                        drawPointBtn.setDisabled(true);
						drawLineBtn.setDisabled(true);
                        drawPolyBtn.setDisabled(false);
                        //sospendo gli eventi
                        subTypesGrid.getSelectionModel().suspendEvents();
                        //deseleziono tutto
                        subTypesGrid.getSelectionModel().deselectAll();
                        //riseleziono il poligono
                        subTypesGrid.getSelectionModel().select([checkPoly]);
                        //riattivo gli eventi
                        subTypesGrid.getSelectionModel().resumeEvents();

                    }else if(checkLine){
						me.resetDrawToolbar();
						drawPointBtn.setDisabled(true);
						drawLineBtn.setDisabled(false);
                        drawPolyBtn.setDisabled(true);
						//sospendo gli eventi
                        subTypesGrid.getSelectionModel().suspendEvents();
                        //deseleziono tutto
                        subTypesGrid.getSelectionModel().deselectAll();
						//riseleziono il poligono
                        subTypesGrid.getSelectionModel().select([checkLine]);
                        //riattivo gli eventi
                        subTypesGrid.getSelectionModel().resumeEvents();
					}
                    else if(checkOldPoly){
                        //sospendo gli eventi
                        subTypesGrid.getSelectionModel().suspendEvents();
                        //deseleziono il poligono
                        subTypesGrid.getSelectionModel().deselect([checkOldPoly]);
                        //riattivo gli eventi
                        subTypesGrid.getSelectionModel().resumeEvents();
                        //abilito il pulsante point e continuo la selezione
                        drawPointBtn.setDisabled(false);
                        drawPolyBtn.setDisabled(true);
						drawLineBtn.setDisabled(true);
                    }else{
						//sospendo gli eventi
                        subTypesGrid.getSelectionModel().suspendEvents();
                        //deseleziono il poligono
                        subTypesGrid.getSelectionModel().deselect([checkOldLine]);
                        //riattivo gli eventi
                        subTypesGrid.getSelectionModel().resumeEvents();
                        //abilito il pulsante point e continuo la selezione
                        drawPointBtn.setDisabled(false);
						drawPolyBtn.setDisabled(true);
                        drawLineBtn.setDisabled(true);
					}
                }
                else {
                    me.resetDrawToolbar();
                    drawPointBtn.setDisabled(true);
                    drawPolyBtn.setDisabled(true);
					drawLineBtn.setDisabled(true);
                }

                //pulisco la textarea
                textArea.reset();


                var r = subTypesGrid.getSelectionModel().getSelection();
                //se ho selezione
                if (r && r.length > 0) {
                    var last = r.length - 1;
                    var idLast = r[last].get('id');
                    if (typeDescriptions[idLast] != "") {
                        textArea.setValue(typeDescriptions[idLast]);
                    }
                }

            },me);
        }//fine se primo giro
        else {//deseleziono tutto
            subTypesGrid.getSelectionModel().suspendEvents();
            //deseleziono il poligono
            subTypesGrid.getSelectionModel().deselectAll();
            textArea.setReadOnly(true);
            me.setTypeDescriptions([]);
            //riattivo gli eventi
            subTypesGrid.getSelectionModel().resumeEvents();
        }
		store.getProxy().extraParams = {
			project_id: false,
			};
        store.load();
        /*store.filterBy(function(record, id){
            if (neighborsIds.indexOf(id) > -1)
                return true
        });*/

    },

    /*filterNeighborsGrid: function() {
        var me = this,
            store = Ext.getStore('Towns'),
            neighborsIds = SIO.Settings.getTownNeighborsId();
        store.clearFilter();
        store.filterBy(function(record, id){
            if (neighborsIds.indexOf(id) > -1)
                return true
        });
    },*/

    resetDrawToolbar: function() {
        var me = this,
            drawPointBtn = me.down('#drawPointBtn'),
            drawPolyBtn = me.down('#drawPolyBtn'),
			drawLineBtn = me.down('#drawLineBtn'),
            clearDrawBtn = me.down('#clearDrawBtn');
        // toggle draw buttons
        drawPointBtn.toggle(false, true);
        drawPolyBtn.toggle(false, true);
		drawLineBtn.toggle(false, true);
        // blur draw buttons
        drawPointBtn.blur();
        drawPolyBtn.blur();
		drawLineBtn.blur();
        // disable clearBtn
        //clearDrawBtn.setDisabled(true);
        // set draw mode
        me.setDrawMode('');
    },

    changeContainerTitle: function() {
        var me = this;
        if (me.getRecord()) {
            me.up('container').setTitle('Modifica osservazione');
        } else {
            me.up('container').setTitle('Nuova osservazione');
        }
    },

    drawButtonsHandler: function(btn) {
        var me = this,
            currentDrawMode = me.getDrawMode();
        // clear drawed feature
        if (btn.drawMode == 'clear') {
            // ask confirmation
            SIO.Utilities.confirm('Sicuro di voler cancellare il disegno?', 'Conferma', function(res) {
                if (res == 'yes') {
                    // disable this button
                    me.resetDrawToolbar();
                    // fire clear event
                    me.fireEvent('cleardraw');
                    // reset draw mode
                    me.setDrawMode('');
                }
            });
        } else {
            if (btn.drawMode != currentDrawMode) {
                if (currentDrawMode != '') {
                    SIO.Utilities.confirm('Cambiando tipologia il precedente disegno verrà cancellato. Continuare?', 'Conferma', function(res) {
                        if (res == 'yes') {
                            // fire draw event
                            me.fireEvent('startdraw', btn.drawMode);
                            // save mode
                            me.setDrawMode(btn.drawMode);
                        }
                    });
                } else {
                    // fire draw event
                    me.fireEvent('startdraw', btn.drawMode);
                    // save mode
                    me.setDrawMode(btn.drawMode);
                }
            }
        }
    }
});