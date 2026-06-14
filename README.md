# HeBT - Help Buy To Eat

> Un tracker intelligente per la dispensa, ricettario avanzato e planner alimentare con calcolo dinamico delle porzioni.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3-brightgreen.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)

**HeBT (Help Buy To Eat)** è una Single Page Application (SPA) full-stack progettata per semplificare la gestione domestica dei pasti. Ti aiuta a pianificare le diete settimanali, monitorare le scadenze degli ingredienti in dispensa, generare liste della spesa intelligenti e calcolare dinamicamente le ricette in base al numero di ospiti.

---

## Key Features

* **Ricettario Avanzato:** Aggiungi ricette con gestione dinamica delle unità di misura. Conversioni automatiche tra sistemi metrici, anglosassoni e misurazioni "casalinghe" (cucchiai, tazze).
* **Cooking Mode Dinamico:** Ricalcola le dosi in tempo reale in base agli ospiti e verifica se hai abbastanza ingredienti in dispensa prima di iniziare a cucinare.
* **Meal Planner:** Pianifica i tuoi pasti nel calendario. Interfaccia intuitiva per organizzare la settimana alimentare.
* **Smart Shopping List:** Genera la lista della spesa automaticamente basandoti sui pasti pianificati in un range di date. Gestione per "reparti del supermercato" ed esportazione rapida verso app esterne (es. Apple Notes, WhatsApp).
* **Gestione Dispensa:** Spunta gli elementi dalla spesa per spostarli automaticamente in dispensa. Monitoraggio delle scadenze e suggerimento ricette basato sugli ingredienti attualmente disponibili.

---

## Project Architecture & Tech Stack

Il progetto segue le best practice dell'architettura enterprise, dividendo chiaramente le responsabilità tra frontend (SPA) e backend (RESTful APIs).

### Backend
* **Java 21 / Spring Boot 3:** Core del server.
* **Spring Data JPA / Hibernate:** ORM per la persistenza e gestione del database.
* **PostgreSQL 18+:** Database relazionale.
* **Lombok:** Riduzione del codice boilerplate.
* **Maven:** Dependency management.

### Frontend
* **React 19 + TypeScript:** UI reattiva e tipizzata.
* **Vite:** Build tool ultra-veloce.
* **Tailwind CSS + Radix UI:** Styling utility-first e componenti accessibili.
* **Swiper:** Caroselli fluidi per le ricette.
* **Sonner:** Notifiche toast non bloccanti.
* **React Router:** Gestione del routing client-side.

### Infrastruttura
* **Docker & Docker Compose:** Containerizzazione del database (e predisposizione per l'orchestrazione dell'intera app).

---

## Getting Started

### Prerequisiti
* [Docker Desktop](https://www.docker.com/products/docker-desktop) installato e in esecuzione.
* [Java 21](https://adoptium.net/) installato.
* [Node.js](https://nodejs.org/) (versione 20+ raccomandata) installato.

### 1. Avvio del Database (Docker)
L'applicazione utilizza PostgreSQL configurato sulla porta locale `5433` per evitare conflitti. I dati sono persistiti tramite volumi Docker.
Nella root del progetto, esegui:
```bash
docker-compose up -d
```
(Per spegnere il DB: 
```bash
docker-compose down)
```

### 2. Avvio del Server Backend (Spring Boot)
Lo schema del database verrà autogenerato al primo avvio grazie alla configurazione ddl-auto=update.
```Bash
cd HeBTSpring
./mvnw spring-boot:run
```
Il server backend sarà in ascolto su http://localhost:8080.

### 3. Avvio del Client Frontend (React/Vite)
Apri un nuovo terminale, entra nella cartella del frontend e avvia il server di sviluppo:
```Bash
cd hebtreact
npm install
npm run dev
```
L'app sarà visibile all'indirizzo http://localhost:5173.

---

## API Endpoints (RESTful)

L'interfaccia backend espone le seguenti API principali:
 **Ingredients**
* GET /api/ingredients/search - Cerca ingredienti esistenti.
* POST /api/ingredients - Crea un nuovo ingrediente di base.
 **Meal Plans (Planner)**
* GET /api/meal-plans?startDate={date}&endDate={date} - Ottiene i pasti programmati in un range.
* POST /api/meal-plans/scheduleMeal - Inserisce un pasto nel calendario.
* PUT /api/meal-plans/{id} - Aggiorna i dettagli di un pasto.
* POST /api/meal-plans/{id}/cook - Cucina un pasto (sottrae ingredienti dalla dispensa).
* DELETE /api/meal-plans/{id} - Rimuove un pasto dal calendario.
 **Pantry (Dispensa)**
* GET /api/pantry - Recupera l'inventario della dispensa.
* POST /api/pantry - Aggiunge manualmente un elemento.
* PUT /api/pantry/{id} - Modifica quantità/scadenza di un lotto.
* DELETE /api/pantry/{id} - Rimuove un elemento dalla dispensa.
 **Recipes**
* GET /api/recipes - Ottiene tutte le ricette.
* GET /api/recipes/{id} - Dettaglio singola ricetta.
* GET /api/recipes/cookable - Suggerisce ricette in base alla dispensa attuale.
* POST /api/recipes - Crea una nuova ricetta.
* PUT /api/recipes/{id} - Modifica una ricetta esistente.
* DELETE /api/recipes/{id} - Elimina una ricetta.
 **Shopping List**
* GET /api/shopping-list - Ottiene la lista della spesa attiva.
* POST /api/shopping-list/generate - Genera una lista incrociando i Meal Plans con la Dispensa.
* POST /api/shopping-list - Aggiunta manuale alla lista.
* PUT /api/shopping-list/{id}/amount - Modifica la quantità da acquistare.
* POST /api/shopping-list/{id}/purchase - Spunta l'elemento (lo sposta in dispensa calcolando la scadenza dinamica).
* DELETE /api/shopping-list/{id} - Rimuove un singolo articolo.
* DELETE /api/shopping-list/clear - Svuota completamente la lista.

---

** Testing
Attualmente il progetto si basa su Manual Testing e flussi di validazione end-to-end gestiti direttamente in fase di sviluppo. L'implementazione di unit test con JUnit 5 / Mockito (per il backend) e test di integrazione frontend (es. Cypress o Vitest) è prevista per le release future > v1.0.0 per garantire maggiore stabilità nelle conversioni matematiche e nella logica del calcolatore della dispensa.

---

** Deployment & CI/CD
Il progetto risiede in una repository Mono-repo su GitHub. La versione stabile di riferimento per la produzione si trova nel branch main, marchiata con il tag v1.0.0.

---

** Contributing
Sentiti libero di aprire issue o pull request se vuoi migliorare il progetto. Per modifiche sostanziali, apri prima una issue per discutere di ciò che vorresti cambiare. 

---

** License
**Copyright (c) 2026 Angelo Cannella. Tutti i diritti riservati.**
Il codice sorgente di questo progetto è pubblicato a scopo di portfolio e consultazione. Non è consentito l'utilizzo, la copia, la modifica, la distribuzione o la commercializzazione di questo software, né delle sue parti logiche e grafiche, senza il previo consenso scritto dell'autore.
Il server backend sarà in ascolto su http://localhost:8080. Lo schema del database (tabelle, vincoli di unicità e relazioni) verrà autogenerato al primo avvio grazie alla configurazione ddl-auto=update.
