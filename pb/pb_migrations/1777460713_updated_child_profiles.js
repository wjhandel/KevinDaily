/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_651988227")

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "file164671544666",
    "maxSelect": 0,
    "maxSize": 0,
    "mimeTypes": null,
    "name": "avatar",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": null,
    "type": "file"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_651988227")

  // remove field
  collection.fields.removeById("file164671544666")

  return app.save(collection)
})
