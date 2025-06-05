import {
  Column,
  ObjectId,
  ObjectIdColumn,
  CreateDateColumn,
  Entity,
} from 'typeorm';

// 物料内容表
@Entity()
export class DeployTestConfig {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ default: null })
  contain: string;

  @CreateDateColumn()
  createTime: string;

  @Column()
  pageId: string;
}
