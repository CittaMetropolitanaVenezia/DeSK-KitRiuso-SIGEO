## SIGEO - Sistema Informativo GeoDatabase
Sigeo è un sistema informativo territoriale per l'inserimento di osservazioni territoriali georiferite. 
Nel 2019 si è evoluto, dando la possibilità di dividere in tematiche(progetti) le osservazioni.
## Tech/framework utilizzati
- [Ext JS](https://www.sencha.com/products/extjs/)
- [CakePHP](https://cakephp.org/)
## Prerequisiti
- PHP **5.6.x**
- Apache **2.x** con queste estensioni:
  - initl
  - mbstring
  - libxml
  - pdo_pgsql
  - zip
  - zlib
- Database Postgres **9.x**(consigliata 9.5) con codifica **UTF-8** e Postgis **2.x**
- Server di posta
- Almeno un baselayer (Es: OpenStreetMap)
- Tematismi WMS da esporre in mappa
## Installazione
1. Scaricare la cartella del progetto, posizionarla nella document root del web server e rinominarla in 'sigeo';
2. Restaurare il file dump.sql all'interno di un database vuoto;
3. Se non è presente, creare un collegamento alla cartella temporanea del web server all'interno della document root;
4. Assicurarsi che le cartelle 'attachments', 'Config', 'tmp', 'webroot' abbiano tutti i permessi necessari
  - Linux:
    Accedere alla shell e navigare fino alla cartella dell'applicativo, quindi eseguire qeusto comando:
    ```
    sudo chmod -R 777 [nome_cartella]
    ```
5. Aprire il file *database.php* all'interno della cartella Config e configurare la connessione al DB;
6. Popolare la tabella 'towns' del DB con i dati delle città desiderate.
## Utilizzo
1. Accedere all'applicativo tramite l'url del server / sigeo:
    ```
    http://www.example.com/sigeo
    ```
2. Effettuare il login: 
   - Username : sigeo
   - Password : sigeo2019
3. Selezionare l'unico progetto esistente e premere 'carica', si verrà reindirizzati alla home dell'applicativo;
   *Il progetto già esistente non è altro che un esempio, da usare per prendere mano con le varie impostazioni.*
   *l'utente con cui si ha effettuato il login appartiene al gruppo Admin,gli utenti si dividono in  Admin e Comuni:*
   - **Admin**
     - Gli utenti Admin hanno accesso al pannello di amministrazione, raggiungibile tramite il primo pulsante in basso a destra.
     - Da questo pannello è possibile gestire gli utenti, i vari comuni/enti, le impostazioni generali e i progetti.
     - Tutti gli utenti Admin hanno la possibilità di inserire tramite pulsante 'Nuova osservazione'  o cancellare le osservazioni              presenti in mappa: basterà entrare nel dettaglio dell'osservazione da eliminare e premere l'apposito pulsante.
   - **Comuni**
     - Gli utenti Comuni non hanno accesso al pannello di amministrazione, in oltre possono accedere solo a progetti attivi.
     - Ogni utente comune è associato ad un comune/ente che* **non** *va cambiato una volta definito.
     - Tutti gli utenti comuni hanno la possibilità di inserire nuove osservazioni tramite l'apposito pulsante in alto a destra, ma non        di cancellarle
   - **Sia utenti che enti/comuni devono essere associati ai progetti di cui faranno parte, questo è possibile tramite la loro relativa         scheda nel pannello di amministrazione**
4. Dopo preso mano con l'applicativo, accedere al pannello di amministrazione dei progetti e creare il primo vero progetto. Un           progetto per essere funzionale ha bisogno di tutti i campi obbligatori delle sue impostazioni, oltre ad almeno un baselayer inserito e un tipo di osservazione.
   Si può accedere alle impostazioni del progetto appena creato tramite l'apposito pulsante sulla griglia dei progetti;
5. Configurato il progetto, va reso attivo, modificandolo dalla griglia;
6. Creare ed associare i vari  enti caricati/creati e l'utente di esempio al nuovo progetto;
7. Eseguire il login con lo stesso utente al nuovo progetto, caricarlo e, se desiderato, cancellare il progetto di esempio;
8. Eliminare i dati di esempio all'interno della tabella 'towns'

