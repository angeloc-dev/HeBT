# 🛒 HeBT - Help Buy to Eat

Un'applicazione web Full-Stack progettata per ottimizzare la gestione della dispensa domestica, ridurre gli sprechi alimentari e automatizzare la creazione della lista della spesa in base a un piano alimentare personalizzato.

## 🚀 Funzionalità Principali

* **Gestione Ricettario:** Creazione e salvataggio di piatti con ingredienti, dosi precise e istruzioni di cottura.
* **Dispensa Intelligente (FIFO):** Tracciamento degli ingredienti disponibili in casa con relative scadenze e lotti di acquisto.
* **Pianificazione Pasti:** Creazione di un menu settimanale definendo le date e il numero di porzioni.
* **Algoritmo Lista della Spesa:** Calcolo automatico degli ingredienti da acquistare. L'algoritmo incrocia il fabbisogno del menu settimanale con le giacenze in dispensa, escludendo automaticamente i lotti che scadranno prima della data di consumo prevista.
* **Checkout Spesa:** Interfaccia per spuntare gli ingredienti acquistati in tempo reale.

## 🛠️ Stack Tecnologico

Questo progetto è stato sviluppato seguendo le best practice dell'architettura enterprise (Layered Architecture, RESTful APIs, Single Page Application).

**Backend:**
* **Java 21** / **Spring Boot 3**
* **Spring Data JPA / Hibernate** (ORM per la persistenza dei dati)
* **PostgreSQL** (Database Relazionale)
* **Lombok** (Riduzione del codice boilerplate)
* **Maven** (Dependency Management)

**Frontend:** *(In fase di sviluppo)*
* **React** + **TypeScript**
* **Tailwind CSS** (Styling responsive)
* **Vite** (Build tool)

**Infrastruttura:**
* **Docker** (Containerizzazione del Database e successiva orchestrazione dell'app)

## ⚙️ Setup Locale e Avvio

### 1. Avvio del Database (Docker)
L'applicazione richiede un'istanza di PostgreSQL attiva sulla porta `5433`. Puoi avviare il database isolato in un container eseguendo questo comando dal terminale:

```bash
docker run --name dispensa-db -e POSTGRES_PASSWORD=secret -e POSTGRES_DB=dispensa -p 5433:5432 -d postgres
