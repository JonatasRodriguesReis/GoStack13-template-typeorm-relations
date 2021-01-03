import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });

    await this.ormRepository.save(product);

    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = await this.ormRepository.findOne({ name });

    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsByIds = products.map(product => product.id);

    const productsFound = await this.ormRepository.find({
      id: In(productsByIds),
    });

    return productsFound;
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsIds = products.map(p => p.id);
    const productsFound = await this.ormRepository.findByIds(productsIds);

    const serializedProducts = productsFound.map(p => ({
      ...p,
      quantity: products.filter(value => value.id === p.id)[0].quantity,
    }));

    await this.ormRepository.save(serializedProducts);

    return serializedProducts;
  }
}

export default ProductsRepository;
