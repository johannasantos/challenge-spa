const { unlink } = require('fs')

const { itemsStore } = require("../models/store")

exports.listItems = (req, res) => {
    itemsStore.find({}).sort({ order: 1 }).exec(function (err, docs) {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send({ success: true, count: docs.length, items: docs })
        }
    });
}

exports.createItem = (req, res) => {
    itemsStore.count({}, function (err, count) {
        itemsStore.insert({
            image: req.file.path,
            description: req.body.description,
            order: count // 0, 1, 2, 3 ...
        }, function (err, doc) {
            if (err) {
                res.status(500).send(err)
            } else {

                res.send({ success: true, item: doc })
            }
        });
    })
}

exports.updateItem = (req, res) => {
    itemsStore.findOne({ _id: req.params.id }, function (err, oldItem) {
        let newItem;

        if (err) {
            return res.status(500).send(err)
        }

        newItem = {
            ...oldItem
        };

        newItem.description = req.body.description;

        if (req.file) {
            // I won't care much about a possible error in the
            // deletion of an existing file, by now.
            unlink(oldItem.image, () => { })
            newItem.image = req.file.path
        }

        itemsStore.update(
            { _id: req.params.id },
            newItem,
            function (err, numReplaced) {
                if (err) {
                    res.status(500).send(err)
                } else {
                    res.send({ success: true, item: newItem })
                }
            }
        );
    });
}

exports.deleteItem = (req, res) => {
    itemsStore.remove({ _id: req.params.id }, {}, function (err, numRemoved) {
        if (err) {
            res.status(500).send(err)
        } else {
            res.send({ success: true })
        }
    });
}

exports.updateOrder = (req, res) => {
    const newOrder = req.body.map((itemId, index) => {
        return {
            _id: itemId,
            order: index
        }
    });

    newOrder.forEach(item => {
        itemsStore.update(
            { _id: item._id },
            { $set: { order: item.order } },
            {},
            function (err, numReplaced) {
                if (err) {
                    res.status(500).send(err)
                }
            }
        );
    })

    res.send({ success: true })
}