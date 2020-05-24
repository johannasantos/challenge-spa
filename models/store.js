const Datastore = require('nedb');
const seed = require("./db-seed/initial-data.json")

const items = new Datastore({ filename: './store/items.db' });

items.loadDatabase(function (err) {
    if (err) { console.log(err); return; }

    items.count({}, function (err, count) {
        if (!count) {
            items.insert(seed);
        }
    });
    // Start issuing commands after callback...
});

module.exports = {
    itemsStore: items,
};