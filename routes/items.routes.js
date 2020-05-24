const { Router } = require('express')
const multer = require('multer')
const md5 = require('md5')
const {
    listItems,
    createItem,
    updateItem,
    deleteItem,
    updateOrder
} = require('../controllers/items.controller')

const router = Router()

/**
 * Using `multer` middleware to handle file uploads.
 */
const upload = multer({
    storage: multer.diskStorage({
        destination: './img/',
        // I'm generating a standarized name only to fulfill my OCD.
        filename: (req, file, cb) => {
            const extension = file.originalname.split('.').pop()
            cb(null, `${md5(Date.now())}.${extension}`)
        }
    })
})

router.get('/', listItems)

router.post('/', upload.single('image'), createItem)

router.put('/:id', upload.single('image'), updateItem)

router.delete('/:id', deleteItem)

router.put('/order/update', upload.none(), updateOrder)

module.exports = router
