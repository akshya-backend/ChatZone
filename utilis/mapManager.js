 export const MapManager = {
    myMap: new Map(),

    // Set method: Add a key-value pair to the map if the key doesn't exist
    set(key, value, updateIfExists = false) {
        if (!this.myMap.has(key) || updateIfExists) {
            this.myMap.set(key, value);
        }
    },

    // Get method: Retrieve the value associated with a given key from the map
    get(key) {
        return this.myMap.get(key);
    },

    // Delete method: Remove a key-value pair from the map
    delete(key) {
        this.myMap.delete(key);
    }
};
