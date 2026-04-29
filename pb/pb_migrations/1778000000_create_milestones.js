/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != ''",
    "deleteRule": "@request.auth.id != '' && child = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
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
        "collectionId": "pbc_651988227",
        "hidden": false,
        "id": "relationchildmilestone",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "child",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "texttitlemilestone",
        "max": 0,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "textdescmilestone",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "texticonmilestone",
        "max": 0,
        "min": 0,
        "name": "icon",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "textcolormilestone",
        "max": 0,
        "min": 0,
        "name": "color",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "texttypemilestone",
        "max": 0,
        "min": 0,
        "name": "milestone_type",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "dateoccurmilestone",
        "max": "",
        "min": "",
        "name": "occurredAt",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_milestones123",
    "indexes": [],
    "listRule": "@request.auth.id != ''",
    "name": "milestones",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != '' && child = @request.auth.id",
    "viewRule": "@request.auth.id != ''"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_milestones123");
  if (collection) {
    return app.delete(collection);
  }
});
