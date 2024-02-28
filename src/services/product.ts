import { Lifetime } from "awilix";
import {
  ProductService as MedusaProductService,
  Product,
  User,
} from "@medusajs/medusa";
import {
  CreateProductInput as MedusaCreateProductInput,
  ProductSelector as MedusaProductSelector,
  FindProductConfig,
} from "@medusajs/medusa/dist/types/product";

type CreateProductInput = {
  store_id?: string;
} & MedusaCreateProductInput;

type ProductSelector = {
  store_id?: string;
} & MedusaProductSelector;

class ProductService extends MedusaProductService {
  static LIFE_TIME = Lifetime.TRANSIENT;
  protected readonly loggedInUser_: User | null;
  protected readonly requestStoreId_: string | null;

  constructor(container) {
    // @ts-expect-error prefer-rest-params
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);

    try {
      this.requestStoreId_ = container.requestStoreId;
    } catch (e) {
      // avoid errors when backend first runs
    }

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  // async list(
  //   selector: ProductSelector,
  //   config?: FindProductConfig
  // ): Promise<Product[]> {
  //   if (this.loggedInUser_?.role === "admin") {
  //     return super.list(selector, config);
  //   }

  //   // Store scoping
  //   if (this.requestStoreId_) {
  //     selector.store_id = this.requestStoreId_;
  //   }
  //   // Admin scoping
  //   else if (!selector.store_id && this.loggedInUser_?.store_id) {
  //     selector.store_id = this.loggedInUser_.store_id;
  //   }

  //   return await super.list(selector, config);
  // }
  async list(
    selector: ProductSelector,
    config?: FindProductConfig
  ): Promise<Product[]> {
    console.log("listing");
    // console.log(selector.)
    if (!selector.store_id && this.loggedInUser_?.store_id) {
      selector.store_id = this.loggedInUser_.store_id;
    }

    config.select?.push("store_id");

    config.relations?.push("store");
    console.log("listing 2");

    return await super.list(selector, config);
  }

  async listAndCount(
    selector: ProductSelector,
    config?: FindProductConfig
  ): Promise<[Product[], number]> {
    // if (this.loggedInUser_?.role === "admin") {
    //   return super.listAndCount(selector, config);
    // }

    // Store scoping
    if (this.requestStoreId_) {
      selector.store_id = this.requestStoreId_;
    }
    // Admin scoping
    else if (!selector.store_id && this.loggedInUser_?.store_id) {
      selector.store_id = this.loggedInUser_.store_id;
    }

    // console.log(selector.store_id);
    config.select?.push("store_id");

    config.relations?.push("store");

    return await super.listAndCount(selector, config);
  }

  async retrieve(
    productId: string,
    config?: FindProductConfig
  ): Promise<Product> {
    console.log("retrieving");
    config.relations = [...(config.relations || []), "store"];

    const product = await super.retrieve(productId, config);

    console.log(product.handle);

    if (
      product.store?.id &&
      this.loggedInUser_?.store_id &&
      product.store.id !== this.loggedInUser_.store_id
    ) {
      // Throw error if you don't want a product to be accessible to other stores
      throw new Error("Product does not exist in store.");
    }

    return product;
  }

  async create(productObject: CreateProductInput): Promise<Product> {
    // console.log(productObject.status);
    // console.log("ID: " + this.loggedInUser_?.store_id);
    // console.log("HANDLE: " + productObject?.handle);
    if (!productObject.store_id && this.loggedInUser_?.store_id) {
      productObject.store_id = this.loggedInUser_.store_id;
    }

    return await super.create(productObject);
  }
}

export default ProductService;
