/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3700123456")

  // add field
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "number141232975",
    "max": null,
    "min": null,
    "name": "weeklyLimit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number2809440490",
    "max": null,
    "min": null,
    "name": "dailyLimit",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3700123456")

  // remove field
  collection.fields.removeById("number141232975")

  // remove field
  collection.fields.removeById("number2809440490")

  return app.save(collection)
})
