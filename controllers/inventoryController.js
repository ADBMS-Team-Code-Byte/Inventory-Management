const { Inventory } = require("../models");
const { Op } = require("sequelize");
require("dotenv").config();

//get all product details
const getAllProducts = async (req, res) => {
  try {
    const listofInventory = await Inventory.findAll({});
    res.json(listofInventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get  product details
const getProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId)
      return res.status(404).json({ error: "Missing Product Id" });
    const product = await Inventory.findOne({
      where: { productId },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    res
      .status(200)
      .json({ message: "Product Info  Retrieved successfully", product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//add product
const addProduct = async (req, res) => {
  const { productName, quantity, sellingPrice } = req.body;
  try {
    if (!productName || !quantity || !sellingPrice)
      return res.status(404).json({ error: "Missing Credentials" });

    //check if  product  exists
    const existingProductName = await Inventory.findOne({
      where: { productName },
    });

    if (existingProductName)
      return res.status(400).json({ error: "Product Name already exists" });

    //create product
    const product = await Inventory.create({
      productName,
      quantity,
      sellingPrice,
    });
    return res
      .status(201)
      .json({ message: "Product added Successfully", product });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//restock product (increase quantity)
const restockProduct = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    if (!productId || !quantity)
      return res.status(404).json({ error: "Missing Credentials" });

    const product = await Inventory.findOne({
      where: { productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    //add to existing quantity
    const updatedProduct = await product.update({
      quantity: product.quantity + quantity,
    });

    return res
      .status(201)
      .json({ message: "Restocked successfully", updatedProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Restock multiple products
const restockMultipleProducts = async (req, res) => {
  const products = req.body;
  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty input for products" });
    }

    // Check if all products exist and are valid
    for (const { productId, quantity } of products) {
      if (!productId || !quantity) {
        return res.status(400).json({ error: "Invalid product data" });
      }

      const product = await Inventory.findOne({
        where: { productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Product with ID ${productId} not found` });
      }
    }

    // Restock the products
    for (const { productId, quantity } of products) {
      const product = await Inventory.findOne({
        where: { productId },
      });

      // Add to existing quantity
      await product.update({
        quantity: product.quantity + quantity,
      });
    }

    return res.status(200).json({ message: "Products restocked successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//use product stock(decrease quantity)
const useProduct = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    if (!productId || !quantity)
      return res.status(400).json({ error: "Missing Credentials" });

    const product = await Inventory.findOne({
      where: { productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if there's enough stock to use
    if (product.quantity < quantity) {
      return res
        .status(400)
        .json({
          error: `Not enough stock available , remaining stock: ${product.quantity} units`,
        });
    }

    let totalPrice = product.sellingPrice * quantity;

    // subtract from existing quantity
    const updatedProduct = await product.update({
      quantity: product.quantity - quantity,
    });

    totalPrice = Number(totalPrice.toFixed(2));

    return res.status(200).json({
      message: "Product used successfully",
      product: updatedProduct,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// useMultipleProducts
const useMultipleProducts = async (req, res) => {
  const products = req.body;
  let totalUsedPrice = 0;

  try {
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty input" });
    }

    // Check if all products exist and have enough stock
    for (const { productId, quantity } of products) {
      if (!productId || !quantity) {
        return res.status(400).json({ error: "Invalid product data" });
      }

      const product = await Inventory.findOne({
        where: { productId },
      });

      if (!product) {
        return res
          .status(404)
          .json({ error: `Failed!,Product with ID ${productId} not found` });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          error: `Failed!,Not enough stock available for product with ID ${productId} , remaining stock count:${product.quantity}`,
        });
      }
      totalUsedPrice += product.sellingPrice * quantity;
    }

    for (const { productId, quantity } of products) {
      const product = await Inventory.findOne({
        where: { productId },
      });

      // subtract from existing quantity
      await product.update({
        quantity: product.quantity - quantity,
      });
    }
    totalUsedPrice = Number(totalUsedPrice.toFixed(2));
    return res
      .status(200)
      .json({ message: "Products used successfully", totalUsedPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//update product details
const updateProduct = async (req, res) => {   
  const { productId, productName, quantity, sellingPrice } = req.body;

  try {
    if (!productId) return res.status(404).json({ error: "Product Id is required" });

    // Check if the product exists
    const product = await Inventory.findOne({
      where: { productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if product name is already used
    if (productName) {
      const existingProductName = await Inventory.findOne({
        where: { productName, productId: { [Op.ne]: productId } }, 
      });

      if (existingProductName) {
        return res
          .status(400)
          .json({ error: "Product Name already used" });
      }
    }


    // Create an object with the fields to be updated
    const updatedFields = {};
    if (productName) updatedFields.productName = productName;
    if (quantity) updatedFields.quantity = quantity;
    if (sellingPrice) updatedFields.sellingPrice = sellingPrice;

    // Update product details
    await Inventory.update(updatedFields, {
      where: { productId },
    });

    const updatedProduct = await Inventory.findOne({
      where: { productId },
    });

    return res
      .status(200)
      .json({ message: "Product details updated successfully", updatedProduct });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//remove product
const deleteProduct = async (req, res) => {
  const { productId } = req.body;

  try {
    if (!productId)
      return res.status(400).json({ error: "Missing Credentials" });

    const product = await Inventory.findOne({
      where: { productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const response = await fetch(
      `${process.env.ORDERS_API}/check/product/${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseData = await response.json();

    if (response.status !== 200) {
      return res.status(response.status).json({ error: responseData.error });
    }

    const { hasCurrentOrders, orderIds } = responseData;

    if (hasCurrentOrders) {
      return res
        .status(400)
        .json({ error: "Failed! ,Product is used in pending orders" ,orderIds});
    }

    await product.destroy();

    return res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  restockProduct,
  restockMultipleProducts,
  useProduct,
  useMultipleProducts,
  deleteProduct,
};
