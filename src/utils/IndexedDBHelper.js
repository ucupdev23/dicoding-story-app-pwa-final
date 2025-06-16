import { openDB } from "idb";

const DB_NAME = "story-app-db";
const DB_VERSION = 1;
const STORIES_STORE_NAME = "favorite-stories";

class IndexedDBHelper {
  constructor() {
    this.dbPromise = null;
  }

  async _getDb() {
    if (!this.dbPromise) {
      console.log(
        "IndexedDBHelper: Opening database:",
        DB_NAME,
        "version:",
        DB_VERSION
      );
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          console.log(
            "IndexedDBHelper: Upgrading database. Creating store:",
            STORIES_STORE_NAME
          );
          if (!db.objectStoreNames.contains(STORIES_STORE_NAME)) {
            db.createObjectStore(STORIES_STORE_NAME, { keyPath: "id" });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async addStory(story) {
    console.log("IndexedDBHelper: Adding story:", story.id);
    const db = await this._getDb();
    const tx = db.transaction(STORIES_STORE_NAME, "readwrite");
    const store = tx.objectStore(STORIES_STORE_NAME);
    await store.put(story);
    await tx.done;
    console.log(`IndexedDB: Story "${story.name}" added/updated.`);
  }

  async getAllStories() {
    console.log("IndexedDBHelper: Getting all stories.");
    const db = await this._getDb();
    // Buka transaksi 'readonly'
    return db
      .transaction(STORIES_STORE_NAME)
      .objectStore(STORIES_STORE_NAME)
      .getAll();
  }

  async getStoryById(id) {
    const db = await this._getDb();
    return db
      .transaction(STORIES_STORE_NAME)
      .objectStore(STORIES_STORE_NAME)
      .get(id);
  }

  async deleteStory(id) {
    console.log("IndexedDBHelper: Deleting story:", id);
    const db = await this._getDb();
    const tx = db.transaction(STORIES_STORE_NAME, "readwrite");
    await tx.objectStore(STORIES_STORE_NAME).delete(id);
    await tx.done;
    console.log(`IndexedDB: Story with ID "${id}" deleted.`);
  }

  async isStoryFavorite(id) {
    console.log("IndexedDBHelper: Checking if story is favorite:", id);
    const db = await this._getDb();
    const story = await db
      .transaction(STORIES_STORE_NAME)
      .objectStore(STORIES_STORE_NAME)
      .get(id);
    return !!story;
  }
}

export default IndexedDBHelper;
