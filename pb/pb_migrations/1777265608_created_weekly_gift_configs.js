/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != '' && parent = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation1032740943",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "parent",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2709200336",
        "max": null,
        "min": null,
        "name": "min",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number2641765001",
        "max": null,
        "min": null,
        "name": "max",
        "onlyInt": false,
        "presentable": false,
        "required": true,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_2000928290",
    "indexes": [],
    "listRule": "@request.auth.id != '' && parent = @request.auth.id",
    "name": "weekly_gift_configs",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && parent = @request.auth.id",
    "viewRule": "@request.auth.id != '' && parent = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2000928290");

  return app.delete(collection);
})
