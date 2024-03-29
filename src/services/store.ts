import {
  FindConfig,
  Store,
  User,
  buildQuery,
  StoreService as MedusaStoreService,
  MedusaContainer,
} from "@medusajs/medusa";
import { MedusaError } from "medusa-core-utils";
import { Lifetime } from "awilix";

class StoreService extends MedusaStoreService {
  // The default life time for a core service is SINGLETON
  static LIFE_TIME = Lifetime.TRANSIENT;

  protected readonly loggedInUser_: User | null;

  constructor(container) {
    // @ts-expect-error prefer-rest-params
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);

    try {
      this.loggedInUser_ = container.loggedInUser;
    } catch (e) {
      // avoid errors when backend first runs
    }
  }

  /**
   * Create a store for a particular user. It mainly used from the event BeforeInsert to create a store
   * for the user that is being inserting.
   * @param user
   */
  // public async createForUser(user: User): Promise<Store | void> {
  //   if (user.store_id) {
  //     return;
  //   }
  //   const store = StoreRepository.create() as Store;
  //   return StoreRepository.save(store);
  // }

  async retrieve(
    config?: FindConfig<Store>,
    container?: MedusaContainer
  ): Promise<Store> {
    if (
      !this.loggedInUser_
      // || this.loggedInUser_?.role === "admin"
    ) {
      // const logger = container.resolve<Logger>("logger");

      // logger.info("Starting loader...");
      console.log("Store: " + this.loggedInUser_?.store_id);
      return super.retrieve(config);
    }

    return await this.retrieveForLoggedInUser(config);
  }

  async retrieveForLoggedInUser(
    config?: FindConfig<Store>,
    container?: MedusaContainer
  ) {
    const storeRepo = this.activeManager_.withRepository(this.storeRepository_);
    // const query = buildQuery({
    //   ...config,
    //   relations: [...config.relations, "members"],
    //   where: {
    //     id: this.loggedInUser_.store_id,
    //   },
    // });

    // const store = await storeRepo.findOne(query);
    const store = await storeRepo.findOne({
      ...config,
      relations: [...config.relations, "members"],
      where: {
        id: this.loggedInUser_.store_id,
      },
    });

    // console.log(this.loggedInUser_?.store_id);
    console.log(JSON.stringify(store));

    if (!store) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Store does not exist"
      );
    }

    return store;
  }
}

export default StoreService;
