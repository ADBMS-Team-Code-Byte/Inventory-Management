const express = require("express");
const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  restockProduct,
  restockMultipleProducts,
  useProduct,
  useMultipleProducts,
  deleteProduct,
} = require("../controllers/inventoryController");

const router = express.Router();

router.get("/get/all", getAllProducts);
router.get("/get/:productId", getProduct);
router.post("/add", addProduct);
router.patch("/update", updateProduct);
router.patch("/restock", restockProduct);
router.patch("/restock/multiple", restockMultipleProducts);
router.patch("/use", useProduct);
router.patch("/use/multiple", useMultipleProducts);
router.delete("/remove", deleteProduct);

module.exports = router;
