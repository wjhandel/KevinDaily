/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "",
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
        "cascadeDelete": false,
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
        "cascadeDelete": true,
        "collectionId": "_pb_users_auth_",
        "help": "",
        "hidden": false,
        "id": "relation2375276105",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "user",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2710109796",
        "max": 0,
        "min": 0,
        "name": "nickname",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date852947741",
        "max": "",
        "min": "",
        "name": "birthDate",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select3343321666",
        "maxSelect": 1,
        "name": "gender",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "boy",
          "girl",
          "other"
        ]
      },
      {
        "exceptDomains": null,
        "help": "",
        "hidden": false,
        "id": "url742587758",
        "name": "avatarUrl",
        "onlyDomains": null,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "url"
      },
      {
        "help": "",
        "hidden": false,
        "id": "number666537513",
        "max": null,
        "min": null,
        "name": "points",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      }
    ],
    "id": "pbc_651988227",
    "indexes": [],
    "listRule": "@request.auth.id != '' && (parent = @request.auth.id || user = @request.auth.id)",
    "name": "child_profiles",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && parent = @request.auth.id",
    "viewRule": "@request.auth.id != '' && (parent = @request.auth.id || user = @request.auth.id)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_651988227");

  return app.delete(collection);
})
