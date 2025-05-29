import { MongoRepository } from 'typeorm';
import { Injectable, Inject } from '@nestjs/common';
import { User } from './user.mongo.entity';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: MongoRepository<User>,
  ) {}

  createOrSave(user: any) {
    try {
      return this.userRepository.save(user);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}
