import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

import {
  // alias the core entity to not cause a naming conflict
  User as MedusaUser,
} from "@medusajs/medusa";
import { Role } from "./role";
import { Store } from "./store";

@Entity()
export class User extends MedusaUser {
  @Index("UserStoreId")
  @Column({ nullable: true })
  store_id: string | null;

  @Index("UserStoreHandle")
  @Column({ nullable: true })
  store_handle: string | null;

  @ManyToOne(() => Store, (store) => store.members)
  @JoinColumn({ name: "store_id", referencedColumnName: "id" })
  store: Store;

  @Index()
  @Column({ nullable: true })
  role_id: string | null;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: "role_id" })
  teamRole: Role;
}
