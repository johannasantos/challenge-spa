import './index.scss'
import { render } from 'mustache'
import 'regenerator-runtime/runtime'
import Sortable from 'sortablejs'

const App = {
    items: [],
    sortableList: null
}


const loadItems = async () => {
    const response = await fetch('/items')
    const { items } = await response.json()
    App.items = items
    renderItems()
    renderCount()
    initializeSortable()
}

const renderItems = () => {
    ;[...itemList.children].forEach(removeItemFromDOM)

    itemList.innerHTML = App.items
        .map(item => render(itemTemplate.innerHTML, item))
        .join('')

        ;[...itemList.children].forEach(item => {
            item.querySelector('.edit').addEventListener('click', editItemCallback)
            item.querySelector('.delete').addEventListener('click', deleteItemCallback)
        })

    renderCount()
}

const editItemCallback = ({ target }) => {
    const itemId = target.dataset.id
    showItemForm(itemId)
}

const deleteItemCallback = async ({ target }) => {
    const itemId = target.dataset.id
    const response = await fetch(`/items/${itemId}`, { method: 'DELETE' })
    const { success } = await response.json()

    if (success) {
        App.items = App.items.filter(item => item._id !== itemId)
        renderItems()
        updateOrder()
    }
}

const removeItemFromDOM = item => {
    item.querySelector('.edit').removeEventListener('click', editItemCallback)
    item.querySelector('.delete').removeEventListener('click', deleteItemCallback)
    item.remove()
}

const renderCount = () => {
    itemCount.innerHTML = `${App.items.length} items`
}

const initializeSortable = () => {
    if (App.sortableList) {
        App.sortableList.destroy()
    }

    App.sortableList = Sortable.create(itemList, { onEnd: updateOrder })
}

const updateOrder = async () => {
    const response = await fetch('/items/order/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(App.sortableList.toArray())
    })
    const { success } = await response.json()

    if (success) {
        ;[...itemList.children].forEach((item, index) => {
            item.dataset.id = index
        })
    }
}

const showItemForm = itemId => {
    const [item = {}] = App.items.filter(item => item._id === itemId)

    itemEditor.innerHTML = render(itemFormTemplate.innerHTML, item)

    image.addEventListener('change', validateAndLoadThumbnail)
    itemFormCancel.addEventListener('click', destroyItemForm)
    itemFormSave.addEventListener('click', validateAndSaveItem)
}

const validateAndLoadThumbnail = ({ target }) => {
    const file = target.files[0]

    itemFormErrors.innerHTML = ''

    if (invalidImageType(file)) {
        itemFormErrors.innerHTML =
            'The file selected is not supported. Only png, gif and jpg images are supported.'
        thumbnail.src = ''
        image.value = ''
        return
    }

    const reader = new FileReader()

    reader.addEventListener('load', () => {
        thumbnail.addEventListener('load', () => {
            if (invalidImageSize(thumbnail)) {
                itemFormErrors.innerHTML =
                    'The image selected should be 320x320 pixels.'
                thumbnail.src = ''
                image.value = ''
            }
        })
        thumbnail.src = reader.result
    })

    reader.readAsDataURL(file)
}

const invalidImageType = file => {
    return !['image/gif', 'image/png', 'image/jpeg'].includes(file.type)
}

const invalidImageSize = image => {
    return image.naturalWidth !== 320 || image.naturalHeight !== 320
}

const destroyItemForm = () => {
    image.removeEventListener('change', validateAndLoadThumbnail)
    itemFormCancel.removeEventListener('click', destroyItemForm)
    itemFormSave.removeEventListener('click', validateAndSaveItem)
    itemEditor.innerHTML = ''
}

const validateAndSaveItem = async ({ target }) => {
    const itemId = target.dataset.id
    if (!itemId && !image.value) {
        itemFormErrors.innerHTML = 'The image field is required.'
        return
    }
    if (description.value.trim().length === 0) {
        itemFormErrors.innerHTML = 'The description field is required.'
        return
    }

    const url = itemId ? `/items/${itemId}` : '/items'
    const method = itemId ? 'PUT' : 'POST'
    const data = new FormData(itemForm)
    if (!image.value) {
        data.delete('image')
    }

    const response = await fetch(url, { method, body: data })
    const { success, item } = await response.json()

    if (success) {
        if (itemId) {
            App.items = App.items.map(x => (x._id !== itemId ? x : item))
        } else {
            App.items.push(item)
        }
        renderItems()
        destroyItemForm()
    } else {
        alert('Oh no! Something happened while saving your item, try again later')
    }
}

document.addEventListener('DOMContentLoaded', () => {
    itemAdd.addEventListener('click', showItemForm)
    loadItems()
})


