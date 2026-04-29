/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2020696541")

  // 找到 status 字段并添加 'redeeming' 选项
  const fields = collection.fields
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].name === "status") {
      fields[i].values = ["available", "locked", "redeemed", "pending", "redeeming"]
      break
    }
  }

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2020696541")

  // 回滚：移除 'redeeming' 选项
  const fields = collection.fields
  for (let i = 0; i < fields.length; i++) {
    if (fields[i].name === "status") {
      fields[i].values = ["available", "locked", "redeemed", "pending"]
      break
    }
  }

  return app.save(collection)
})
