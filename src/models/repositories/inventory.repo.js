const inventoryModel = require('../inventory.model.js')

const insertInventory = async ({
  productStock,
  productId,
  shopId,
  location,
}) => {
  return await inventoryModel.create({
    inventory_productId: productId,
    inventory_shopId: shopId,
    inventory_location: location,
    inventory_stock: productStock,
  })
}

module.exports = {
  insertInventory,
}
