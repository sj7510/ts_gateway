import { Injectable, Inject } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { Page } from './page.mongo.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class PageService {
  constructor(
    @Inject('PAGE_REPOSITORY')
    private pageRepository: MongoRepository<Page>,
  ) {}

  save(page) {
    return this.pageRepository.save(page);
  }

  findOne(id) {
    return this.pageRepository.findOne(id);
  }

  findAll() {
    return this.pageRepository.find();
  }

  findOneByQuery(params) {
    return this.pageRepository.findOne({
      where: {
        ...params,
      },
    });
  }

  updateOne(id, page) {
    return this.pageRepository.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...page } },
      { upsert: true },
    );
  }
}
